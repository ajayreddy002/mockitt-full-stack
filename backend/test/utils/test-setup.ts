// Global test setup
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  process.env.DATABASE_URL =
    'postgresql://test:test@localhost:5432/mockitt_test';
});

afterAll(async () => {
  // Cleanup after all tests
});

// ✅ Mock AiService
jest.mock('../../src/ai/ai.service', () => ({
  AiService: jest.fn().mockImplementation(() => ({
    generatePersonalizedQuestions: jest.fn().mockResolvedValue({
      questions: [
        {
          id: 'question-1',
          question: 'What is React?',
          type: 'technical',
          difficulty: 'medium',
          expectedDuration: 120,
          hints: ['Think about JavaScript library', 'User interfaces'],
          tags: ['frontend', 'react'],
        },
      ],
    }),
    analyzeResponseRealTime: jest.fn().mockResolvedValue({
      success: true,
      data: {
        confidence: 85,
        clarity: 90,
        pace: 75,
        keywordRelevance: 80,
        suggestions: ['Great technical knowledge', 'Add more examples'],
        strengths: ['Clear communication', 'Good understanding'],
        improvementAreas: ['Add specific metrics', 'Include more details'],
      },
      timestamp: new Date().toISOString(),
      provider: 'gemini',
    }),
  })),
}));

// ✅ Mock StorageService
jest.mock('../../src/common/services/storage.service', () => ({
  StorageService: jest.fn().mockImplementation(() => ({
    generateFileKey: jest.fn().mockReturnValue('user-123/resume-1234.pdf'),
    uploadFile: jest
      .fn()
      .mockResolvedValue('https://mock-storage.com/user-123/resume-1234.pdf'),
    deleteFile: jest.fn().mockResolvedValue(true),
    getSignedDownloadUrl: jest
      .fn()
      .mockResolvedValue('https://mock-storage.com/signed-url/resume-1234.pdf'),
  })),
}));

// ✅ Mock AIProviderService
jest.mock('../../src/resumes/ai-provider.service', () => ({
  AIProviderService: jest.fn().mockImplementation(() => ({
    analyzeResume: jest.fn().mockResolvedValue({
      overallScore: 85,
      atsScore: 78,
      skillsFound: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
      skillsGaps: ['AWS', 'Docker', 'GraphQL'],
      strengths: ['Strong technical background', 'Good project experience'],
      improvements: [
        'Add more quantifiable achievements',
        'Include leadership experience',
      ],
      suggestions: [
        'Use action verbs to start bullet points',
        'Include metrics and numbers',
      ],
      analysisDate: new Date(),
      provider: 'gemini',
    }),
    getAvailableProviders: jest.fn().mockReturnValue({
      providers: [{ name: 'gemini', available: true, status: 'active' }],
    }),
  })),
}));

// ✅ Mock PDF parsing
jest.mock('pdf-parse', () => {
  return jest.fn().mockResolvedValue({
    text: 'John Doe\nSoftware Engineer\nExperience: 3 years\nSkills: JavaScript, React, Node.js',
    numpages: 1,
    numrender: 1,
    info: {},
    metadata: {},
    version: '1.0.0',
  });
});

// ✅ Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// ✅ Export common mocks for use in tests
export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({
    sub: 'user-123',
    email: 'test@example.com',
    role: 'STUDENT',
  }),
};

export const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    const config: Record<string, any> = {
      JWT_SECRET: 'test-secret-key',
      GEMINI_API_KEY: 'test-gemini-key',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/mockitt_test',
      MAX_FILE_SIZE: 10485760, // 10MB
      ALLOWED_FILE_TYPES: 'application/pdf,application/msword',
      NODE_ENV: 'test',
    };
    return config[key] ?? defaultValue;
  }),
};

export const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};
