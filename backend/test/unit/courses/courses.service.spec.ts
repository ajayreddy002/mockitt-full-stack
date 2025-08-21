import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../../../src/courses/courses.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CourseCategory, CourseLevel } from '@prisma/client';

describe('CoursesService', () => {
  let service: CoursesService;
  let prismaService: PrismaService;

  const mockCourse = {
    id: 'course-123',
    title: 'React Fundamentals',
    description: 'Learn React basics',
    category: CourseCategory.FRONTEND_DEVELOPMENT,
    level: CourseLevel.BEGINNER,
    isPremium: false,
    isPublished: true,
    estimatedHours: 10,
    price: 0,
    modules: [
      {
        id: 'module-1',
        title: 'Introduction',
        lessons: [{ id: 'lesson-1', title: 'Getting Started' }],
        quizzes: [],
        assignments: [],
      },
    ],
    enrollments: [{ id: 'enrollment-1' }],
    reviews: [{ rating: 4 }, { rating: 5 }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: PrismaService,
          useValue: {
            course: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            enrollment: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              // ✅ Add the missing update method
              update: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            // ✅ Add lesson mock to fix spyOn error
            lesson: {
              findUnique: jest.fn(),
            },
            // ✅ Add lessonProgress mock
            lessonProgress: {
              upsert: jest.fn(),
              filter: jest.fn(),
            },
            // ✅ Add module mock
            module: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getAllCourses', () => {
    it('should return courses with pagination and stats', async () => {
      const filters = {
        category: CourseCategory.FRONTEND_DEVELOPMENT,
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(prismaService.course, 'findMany')
        .mockResolvedValue([mockCourse as any]);
      jest.spyOn(prismaService.course, 'count').mockResolvedValue(1);

      const result = await service.getAllCourses(filters);

      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].averageRating).toBe(4.5);
      expect(result.courses[0].enrollmentCount).toBe(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getCourseById', () => {
    it('should return course with details', async () => {
      jest
        .spyOn(prismaService.course, 'findUnique')
        .mockResolvedValue(mockCourse as any);

      const result = await service.getCourseById('course-123');

      expect(result.id).toBe('course-123');
      expect(result.averageRating).toBe(4.5);
      expect(result.enrollmentCount).toBe(1);
    });

    it('should throw NotFoundException for non-existent course', async () => {
      jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue(null);

      await expect(service.getCourseById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('enrollUser', () => {
    it('should enroll user in free course successfully', async () => {
      const mockEnrollment = {
        id: 'enrollment-123',
        userId: 'user-123',
        courseId: 'course-123',
        enrolledAt: new Date(),
        progressPercent: 0,
        course: {
          id: 'course-123',
          title: 'React Fundamentals',
          description: 'Learn React basics',
          level: CourseLevel.BEGINNER,
          category: CourseCategory.FRONTEND_DEVELOPMENT,
        },
      };

      jest.spyOn(prismaService.course, 'findUnique').mockResolvedValue({
        ...(mockCourse as any),
        isPremium: false,
      });
      jest
        .spyOn(prismaService.enrollment, 'findUnique')
        .mockResolvedValue(null);
      jest
        .spyOn(prismaService.enrollment, 'create')
        .mockResolvedValue(mockEnrollment as any);

      const result = await service.enrollUser('course-123', 'user-123');

      expect(result.success).toBe(true);
      expect(result.enrollment.id).toBe('enrollment-123');
    });

    it('should throw ConflictException for already enrolled user', async () => {
      const existingEnrollment = {
        id: 'enrollment-123',
        userId: 'user-123',
        courseId: 'course-123',
      };

      jest
        .spyOn(prismaService.course, 'findUnique')
        .mockResolvedValue(mockCourse as any);
      jest
        .spyOn(prismaService.enrollment, 'findUnique')
        .mockResolvedValue(existingEnrollment as any);

      await expect(
        service.enrollUser('course-123', 'user-123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateLessonProgress', () => {
    it('should update lesson progress successfully', async () => {
      const mockLesson = {
        id: 'lesson-123',
        module: {
          courseId: 'course-123',
          course: mockCourse,
        },
      };

      const mockEnrollment = {
        id: 'enrollment-123',
        userId: 'user-123',
        courseId: 'course-123',
      };

      const mockLessonProgress = {
        id: 'progress-123',
        isCompleted: true,
        timeSpent: 300,
        completedAt: new Date(),
      };

      // ✅ Fix: Use the properly mocked prismaService
      jest
        .spyOn(prismaService.lesson, 'findUnique')
        .mockResolvedValue(mockLesson as any);
      jest
        .spyOn(prismaService.enrollment, 'findUnique')
        .mockResolvedValue(mockEnrollment as any);
      jest
        .spyOn(prismaService.lessonProgress, 'upsert')
        .mockResolvedValue(mockLessonProgress as any);

      const result = await service.updateLessonProgress(
        'user-123',
        'lesson-123',
        {
          isCompleted: true,
          timeSpent: 300,
        },
      );

      expect(result.isCompleted).toBe(true);
      expect(result.timeSpent).toBe(300);
    });

    it('should throw NotFoundException for non-existent lesson', async () => {
      jest.spyOn(prismaService.lesson, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateLessonProgress('user-123', 'non-existent', {
          isCompleted: true,
          timeSpent: 300,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
