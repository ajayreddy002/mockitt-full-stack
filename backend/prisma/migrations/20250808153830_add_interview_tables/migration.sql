-- CreateEnum
CREATE TYPE "public"."InterviewType" AS ENUM ('PRACTICE', 'FULL_MOCK', 'QUICK_PREP');

-- CreateEnum
CREATE TYPE "public"."InterviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('STUDENT', 'MENTOR', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resumes" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extractedText" TEXT,
    "analysisScore" DOUBLE PRECISION,
    "atsScore" DOUBLE PRECISION,
    "skillsFound" TEXT[],
    "skillsGaps" TEXT[],
    "suggestions" JSONB,
    "strengths" TEXT[],
    "improvements" TEXT[],
    "isAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "analyzedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_analysis_results" (
    "id" TEXT NOT NULL,
    "spokenText" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "pace" INTEGER NOT NULL,
    "keywordRelevance" INTEGER NOT NULL,
    "suggestions" TEXT[],
    "strengths" TEXT[],
    "improvementAreas" TEXT[],
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ai_generated_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "expectedDuration" INTEGER NOT NULL,
    "hints" TEXT[],
    "tags" TEXT[],
    "targetRole" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_generated_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interview_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."InterviewType" NOT NULL DEFAULT 'PRACTICE',
    "status" "public"."InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "questions" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "overallScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interview_responses" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "transcription" TEXT,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "analysis" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "interview_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interviews" ADD CONSTRAINT "interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interview_responses" ADD CONSTRAINT "interview_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."interview_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
