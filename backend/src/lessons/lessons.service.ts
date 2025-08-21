// backend/src/lessons/lessons.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LessonProgressDto } from 'src/courses/dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findByIdWithContext(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId as any },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId },
                  select: {
                    id: true,
                    enrolledAt: true,
                    progressPercent: true, // ✅ Use progressPercent from schema
                  },
                },
                modules: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    lessons: {
                      orderBy: { orderIndex: 'asc' },
                      select: {
                        id: true,
                        title: true,
                        duration: true,
                        orderIndex: true,
                        isRequired: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        progress: {
          // ✅ This will now be included correctly
          where: { userId },
          select: {
            id: true,
            isCompleted: true,
            timeSpent: true,
            lastAccessedAt: true,
            progressPercentage: true,
          },
        },
        userNotes: {
          // ✅ This will now be included correctly
          where: { userId },
          select: {
            id: true,
            content: true,
            updatedAt: true,
          },
        },
      },
    });
    const isPremium = lesson?.module?.course?.isPremium || false;
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if user is enrolled in the course
    const enrollment = lesson.module.course.enrollments[0];
    if (isPremium && !enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Get user progress for this lesson
    const userProgress = lesson.progress[0] || null;
    const userNotes = lesson.userNotes[0] || null;

    return {
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      contentType: lesson.contentType,
      contentUrl: lesson.contentUrl,
      duration: lesson.duration,
      orderIndex: lesson.orderIndex,
      isRequired: lesson.isRequired,
      course: {
        id: lesson.module.course.id,
        title: lesson.module.course.title,
        modules: lesson.module.course.modules,
      },
      module: {
        id: lesson.module.id,
        title: lesson.module.title,
        description: lesson.module.description,
      },
      progress: userProgress,
      notes: userNotes?.content || '',
      enrollment: {
        enrolledAt: enrollment?.enrolledAt,
        overallProgress: enrollment?.progressPercent, // ✅ Use progressPercent
      },
    };
  }

  // ... other methods remain the same

  async updateProgress(
    lessonId: any,
    userId: string,
    progressData: LessonProgressDto,
  ) {
    // Get enrollment ID first
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
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

    if (!lesson || !lesson.module.course.enrollments[0]) {
      throw new NotFoundException('Lesson not found or access denied');
    }

    const enrollmentId = lesson.module.course.enrollments[0].id;

    // ✅ Use the correct unique constraint
    // backend/src/courses/courses.service.ts (line 343)
    // ✅ Fixed - Include ALL required fields
    const progress = await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        progressPercentage: progressData.progressPercentage || 0,
        timeSpent: progressData.timeSpent || 0,
        isCompleted: progressData.progressPercentage >= 100,
        lastAccessedAt: new Date(),
        completedAt: progressData.progressPercentage >= 100 ? new Date() : null,
      },
      create: {
        // ✅ Include ALL required scalar fields
        userId, // String
        lessonId, // String
        enrollmentId, // String
        progressPercentage: progressData.progressPercentage || 0,
        timeSpent: progressData.timeSpent || 0,
        isCompleted: progressData.progressPercentage >= 100,
        lastAccessedAt: new Date(),
        completedAt: progressData.progressPercentage >= 100 ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update course enrollment progress
    await this.updateCourseProgress(lesson.module.courseId, userId);

    return progress;
  }

  async markComplete(lessonId: any, userId: string) {
    // Get enrollment ID
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
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
    const isPremium = lesson?.module?.course?.isPremium || false;
    if (!lesson || (isPremium && !lesson.module.course.enrollments[0])) {
      throw new NotFoundException('Lesson not found or access denied');
    }

    const enrollmentId = lesson.module.course.enrollments[0].id;

    const progress = await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          // ✅ Correct constraint usage
          userId,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        progressPercentage: 100,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      },
      create: {
        user: { connect: { id: userId } }, // ✅ Use connect syntax
        lesson: { connect: { id: lessonId } }, // ✅ Use connect syntax
        enrollment: { connect: { id: enrollmentId } }, // ✅ Use connect syntax
        isCompleted: true,
        progressPercentage: 100,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
        timeSpent: 0,
      },
    });

    await this.updateCourseProgress(lesson.module.courseId, userId);
    return progress;
  }

  async trackTimeSpent(lessonId: any, userId: string, timeSpent: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
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
    // Get enrollment ID first
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        course: {
          modules: {
            some: {
              lessons: {
                some: { id: lessonId },
              },
            },
          },
        },
      },
      select: { id: true, course: true },
    });
    console.log('Enrollment:', lesson.module.course.isPremium);
    const isPremium = lesson?.module?.course?.isPremium || false;
    if (isPremium && !enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const progress = await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        timeSpent: {
          increment: timeSpent,
        },
        lastAccessedAt: new Date(),
      },
      create: {
        timeSpent,
        lastAccessedAt: new Date(),
        progressPercentage: 0,
        isCompleted: false,
        user: { connect: { id: userId } }, // ✅ Use connect syntax
        lesson: { connect: { id: lessonId } }, // ✅ Use connect syntax
        enrollment: { connect: { id: enrollment?.id } }, // ✅ Use connect syntax
      },
    });

    return progress;
  }

  async getUserNotes(lessonId: any, userId: string) {
    const notes = await this.prisma.userLessonNotes.findUnique({
      where: {
        userId_lessonId: {
          // ✅ Correct constraint
          userId,
          lessonId,
        } as any,
      },
    });

    return notes || { content: '', updatedAt: null };
  }

  async updateUserNotes(lessonId: any, userId: string, content: string) {
    const notes = await this.prisma.userLessonNotes.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        content,
        user: { connect: { id: userId } }, // ✅ Only connect syntax
        lesson: { connect: { id: lessonId as string } }, // ✅ Only connect syntax
      }, // ✅ Remove the 'as any' - it's not needed now
    });

    return notes;
  }

  private async updateCourseProgress(courseId: string, userId: string) {
    const courseStats = await this.prisma.lesson.findMany({
      where: {
        module: {
          courseId,
        },
      },
      include: {
        progress: {
          where: { userId },
        },
      },
    });

    const totalLessons = courseStats.length;
    const completedLessons = courseStats.filter(
      (lesson) => lesson.progress[0]?.isCompleted,
    ).length;

    const overallProgress =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    // // ✅ Convert to Decimal for Prisma
    (await this.prisma.enrollment.updateMany({
      where: {
        courseId,
        userId,
      },
      data: {
        progressPercent: overallProgress, // ✅ Use Prisma.Decimal
      },
    })) as any;
  }
  async getLessonNavigation(lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId },
                  select: { id: true },
                },
                modules: {
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    lessons: {
                      orderBy: { orderIndex: 'asc' },
                      select: {
                        id: true,
                        title: true,
                        orderIndex: true,
                        progress: {
                          where: { userId },
                          select: { isCompleted: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    console.log('Lesson:', lesson);
    if (!lesson || lesson.module.course.isPremium) {
      if (!lesson || !lesson.module.course.enrollments[0]) {
        throw new NotFoundException('Lesson not found or access denied');
      }
    }

    // Flatten all lessons across modules to find previous/next
    const allLessons = lesson.module.course.modules
      .flatMap((module) =>
        module.lessons.map((l) => ({
          ...l,
          moduleId: module.id,
          moduleTitle: module.title,
          moduleOrderIndex: module.orderIndex,
        })),
      )
      .sort((a, b) => {
        if (a.moduleOrderIndex !== b.moduleOrderIndex) {
          return a.moduleOrderIndex - b.moduleOrderIndex;
        }
        return a.orderIndex - b.orderIndex;
      });

    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

    return {
      previous: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
      next:
        currentIndex < allLessons.length - 1
          ? allLessons[currentIndex + 1]
          : null,
      current: allLessons[currentIndex],
      totalLessons: allLessons.length,
      currentPosition: currentIndex + 1,
    };
  }
  async getLessonQuiz(lessonId: string, userId: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        lessonId,
        status: 'PUBLISHED',
      },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            // options: {
            //   orderBy: { orderIndex: 'asc' },
            // },
          },
        },
        attempts: {
          where: { userId },
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!quiz) {
      return null;
    }

    return {
      ...quiz,
      lastAttempt: quiz.attempts[0] || null,
      attemptsUsed: quiz.attempts.length,
    };
  }
}
