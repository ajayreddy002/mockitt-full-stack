import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async getQuizById(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId, status: 'PUBLISHED' },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            points: true,
            orderIndex: true,
            difficulty: true,
            // Don't include correctAnswer in client response
          },
        },
        module: {
          select: { id: true, title: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async getUserAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        score: true,
        maxScore: true,
        passed: true,
        startedAt: true,
        completedAt: true,
        timeSpent: true,
        attemptNumber: true,
      },
    });
  }

  async startAttempt(userId: string, quizId: string) {
    // Check if quiz exists and is published
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, status: 'PUBLISHED' },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found or not available');
    }

    // Check attempt limits
    const existingAttempts = await this.prisma.quizAttempt.count({
      where: { userId, quizId },
    });

    if (existingAttempts >= quiz.maxAttempts) {
      throw new BadRequestException('Maximum attempts reached');
    }

    // Calculate max score
    const questions = await this.prisma.question.findMany({
      where: { quizId },
      select: { points: true },
    });

    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

    // Create attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        maxScore,
        attemptNumber: existingAttempts + 1,
        startedAt: new Date(),
      },
    });

    return attempt;
  }

  async submitAttempt(
    attemptId: string,
    responses: Array<{ questionId: string; answer: any }>,
  ) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: true,
        user: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Quiz already submitted');
    }

    // Get questions with correct answers
    const questions = await this.prisma.question.findMany({
      where: { quizId: attempt.quizId },
    });

    let totalScore = 0;
    const quizResponses = [];

    // Process each response
    for (const response of responses) {
      const question = questions.find((q) => q.id === response.questionId);
      if (!question) continue;

      const isCorrect = this.checkAnswer(question, response.answer);
      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      // Save response
      const quizResponse = await this.prisma.quizResponse.create({
        data: {
          attemptId,
          questionId: response.questionId,
          answer: response.answer,
          isCorrect,
          pointsEarned,
        },
      });

      quizResponses.push(quizResponse);
    }

    // Calculate if passed
    const percentage = (totalScore / attempt.maxScore) * 100;
    const passed = percentage >= attempt.quiz.passingScore;

    // Update attempt
    const updatedAttempt = await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score: totalScore,
        passed,
        completedAt: new Date(),
        timeSpent: Math.floor(
          (new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000,
        ),
      },
    });

    return {
      attempt: updatedAttempt,
      responses: quizResponses,
    };
  }

  async getAttemptResults(attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            allowReview: true,
          },
        },
        responses: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                correctAnswer: true,
                explanation: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    // Format responses for client
    const formattedResponses = attempt.responses.map((response) => ({
      questionId: response.questionId,
      question: response.question.text,
      userAnswer: response.answer,
      correctAnswer: response.question.correctAnswer,
      isCorrect: response.isCorrect,
      pointsEarned: response.pointsEarned,
      explanation: response.question.explanation,
    }));

    return {
      attempt: {
        id: attempt.id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        attemptNumber: attempt.attemptNumber,
        completedAt: attempt.completedAt,
      },
      responses: formattedResponses,
      quiz: attempt.quiz,
    };
  }

  private checkAnswer(question: any, userAnswer: any): boolean {
    const correctAnswer = question.correctAnswer;

    switch (question.type) {
      case 'MULTIPLE_CHOICE':
      case 'TRUE_FALSE':
        return userAnswer === correctAnswer;

      case 'MULTIPLE_SELECT':
        if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer))
          return false;
        return (
          userAnswer.length === correctAnswer.length &&
          userAnswer.every((answer) => correctAnswer.includes(answer))
        );

      case 'SHORT_ANSWER':
        // Simple case-insensitive comparison for now
        return (
          userAnswer?.toLowerCase().trim() ===
          correctAnswer?.toLowerCase().trim()
        );

      default:
        return false;
    }
  }
}
