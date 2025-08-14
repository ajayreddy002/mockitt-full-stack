import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CourseCategory, CourseLevel, Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async getAllCourses(filters: {
    category?: CourseCategory;
    level?: CourseLevel;
    isPremium?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      category,
      level,
      isPremium,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const where: Prisma.CourseWhereInput = {
      isPublished: true,
      ...(category && { category }),
      ...(level && { level }),
      ...(isPremium !== undefined && { isPremium }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          modules: {
            include: {
              lessons: true,
              quizzes: true,
              assignments: true,
            },
          },
          enrollments: {
            select: { id: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    // Calculate average rating and enrollment count
    const coursesWithStats = courses.map((course) => ({
      ...course,
      enrollmentCount: course.enrollments.length,
      averageRating:
        course.reviews.length > 0
          ? course.reviews.reduce((sum, review) => sum + review.rating, 0) /
            course.reviews.length
          : 0,
      totalLessons: course.modules.reduce(
        (sum, module) => sum + module.lessons.length,
        0,
      ),
      totalQuizzes: course.modules.reduce(
        (sum, module) => sum + module.quizzes.length,
        0,
      ),
      totalAssignments: course.modules.reduce(
        (sum, module) => sum + module.assignments.length,
        0,
      ),
      stats: {
        averageRating:
          course.reviews.length > 0
            ? course.reviews.reduce((sum, review) => sum + review.rating, 0) /
              course.reviews.length
            : 0,
        enrollmentCount: course.enrollments.length,
        totalDuration: course.estimatedHours,
        totalLessons: course.modules.reduce(
          (sum, module) => sum + module.lessons.length,
          0,
        ),
      },
      reviewCount: course.reviews.length,
      thumbnailUrl: course.thumbnailUrl,
      price: course.isPremium ? course.price : 0,
    }));

    return {
      courses: coursesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCourseById(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
            quizzes: {
              where: { status: 'PUBLISHED' },
            },
            assignments: {
              where: { status: 'PUBLISHED' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        enrollments: {
          select: { id: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      ...course,
      enrollmentCount: course.enrollments.length,
      averageRating:
        course.reviews.length > 0
          ? course.reviews.reduce((sum, review) => sum + review.rating, 0) /
            course.reviews.length
          : 0,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async enrollInCourse(userId: string, courseId: string, enrollmentData: any) {
    // Check if course exists and is published
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, isPublished: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found or not available');
    }

    // Check if user is already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('User already enrolled in this course');
    }

    // Check premium access
    if (course.isPremium) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });

      if (!user?.isPremium) {
        throw new BadRequestException(
          'Premium subscription required for this course',
        );
      }
    }

    // Create enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        progressPercent: 0,
      },
      include: {
        course: {
          select: { title: true },
        },
      },
    });

    return enrollment;
  }

  async getEnrolledCourses(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
        lessonProgress: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((enrollment) => ({
      ...enrollment,
      course: {
        ...enrollment.course,
        totalLessons: enrollment.course.modules.reduce(
          (sum, module) => sum + module.lessons.length,
          0,
        ),
        completedLessons: enrollment.lessonProgress.filter(
          (progress) => progress.isCompleted,
        ).length,
      },
    }));
  }

  async getCourseProgress(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        lessonProgress: {
          include: {
            lesson: {
              include: {
                module: true,
              },
            },
          },
        },
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
                quizzes: true,
                assignments: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );

    const completedLessons = enrollment.lessonProgress.filter(
      (progress) => progress.isCompleted,
    ).length;

    return {
      enrollment,
      progress: {
        totalLessons,
        completedLessons,
        progressPercent:
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
      },
    };
  }

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    progressData: { isCompleted: boolean; timeSpent?: number },
  ) {
    // Find user's enrollment for this lesson's course
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId as any },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('User not enrolled in this course');
    }

    // Update or create lesson progress
    const lessonProgress = await this.prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        isCompleted: progressData.isCompleted,
        timeSpent: progressData.timeSpent || 0,
        completedAt: progressData.isCompleted ? new Date() : null,
      },
      create: {
        enrollment: { connect: { id: enrollment.id } }, // ✅ Use connect syntax
        lesson: { connect: { id: lessonId } },
        isCompleted: progressData.isCompleted,
        timeSpent: progressData.timeSpent || 0,
        completedAt: progressData.isCompleted ? new Date() : null,
        user: { connect: { id: userId } },
      },
    });

    // Update overall course progress
    await this.updateCourseProgress(enrollment.id);

    return lessonProgress;
  }

  async getCourseModules(courseId: string) {
    return this.prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
        },
        quizzes: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'asc' },
        },
        assignments: {
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  private async updateCourseProgress(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        lessonProgress: true,
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) return;

    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );

    const completedLessons = enrollment.lessonProgress.filter(
      (progress) => progress.isCompleted,
    ).length;

    const progressPercent =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null,
      },
    });
  }
  async enrollUser(courseId: string, userId: string) {
    try {
      // Check if course exists and is published
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          isPublished: true,
          isPremium: true,
          title: true,
        },
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      if (!course.isPublished) {
        throw new ForbiddenException('Course is not available for enrollment');
      }

      // Check if user is already enrolled
      const existingEnrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (existingEnrollment) {
        throw new ConflictException('Already enrolled in this course');
      }

      // For premium courses, check if user has premium access
      if (course.isPremium) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { isPremium: true },
        });

        if (!user?.isPremium) {
          throw new ForbiddenException(
            'Premium subscription required for this course',
          );
        }
      }

      // Create enrollment
      const enrollment = await this.prisma.enrollment.create({
        data: {
          userId,
          courseId,
          enrolledAt: new Date(),
          progressPercent: 0,
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              level: true,
              category: true,
            },
          },
        },
      });

      return {
        success: true,
        message: `Successfully enrolled in ${course.title}`,
        enrollment,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to enroll in course');
    }
  }

  async getUserEnrollments(userId: string) {
    console.log('Fetching user enrollments for userId:', userId);
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            shortDescription: true,
            thumbnailUrl: true,
            level: true,
            category: true,
            estimatedHours: true,
            isPremium: true,
            isPublished: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async checkUserEnrollment(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    return {
      isEnrolled: !!enrollment,
      enrollment,
    };
  }

  async unenrollUser(courseId: string, userId: string) {
    try {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!enrollment) {
        throw new NotFoundException('Enrollment not found');
      }

      await this.prisma.enrollment.delete({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      return { success: true, message: 'Successfully unenrolled from course' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unenroll from course');
    }
  }
}
