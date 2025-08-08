export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  industry?: string;
  role?: string;
  expectedDuration: number; // in seconds
  hints?: string[];
  followUpQuestions?: string[];
  tags?: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  type: 'practice' | 'full-mock' | 'quick-prep';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  startTime?: Date;
  endTime?: Date;
  totalDuration: number;
  settings: {
    recordVideo: boolean;
    recordAudio: boolean;
    enableHints: boolean;
    timePerQuestion: number;
    industry: string;
    role: string;
  };
  createdAt: Date;
}

export interface InterviewResponse {
  id: string;
  sessionId: string;
  questionId: string;
  audioUrl?: string;
  videoUrl?: string;
  transcription?: string;
  duration: number;
  confidence?: number;
  analysis?: {
    clarity: number;
    pace: number;
    fillerWords: number;
    keywordUsage: string[];
    suggestions: string[];
  };
  recordedAt: Date;
}

export interface InterviewAnalytics {
  sessionId: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  questionPerformance: {
    questionId: string;
    score: number;
    timeSpent: number;
    feedback: string;
  }[];
  progressComparison?: {
    previousSessions: string[];
    improvement: number;
    trends: string[];
  };
}
