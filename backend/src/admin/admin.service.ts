// backend/src/admin/admin.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CreateQuizDto,
  UpdateUserDto,
} from './dto';
import {
  ContentType,
  Question,
  QuestionType,
  Quiz,
  QuizDifficulty,
} from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard Analytics
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      completedCourses,
      totalQuizzes,
      quizCompletions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.course.count({ where: { isPublished: true } }),
      this.prisma.course.count({ where: { isPublished: false } }),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { completedAt: { not: null } } }),
      this.prisma.quiz.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.quizAttempt.count({ where: { passed: true } }),
    ]);

    // Get recent enrollments
    const recentEnrollments = await this.prisma.enrollment.findMany({
      take: 10,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        course: {
          select: { title: true },
        },
      },
    });

    // Get top performing courses
    const topCourses = await this.prisma.course.findMany({
      take: 5,
      include: {
        enrollments: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: {
        enrollments: {
          _count: 'desc',
        },
      },
    });

    const coursesWithStats = topCourses.map((course) => {
      const completed = course.enrollments.filter((e) => e.completedAt).length;
      const total = course.enrollments.length;
      return {
        id: course.id,
        title: course.title,
        enrollmentCount: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    return {
      totalUsers,
      activeUsers,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      completedCourses,
      totalQuizzes,
      quizCompletions,
      recentEnrollments: recentEnrollments.map((enrollment) => ({
        id: enrollment.id,
        user: enrollment.user,
        course: enrollment.course,
        enrolledAt: enrollment.enrolledAt.toISOString(),
      })),
      topCourses: coursesWithStats,
    };
  }

  async getAnalytics(filters: any) {
    const { startDate, endDate, type, courseId } = filters;

    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };

    switch (type) {
      case 'enrollments':
        return this.getEnrollmentAnalytics(dateFilter);
      case 'users':
        return this.getUserAnalytics(dateFilter);
      case 'courses':
        return this.getCourseAnalytics(courseId);
      default:
        return this.getOverallAnalytics(dateFilter);
    }
  }

  // Course Management
  async getCourses(filters: any = {}) {
    const { search, category, level, status, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = category;
    if (level) where.level = level;
    if (status) where.isPublished = status === 'published';

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          modules: {
            include: {
              lessons: true,
              quizzes: true,
            },
          },
          enrollments: true,
          reviews: true,
          _count: {
            select: {
              enrollments: true,
              reviews: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    const coursesWithStats = courses.map((course) => ({
      ...course,
      enrollmentCount: course._count.enrollments,
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
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
            quizzes: {
              include: {
                questions: true,
              },
              orderBy: { createdAt: 'asc' },
            },
            assignments: {
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        enrollments: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async createCourse(createCourseDto: CreateCourseDto) {
    const { modules, ...courseData } = createCourseDto;

    const course = await this.prisma.course.create({
      data: {
        ...courseData,
        modules: modules
          ? {
              create: modules.map((module, index) => ({
                ...module,
                orderIndex: index,
                lessons: module.lessons
                  ? {
                      create: module.lessons.map((lesson, lessonIndex) => ({
                        ...lesson,
                        orderIndex: lessonIndex,
                        contentType: lesson.contentType as ContentType,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    return course;
  }

  async updateCourse(courseId: string, updateCourseDto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: updateCourseDto,
      include: {
        modules: {
          include: {
            lessons: true,
            quizzes: true,
          },
        },
      },
    });
  }

  async deleteCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { enrollments: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.enrollments.length > 0) {
      throw new BadRequestException(
        'Cannot delete course with existing enrollments',
      );
    }

    return this.prisma.course.delete({
      where: { id: courseId },
    });
  }

  async toggleCoursePublication(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { isPublished: !course.isPublished },
    });
  }

  // Module Management
  async createModule(courseId: string, moduleData: any) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const moduleCount = await this.prisma.module.count({
      where: { courseId },
    });

    return this.prisma.module.create({
      data: {
        ...moduleData,
        courseId,
        orderIndex: moduleCount,
      },
      include: {
        lessons: true,
        quizzes: true,
      },
    });
  }

  async updateModule(moduleId: string, moduleData: any) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return this.prisma.module.update({
      where: { id: moduleId },
      data: moduleData,
      include: {
        lessons: true,
        quizzes: true,
      },
    });
  }

  async deleteModule(moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return this.prisma.module.delete({
      where: { id: moduleId },
    });
  }

  // Lesson Management
  async createLesson(moduleId: string, lessonData: any) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const lessonCount = await this.prisma.lesson.count({
      where: { moduleId },
    });

    return this.prisma.lesson.create({
      data: {
        ...lessonData,
        moduleId,
        orderIndex: lessonCount,
      },
    });
  }

  async updateLesson(lessonId: string, lessonData: any) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: lessonData,
    });
  }

  async deleteLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return this.prisma.lesson.delete({
      where: { id: lessonId },
    });
  }

  // Quiz Management
  async getQuizzes(filters: any = {}) {
    const { search, difficulty, status, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (difficulty) where.difficulty = difficulty;
    if (status) where.status = status;

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        include: {
          module: {
            include: {
              course: {
                select: { title: true },
              },
            },
          },
          questions: true,
          attempts: true,
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      quizzes: quizzes.map((quiz) => ({
        ...quiz,
        questionCount: quiz._count.questions,
        attemptCount: quiz._count.attempts,
        courseName: quiz.module.course.title,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getQuizById(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
        attempts: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { startedAt: 'desc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return quiz;
  }

  async createQuiz(createQuizDto: CreateQuizDto) {
    const { questions, ...quizData } = createQuizDto;

    const quiz = await this.prisma.quiz.create({
      data: {
        ...quizData,
        questions: questions
          ? {
              create: questions.map(
                (question, index) =>
                  ({
                    ...question,
                    orderIndex: index,
                    type: question.type as QuestionType,
                    difficulty: question.difficulty as QuizDifficulty,
                    tags: question.tags as string[],
                  }) as Question,
              ),
            }
          : undefined,
      } as unknown as Quiz,
      include: {
        questions: true,
      },
    });

    return quiz;
  }

  async updateQuiz(quizId: string, updateQuizDto: any) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    return this.prisma.quiz.update({
      where: { id: quizId },
      data: updateQuizDto,
      include: {
        questions: true,
      },
    });
  }

  async deleteQuiz(quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { attempts: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.attempts.length > 0) {
      throw new BadRequestException(
        'Cannot delete quiz with existing attempts',
      );
    }

    return this.prisma.quiz.delete({
      where: { id: quizId },
    });
  }

  // Question Management
  async addQuestion(quizId: string, questionData: any) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const questionCount = await this.prisma.question.count({
      where: { quizId },
    });

    return this.prisma.question.create({
      data: {
        ...questionData,
        quizId,
        orderIndex: questionCount,
      },
    });
  }

  async updateQuestion(questionId: string, questionData: any) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: questionData,
    });
  }

  async deleteQuestion(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.prisma.question.delete({
      where: { id: questionId },
    });
  }

  // User Management
  async getUsers(filters: any = {}) {
    const { search, role, isPremium, isActive, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (isPremium !== undefined) where.isPremium = isPremium === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isPremium: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              Enrollment: true,
              interviews: true,
              resumes: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => ({
        ...user,
        enrollmentCount: user._count.Enrollment,
        interviewCount: user._count.interviews,
        resumeCount: user._count.resumes,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isPremium: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        Enrollment: {
          include: {
            course: {
              select: { title: true },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        interviews: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        resumes: {
          select: {
            id: true,
            fileName: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isPremium: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async toggleUserPremium(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isPremium: !user.isPremium },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isPremium: true,
      },
    });
  }

  // Analytics Methods
  async getCourseAnalytics(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          include: {
            lessonProgress: true,
          },
        },
        modules: {
          include: {
            lessons: true,
            quizzes: {
              include: {
                attempts: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const totalEnrollments = course.enrollments.length;
    const completedEnrollments = course.enrollments.filter(
      (e) => e.completedAt,
    ).length;
    const completionRate =
      totalEnrollments > 0
        ? (completedEnrollments / totalEnrollments) * 100
        : 0;

    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0,
    );
    const avgProgressPercent =
      totalEnrollments > 0
        ? course.enrollments.reduce(
            (sum, enrollment) => sum + Number(enrollment.progressPercent),
            0,
          ) / totalEnrollments
        : 0;

    return {
      courseId,
      title: course.title,
      totalEnrollments,
      completedEnrollments,
      completionRate,
      totalLessons,
      avgProgressPercent,
      enrollmentTrend: [], // Add enrollment trend calculation
      lessonEngagement: [], // Add lesson engagement metrics
    };
  }

  async getUserActivity(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        Enrollment: {
          include: {
            course: {
              select: { title: true },
            },
            lessonProgress: true,
          },
          orderBy: { enrolledAt: 'desc' },
        },
        interviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        QuizAttempt: {
          include: {
            quiz: {
              select: { title: true },
            },
          },
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId,
      enrollments: user.Enrollment,
      recentInterviews: user.interviews,
      recentQuizAttempts: user.QuizAttempt,
      activitySummary: {
        totalEnrollments: user.Enrollment.length,
        completedCourses: user.Enrollment.filter((e) => e.completedAt).length,
        totalInterviews: user.interviews.length,
        totalQuizAttempts: user.QuizAttempt.length,
      },
    };
  }

  private async getEnrollmentAnalytics(dateFilter: any) {
    const enrollmentData = await this.prisma.enrollment.findMany({
      where: {
        enrolledAt: dateFilter,
      },
      include: {
        course: {
          select: { title: true, category: true },
        },
        user: {
          select: { id: true, role: true },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });

    // Group enrollments by date for trend analysis
    const enrollmentsByDate = enrollmentData.reduce(
      (acc, enrollment) => {
        const date = enrollment.enrolledAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            count: 0,
            courses: new Set(),
            categories: new Set(),
          };
        }
        acc[date].count++;
        acc[date].courses.add(enrollment.course.title);
        acc[date].categories.add(enrollment.course.category);
        return acc;
      },
      {} as Record<string, any>,
    );

    // Convert to array and calculate additional metrics
    const enrollmentTrend = Object.values(enrollmentsByDate).map(
      (day: any) => ({
        date: day.date,
        enrollments: day.count,
        uniqueCourses: day.courses.size,
        categories: Array.from(day.categories),
      }),
    );

    // Calculate enrollment metrics by category
    const enrollmentsByCategory = enrollmentData.reduce(
      (acc, enrollment) => {
        const category = enrollment.course.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calculate completion rates
    const completionStats = await this.prisma.enrollment.groupBy({
      by: ['courseId'],
      where: {
        enrolledAt: dateFilter,
      },
      _count: {
        id: true,
      },
      _sum: {
        progressPercent: true,
      },
    });

    const avgCompletionRate =
      completionStats.length > 0
        ? completionStats.reduce(
            (sum, stat) => sum + (Number(stat._sum.progressPercent) || 0),
            0,
          ) / completionStats.length
        : 0;

    return {
      totalEnrollments: enrollmentData.length,
      enrollmentTrend,
      enrollmentsByCategory,
      avgCompletionRate: Math.round(avgCompletionRate),
      peakEnrollmentDate: enrollmentTrend.reduce(
        (peak, current) =>
          current.enrollments > peak.enrollments ? current : peak,
        enrollmentTrend[0] || { date: null, enrollments: 0 },
      ),
      categoryDistribution: Object.entries(enrollmentsByCategory).map(
        ([category, count]) => ({
          category,
          count,
          percentage: Math.round((count / enrollmentData.length) * 100),
        }),
      ),
    };
  }

  private async getUserAnalytics(dateFilter: any) {
    // Get user registration data
    const users = await this.prisma.user.findMany({
      where: {
        createdAt: dateFilter,
      },
      select: {
        id: true,
        role: true,
        isPremium: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            Enrollment: true,
            interviews: true,
            resumes: true,
            QuizAttempt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group users by registration date
    const usersByDate = users.reduce(
      (acc, user) => {
        const date = user.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            registrations: 0,
            premiumUsers: 0,
            activeUsers: 0,
          };
        }
        acc[date].registrations++;
        if (user.isPremium) acc[date].premiumUsers++;
        if (user.isActive) acc[date].activeUsers++;
        return acc;
      },
      {} as Record<string, any>,
    );

    const registrationTrend = Object.values(usersByDate);

    // Calculate user activity metrics
    const userActivity = users.map((user) => ({
      userId: user.id,
      role: user.role,
      isPremium: user.isPremium,
      activityScore:
        user._count.Enrollment * 3 +
        user._count.interviews * 2 +
        user._count.resumes * 1 +
        user._count.QuizAttempt * 1,
      enrollments: user._count.Enrollment,
      interviews: user._count.interviews,
      resumes: user._count.resumes,
      quizAttempts: user._count.QuizAttempt,
    }));

    // Calculate user segments
    const userSegments = {
      highlyActive: userActivity.filter((u) => u.activityScore >= 10).length,
      moderatelyActive: userActivity.filter(
        (u) => u.activityScore >= 5 && u.activityScore < 10,
      ).length,
      lowActivity: userActivity.filter((u) => u.activityScore < 5).length,
      inactive: users.filter((u) => !u.isActive).length,
    };

    // Get retention data (users who were active in the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsersLast30Days = await this.prisma.user.count({
      where: {
        AND: [
          { createdAt: dateFilter },
          { updatedAt: { gte: thirtyDaysAgo } },
          { isActive: true },
        ],
      },
    });

    const retentionRate =
      users.length > 0
        ? Math.round((activeUsersLast30Days / users.length) * 100)
        : 0;

    // Role distribution
    const roleDistribution = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Premium conversion rate
    const premiumUsers = users.filter((u) => u.isPremium).length;
    const premiumConversionRate =
      users.length > 0 ? Math.round((premiumUsers / users.length) * 100) : 0;

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      premiumUsers,
      registrationTrend,
      userSegments,
      retentionRate,
      premiumConversionRate,
      roleDistribution: Object.entries(roleDistribution).map(
        ([role, count]) => ({
          role,
          count,
          percentage: Math.round((count / users.length) * 100),
        }),
      ),
      avgActivityScore:
        userActivity.length > 0
          ? Math.round(
              userActivity.reduce((sum, u) => sum + u.activityScore, 0) /
                userActivity.length,
            )
          : 0,
      topActiveUsers: userActivity
        .sort((a, b) => b.activityScore - a.activityScore)
        .slice(0, 10),
    };
  }

  private async getOverallAnalytics(dateFilter: any) {
    // Get comprehensive platform metrics
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalInterviews,
      totalQuizAttempts,
      totalResumes,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: dateFilter },
      }),
      this.prisma.course.count({
        where: { createdAt: dateFilter },
      }),
      this.prisma.enrollment.count({
        where: { enrolledAt: dateFilter },
      }),
      this.prisma.interview.count({
        where: { createdAt: dateFilter },
      }),
      this.prisma.quizAttempt.count({
        where: { startedAt: dateFilter },
      }),
      this.prisma.resume.count({
        where: { createdAt: dateFilter },
      }),
    ]);

    // Platform engagement metrics
    const engagementData = await this.prisma.user.findMany({
      where: { createdAt: dateFilter },
      select: {
        id: true,
        createdAt: true,
        _count: {
          select: {
            Enrollment: true,
            interviews: true,
            resumes: true,
            QuizAttempt: true,
          },
        },
      },
    });

    // Calculate daily active users trend
    const dailyActivity = await this.prisma.$queryRaw`
      SELECT 
        DATE(updated_at) as date,
        COUNT(DISTINCT id) as active_users
      FROM users 
      WHERE updated_at >= ${dateFilter.gte || new Date('1900-01-01')}
        AND updated_at <= ${dateFilter.lte || new Date()}
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `;

    // Feature adoption rates
    const featureAdoption = {
      interviews: {
        users: engagementData.filter((u) => u._count.interviews > 0).length,
        avgPerUser:
          engagementData.length > 0
            ? engagementData.reduce((sum, u) => sum + u._count.interviews, 0) /
              engagementData.length
            : 0,
      },
      courses: {
        users: engagementData.filter((u) => u._count.Enrollment > 0).length,
        avgPerUser:
          engagementData.length > 0
            ? engagementData.reduce((sum, u) => sum + u._count.Enrollment, 0) /
              engagementData.length
            : 0,
      },
      resumes: {
        users: engagementData.filter((u) => u._count.resumes > 0).length,
        avgPerUser:
          engagementData.length > 0
            ? engagementData.reduce((sum, u) => sum + u._count.resumes, 0) /
              engagementData.length
            : 0,
      },
      quizzes: {
        users: engagementData.filter((u) => u._count.QuizAttempt > 0).length,
        avgPerUser:
          engagementData.length > 0
            ? engagementData.reduce((sum, u) => sum + u._count.QuizAttempt, 0) /
              engagementData.length
            : 0,
      },
    };

    // Content performance metrics
    const coursePerformance = await this.prisma.course.findMany({
      where: { createdAt: dateFilter },
      select: {
        id: true,
        title: true,
        category: true,
        isPublished: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
        enrollments: {
          where: { completedAt: { not: null } },
          select: { id: true },
        },
      },
    });

    const courseStats = coursePerformance.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      enrollments: course._count.enrollments,
      completions: course.enrollments.length,
      completionRate:
        course._count.enrollments > 0
          ? Math.round(
              (course.enrollments.length / course._count.enrollments) * 100,
            )
          : 0,
      reviews: course._count.reviews,
    }));

    // Platform growth metrics
    const growthMetrics = {
      userGrowthRate: await this.calculateGrowthRate('user', dateFilter),
      enrollmentGrowthRate: await this.calculateGrowthRate(
        'enrollment',
        dateFilter,
      ),
      interviewGrowthRate: await this.calculateGrowthRate(
        'interview',
        dateFilter,
      ),
    };

    // Platform health score (composite metric)
    const healthScore = this.calculatePlatformHealthScore({
      userEngagement: featureAdoption,
      contentPerformance: courseStats,
      growthMetrics,
      totalUsers,
    });

    return {
      summary: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalInterviews,
        totalQuizAttempts,
        totalResumes,
      },
      dailyActivity,
      featureAdoption,
      coursePerformance: courseStats,
      growthMetrics,
      healthScore,
      topPerformingCourses: courseStats
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5),
      categoryPerformance: this.groupBy(courseStats, 'category'),
    };
  }

  // Helper method for calculating growth rates
  private async calculateGrowthRate(
    entity: string,
    dateFilter: any,
  ): Promise<number> {
    const tableName =
      entity === 'user'
        ? 'users'
        : entity === 'enrollment'
          ? 'enrollments'
          : 'interviews';
    const dateField = entity === 'enrollment' ? 'enrolled_at' : 'created_at';

    // This is a simplified calculation - you might want to make it more sophisticated
    const currentPeriodCount = await this.prisma.$queryRawUnsafe(
      `
      SELECT COUNT(*) as count 
      FROM ${tableName} 
      WHERE ${dateField} >= $1 AND ${dateField} <= $2
    `,
      dateFilter.gte,
      dateFilter.lte,
    );

    const previousPeriodStart = new Date(dateFilter.gte);
    previousPeriodStart.setDate(
      previousPeriodStart.getDate() -
        Math.ceil((dateFilter.lte - dateFilter.gte) / (1000 * 60 * 60 * 24)),
    );

    const previousPeriodCount = await this.prisma.$queryRawUnsafe(
      `
      SELECT COUNT(*) as count 
      FROM ${tableName} 
      WHERE ${dateField} >= $1 AND ${dateField} < $2
    `,
      previousPeriodStart,
      dateFilter.gte,
    );

    const current = Number((currentPeriodCount as any)[0]?.count || 0);
    const previous = Number((previousPeriodCount as any)[0]?.count || 0);

    return previous > 0
      ? Math.round(((current - previous) / previous) * 100)
      : 0;
  }

  // Helper method for calculating platform health score
  private calculatePlatformHealthScore(metrics: any): number {
    const { userEngagement, contentPerformance, growthMetrics, totalUsers } =
      metrics;

    // Weight different factors for health score (0-100)
    let score = 0;

    // User engagement (40% weight)
    const engagementScore =
      ((userEngagement.interviews.users / totalUsers) * 25 +
        (userEngagement.courses.users / totalUsers) * 25 +
        (userEngagement.resumes.users / totalUsers) * 25 +
        (userEngagement.quizzes.users / totalUsers) * 25) *
      100;
    score += Math.min(engagementScore, 40);

    // Content performance (30% weight)
    const avgCompletionRate =
      contentPerformance.length > 0
        ? contentPerformance.reduce(
            (sum: number, course: any) => sum + course.completionRate,
            0,
          ) / contentPerformance.length
        : 0;
    score += Math.min(avgCompletionRate * 0.3, 30);

    // Growth metrics (30% weight)
    const avgGrowthRate =
      (Math.max(growthMetrics.userGrowthRate, 0) +
        Math.max(growthMetrics.enrollmentGrowthRate, 0) +
        Math.max(growthMetrics.interviewGrowthRate, 0)) /
      3;
    score += Math.min(avgGrowthRate * 0.3, 30);

    return Math.round(Math.min(score, 100));
  }

  // Helper method for grouping data
  private groupBy(array: any[], key: string): Record<string, any> {
    return array.reduce((groups, item) => {
      const group = item[key];
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  }
}
