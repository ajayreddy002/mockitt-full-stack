/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/types/interview.ts - Create a shared types file
export type InterviewType = 'PRACTICE' | 'FULL_MOCK' | 'QUICK_PREP';
export type InterviewStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'company-specific';
  difficulty: 'easy' | 'medium' | 'hard';
  expectedDuration: number;
  hints: string[];
  tags: string[];
  followUpQuestions?: string[];
  role: string;
  industry: string;
}

export interface InterviewResponse {
  id: string;
  questionId: string;
  question: string;
  transcription?: string;
  audioUrl?: string;
  videoUrl?: string;
  duration: number;
  score?: number;
  analysis?: any;
  recordedAt: Date;
  sessionId: string;
}

// ✅ Single, consistent InterviewSession interface
export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  type: InterviewType;
  status: InterviewStatus;
  questions: InterviewQuestion[];
  settings: {
    recordVideo: boolean;
    recordAudio: boolean;
    enableHints: boolean;
    timePerQuestion: number;
    industry: string;
    role: string;
  };
  currentQuestionIndex: number;
  startTime?: Date;
  endTime?: Date;
  totalDuration: number;
  overallScore?: number;
  responses: InterviewResponse[];
  createdAt: Date;
}
