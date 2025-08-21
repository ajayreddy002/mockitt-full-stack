import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import {
  CourseCategory,
  CourseLevel,
  InterviewType,
  UserRole,
} from '@prisma/client';

export const mockUsers = {
  student: {
    email: 'student@test.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.STUDENT,
    isPremium: false,
    isActive: true,
    profilePicture: 'https://example.com/default-profile.jpg',
    bio: 'Computer Science student',
  } as CreateUserDto,

  mentor: {
    email: 'mentor@test.com',
    password: 'MentorPass123!',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.MENTOR,
    isPremium: true,
    isActive: true,
    profilePicture: 'https://example.com/mentor-profile.jpg',
    bio: 'Senior Software Engineer',
  } as CreateUserDto,

  admin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isPremium: true,
    isActive: true,
    profilePicture: 'https://example.com/admin-profile.jpg',
    bio: 'Platform Administrator',
  } as CreateUserDto,
};

export const mockCourses = {
  frontendCourse: {
    title: 'Frontend Development Mastery',
    description: 'Complete guide to modern frontend development',
    shortDescription: 'Learn React, JavaScript, and modern web development',
    category: CourseCategory.FRONTEND_DEVELOPMENT,
    level: CourseLevel.INTERMEDIATE,
    isPremium: false,
    isPublished: true,
    estimatedHours: 25,
    price: 0,
    modules: [
      {
        title: 'React Fundamentals',
        description: 'Learn React basics',
        orderIndex: 1,
        lessons: [
          {
            title: 'Introduction to React',
            content: 'React is a JavaScript library...',
            orderIndex: 1,
          },
          {
            title: 'Components and JSX',
            content: 'Learn about React components...',
            orderIndex: 2,
          },
        ],
      },
    ],
  },

  premiumCourse: {
    title: 'System Design Interview Prep',
    description: 'Advanced system design concepts for senior roles',
    shortDescription: 'Master system design interviews',
    category: CourseCategory.BACKEND_DEVELOPMENT,
    level: CourseLevel.ADVANCED,
    isPremium: true,
    isPublished: true,
    estimatedHours: 40,
    price: 99.99,
  },
};

export const mockInterviewSessions = {
  technicalInterview: {
    title: 'Frontend Technical Interview',
    type: InterviewType.PRACTICE,
    settings: {
      recordVideo: true,
      recordAudio: true,
      enableHints: true,
      timePerQuestion: 120,
      industry: 'Technology',
      role: 'Frontend Developer',
    },
  },

  behavioralInterview: {
    title: 'Behavioral Interview Practice',
    type: InterviewType.QUICK_PREP,
    settings: {
      recordVideo: false,
      recordAudio: true,
      enableHints: true,
      timePerQuestion: 90,
      industry: 'Technology',
      role: 'Software Engineer',
    },
  },
};

export const mockInterviewQuestions = [
  {
    id: 'question-1',
    question: 'Explain the concept of virtual DOM in React',
    type: 'technical',
    difficulty: 'intermediate',
    expectedDuration: 120,
    hints: [
      'Think about performance optimization',
      'Consider DOM manipulation',
      'Explain the diffing algorithm',
    ],
    tags: ['react', 'frontend', 'performance'],
  },
  {
    id: 'question-2',
    question: 'Tell me about a challenging project you worked on',
    type: 'behavioral',
    difficulty: 'easy',
    expectedDuration: 180,
    hints: [
      'Use the STAR method',
      'Be specific about your role',
      'Mention the outcome',
    ],
    tags: ['behavioral', 'experience', 'problem-solving'],
  },
];

export const mockQuizData = {
  title: 'React Fundamentals Quiz',
  description: 'Test your React knowledge',
  questions: [
    {
      question: 'What is JSX?',
      options: [
        'A JavaScript extension',
        'A CSS framework',
        'A database',
        'A server technology',
      ],
      correctAnswer: 0,
      explanation: 'JSX is a syntax extension for JavaScript used in React',
    },
    {
      question: 'What is the purpose of useState hook?',
      options: [
        'To handle side effects',
        'To manage component state',
        'To optimize performance',
        'To handle routing',
      ],
      correctAnswer: 1,
      explanation: 'useState is used to add state to functional components',
    },
  ],
};
