// src/quizzes/quizzes.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Question, QuizStatus, QuestionType } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Get all published quizzes for a module with user's attempt history
  async getModuleQuizzes(moduleId: string, userId: string) {
    return this.prisma.quiz.findMany({
      where: {
        moduleId,
        status: QuizStatus.PUBLISHED,
      },
      include: {
        attempts: {
          where: { userId },
          orderBy: { startedAt: 'desc' },
          take: 3, // Last 3 attempts
          select: {
            id: true,
            score: true,
            passed: true,
            completedAt: true,
            attemptNumber: true,
          },
        },
        questions: {
          select: {
            id: true,
            points: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ✅ Get quiz by ID with user context
  async getQuizById(quizId: string, userId: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quizId,
        status: QuizStatus.PUBLISHED,
      },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId },
                  select: { id: true },
                },
              },
            },
          },
        },
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            points: true,
            // Don't expose correct answers
          },
          orderBy: { orderIndex: 'asc' },
        },
        attempts: {
          where: { userId },
          orderBy: { startedAt: 'desc' },
          take: 5,
          select: {
            id: true,
            score: true,
            passed: true,
            completedAt: true,
            attemptNumber: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found or not available');
    }

    // Check if user is enrolled in the course
    const isEnrolled = quiz.module.course.enrollments.length > 0;
    const userAttempts = await this.prisma.quizAttempt.count({
      where: { userId, quizId },
    });

    return {
      ...quiz,
      isEnrolled,
      userAttempts,
      attemptsRemaining: quiz.maxAttempts - userAttempts,
      canAttempt: isEnrolled && userAttempts < quiz.maxAttempts,
      maxScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
    };
  }

  // ✅ Get user's attempts for a specific quiz
  async getUserAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            maxAttempts: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  // ✅ Start a new quiz attempt with comprehensive validation
  async startAttempt(userId: string, quizId: string) {
    // Validate quiz exists and is published
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        id: quizId,
        status: QuizStatus.PUBLISHED,
      },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found or not available');
    }

    // Check if user is enrolled in the course
    if (quiz.module.course.enrollments.length === 0) {
      throw new ForbiddenException(
        'You must be enrolled in this course to take the quiz',
      );
    }

    // Check attempt limits
    const attemptCount = await this.prisma.quizAttempt.count({
      where: { userId, quizId },
    });

    if (attemptCount >= quiz.maxAttempts) {
      throw new ForbiddenException(
        `Maximum attempts (${quiz.maxAttempts}) reached`,
      );
    }

    // Get questions (randomized if needed)
    const questions = quiz.isRandomized
      ? await this.prisma.$queryRaw<Question[]>`
          SELECT * FROM "Question" 
          WHERE "quizId" = ${quizId} 
          ORDER BY random()
        `
      : await this.prisma.question.findMany({
          where: { quizId },
          orderBy: { orderIndex: 'asc' },
        });

    if (questions.length === 0) {
      throw new BadRequestException('Quiz has no questions');
    }

    // Calculate max possible score
    const maxScore = questions.reduce((total, q) => total + q.points, 0);

    // Create attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        maxScore,
        attemptNumber: attemptCount + 1,
        startedAt: new Date(),
      },
    });

    return {
      attemptId: attempt.id,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        passingScore: quiz.passingScore,
        timeLimit: quiz.timeLimit,
        allowReview: quiz.allowReview,
        showResults: quiz.showResults,
      },
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        points: q.points,
        // Don't expose correct answers
      })),
      attempt: {
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        maxScore: attempt.maxScore,
        startedAt: attempt.startedAt,
      },
    };
  }

  // ✅ Submit answer for a specific question (individual question answering)
  async answerQuestion(
    attemptId: string,
    questionId: string,
    answer: any,
    timeSpent?: number,
  ) {
    // Validate attempt exists and is active
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { quiz: true },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Quiz attempt already completed');
    }

    // Validate question belongs to this quiz
    const question = await this.prisma.question.findFirst({
      where: {
        id: questionId,
        quizId: attempt.quizId,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found in this quiz');
    }

    // Calculate if answer is correct
    const isCorrect = this.checkAnswer(question, answer);
    const pointsEarned = isCorrect ? question.points : 0;

    // Save/update response
    return this.prisma.quizResponse.upsert({
      where: {
        attemptId_questionId: { attemptId, questionId },
      },
      update: {
        answer,
        isCorrect,
        pointsEarned,
        timeSpent: timeSpent || 0,
      },
      create: {
        attemptId,
        questionId,
        answer,
        isCorrect,
        pointsEarned,
        timeSpent: timeSpent || 0,
      },
    });
  }

  // ✅ Submit entire quiz with bulk answers (from standalone controller)
  async submitAttempt(attemptId: string, responses: any[]) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: { questions: true },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Quiz attempt already completed');
    }

    // Process all responses
    for (const response of responses) {
      const question = attempt.quiz.questions.find(
        (q) => q.id === response.questionId,
      );
      if (question) {
        const isCorrect = this.checkAnswer(question, response.answer);
        const pointsEarned = isCorrect ? question.points : 0;

        await this.prisma.quizResponse.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId: response.questionId,
            },
          },
          update: {
            answer: response.answer,
            isCorrect,
            pointsEarned,
            timeSpent: response.timeSpent || 0,
          },
          create: {
            attemptId,
            questionId: response.questionId,
            answer: response.answer,
            isCorrect,
            pointsEarned,
            timeSpent: response.timeSpent || 0,
          },
        });
      }
    }

    // Finalize the attempt
    return this.finishAttempt(attemptId);
  }

  // ✅ Finish quiz attempt and calculate final score
  async finishAttempt(attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
        responses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Quiz attempt already completed');
    }

    // Calculate final score
    const totalScore = attempt.responses.reduce(
      (sum, response) => sum + (response.pointsEarned || 0),
      0,
    );

    const scorePercentage =
      attempt.maxScore > 0
        ? Math.round((totalScore / attempt.maxScore) * 100)
        : 0;

    const passed = scorePercentage >= attempt.quiz.passingScore;

    // Calculate time spent
    const timeSpent = attempt.responses.reduce(
      (sum, response) => sum + (response.timeSpent || 0),
      0,
    );

    // Update attempt with final results
    const completedAttempt = await this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score: totalScore,
        passed,
        completedAt: new Date(),
        timeSpent,
      },
      include: {
        quiz: true,
        responses: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                correctAnswer: true,
                explanation: true,
                points: true,
              },
            },
          },
        },
      },
    });

    // Return comprehensive results
    return {
      attempt: {
        id: completedAttempt.id,
        score: totalScore,
        maxScore: attempt.maxScore,
        scorePercentage,
        passed,
        timeSpent,
        completedAt: completedAttempt.completedAt,
        attemptNumber: completedAttempt.attemptNumber,
      },
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        passingScore: attempt.quiz.passingScore,
        showResults: attempt.quiz.showResults,
        allowReview: attempt.quiz.allowReview,
      },
      results: attempt.quiz.showResults
        ? {
            totalQuestions: attempt.quiz.questions.length,
            correctAnswers: attempt.responses.filter((r) => r.isCorrect).length,
            incorrectAnswers: attempt.responses.filter((r) => !r.isCorrect)
              .length,
            unansweredQuestions:
              attempt.quiz.questions.length - attempt.responses.length,
            detailedResponses: attempt.quiz.allowReview
              ? completedAttempt.responses.map((response) => ({
                  questionId: response.questionId,
                  questionText: response.question.text,
                  userAnswer: response.answer,
                  correctAnswer: response.question.correctAnswer,
                  isCorrect: response.isCorrect,
                  pointsEarned: response.pointsEarned,
                  explanation: response.question.explanation,
                }))
              : undefined,
          }
        : undefined,
    };
  }

  // ✅ Get detailed results for a completed attempt
  async getAttemptResults(attemptId: string, userId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
      },
      include: {
        quiz: true,
        responses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (!attempt.completedAt) {
      throw new BadRequestException('Quiz attempt not yet completed');
    }

    return this.formatAttemptResults(attempt);
  }

  // ✅ Get user's quiz attempt history
  async getUserQuizHistory(userId: string, quizId?: string) {
    const where = quizId ? { userId, quizId } : { userId };

    return this.prisma.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  // 🔧 Private helper methods
  private checkAnswer(question: Question, userAnswer: any): boolean {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        return (
          JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
        );

      case QuestionType.MULTIPLE_SELECT:
        const correctAnswers = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.sort()
          : [question.correctAnswer];
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer.sort()
          : [userAnswer];
        return JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);

      case QuestionType.SHORT_ANSWER:
        const correctText = String(question.correctAnswer).toLowerCase().trim();
        const userText = String(userAnswer).toLowerCase().trim();
        return correctText === userText;

      case QuestionType.FILL_IN_BLANK:
        if (Array.isArray(question.correctAnswer)) {
          return (
            JSON.stringify(question.correctAnswer) ===
            JSON.stringify(userAnswer)
          );
        }
        return (
          String(question.correctAnswer).toLowerCase() ===
          String(userAnswer).toLowerCase()
        );

      default:
        return false;
    }
  }

  private formatAttemptResults(attempt: any) {
    const scorePercentage =
      attempt.maxScore > 0
        ? Math.round((attempt.score / attempt.maxScore) * 100)
        : 0;

    return {
      attempt: {
        id: attempt.id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        scorePercentage,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt,
        attemptNumber: attempt.attemptNumber,
      },
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        passingScore: attempt.quiz.passingScore,
      },
      summary: {
        totalQuestions: attempt.responses.length,
        correctAnswers: attempt.responses.filter((r) => r.isCorrect).length,
        incorrectAnswers: attempt.responses.filter((r) => !r.isCorrect).length,
      },
    };
  }
}
