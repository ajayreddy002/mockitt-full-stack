import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  /* PUBLISHED quizzes for a module ------------------------------------*/
  getModuleQuizzes(moduleId: string) {
    return this.prisma.quiz.findMany({
      where: { moduleId, status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        passingScore: true,
        attempts: { where: { userId: undefined }, select: { id: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /* ───────────────── Quiz attempt flow ───────────────────────────────*/
  async startAttempt(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    // check attempts
    const count = await this.prisma.quizAttempt.count({
      where: { userId, quizId },
    });
    if (count >= quiz.maxAttempts)
      throw new ForbiddenException('No attempts left');

    const shuffledQuestions = quiz.isRandomized
      ? await this.prisma
          .$queryRaw`SELECT * FROM "Question" WHERE "quizId" = ${quizId} ORDER BY random()`
      : ((await this.prisma.question.findMany({
          where: { quizId },
          orderBy: { orderIndex: 'asc' },
        })) as any);

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        maxScore: shuffledQuestions.reduce((s, q) => s + q.points, 0),
        attemptNumber: count + 1,
      },
    });
    return { attemptId: attempt.id, quiz, questions: shuffledQuestions };
  }

  async answerQuestion(attemptId: string, questionId: string, answer: any) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    const isCorrect =
      JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
    return this.prisma.quizResponse.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      update: {
        answer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      },
      create: {
        attemptId,
        questionId,
        answer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      },
    });
  }

  async finishAttempt(attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { responses: true, quiz: true },
    });
    const score = attempt.responses.reduce((s, r) => s + r.pointsEarned, 0);
    const passed = score >= attempt.quiz.passingScore;
    return this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: { score, passed, completedAt: new Date() },
    });
  }
}
