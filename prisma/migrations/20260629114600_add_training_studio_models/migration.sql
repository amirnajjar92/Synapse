-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ClientPlanStatus" AS ENUM ('NONE', 'ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('WATER', 'WORKOUT', 'MEAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "intent" TEXT,
    "confidence" TEXT,
    "contextPage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stravaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "movingTime" INTEGER NOT NULL,
    "elapsedTime" INTEGER NOT NULL,
    "averageSpeed" DOUBLE PRECISION,
    "maxSpeed" DOUBLE PRECISION,
    "averageHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "calories" DOUBLE PRECISION,
    "externalId" TEXT,
    "polyline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aiAnalysis" TEXT,
    "todos" TEXT[],

    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMedia" (
    "id" TEXT NOT NULL,
    "dailyEntryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMetric" (
    "id" TEXT NOT NULL,
    "dailyEntryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "status" "PlanStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "goalWeight" DOUBLE PRECISION,
    "goalWeightUnit" TEXT,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanRow" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "columns" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanTable" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPrompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cups" INTEGER NOT NULL DEFAULT 0,
    "goalCups" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "time" TEXT NOT NULL,
    "days" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "type" "ReminderType" NOT NULL DEFAULT 'CUSTOM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "daysPerWeek" INTEGER NOT NULL DEFAULT 3,
    "weeksTotal" INTEGER NOT NULL DEFAULT 4,
    "status" "PlanStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutDay" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "dayName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "workoutDayId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "restSeconds" INTEGER,
    "targetMuscles" TEXT[],
    "instructions" TEXT,
    "videoUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setsCompleted" INTEGER NOT NULL,
    "repsCompleted" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "weightUnit" TEXT,
    "duration" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerClient" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "planStatus" "ClientPlanStatus" NOT NULL DEFAULT 'NONE',
    "assignedPlanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIConversation_userId_createdAt_idx" ON "AIConversation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_createdAt_idx" ON "AIMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_stravaId_key" ON "Activity"("stravaId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_userId_planId_date_key" ON "DailyEntry"("userId", "planId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "WaterLog_userId_date_key" ON "WaterLog"("userId", "date");

-- CreateIndex
CREATE INDEX "Reminder_userId_enabled_idx" ON "Reminder"("userId", "enabled");

-- CreateIndex
CREATE INDEX "WorkoutPlan_userId_status_idx" ON "WorkoutPlan"("userId", "status");

-- CreateIndex
CREATE INDEX "WorkoutDay_workoutPlanId_dayNumber_idx" ON "WorkoutDay"("workoutPlanId", "dayNumber");

-- CreateIndex
CREATE INDEX "Exercise_workoutDayId_orderIndex_idx" ON "Exercise"("workoutDayId", "orderIndex");

-- CreateIndex
CREATE INDEX "ExerciseLog_userId_date_idx" ON "ExerciseLog"("userId", "date");

-- CreateIndex
CREATE INDEX "ExerciseLog_exerciseId_date_idx" ON "ExerciseLog"("exerciseId", "date");

-- CreateIndex
CREATE INDEX "TrainerClient_trainerId_idx" ON "TrainerClient"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerClient_clientId_idx" ON "TrainerClient"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerClient_trainerId_clientId_key" ON "TrainerClient"("trainerId", "clientId");

-- CreateIndex
CREATE INDEX "Conversation_trainerId_idx" ON "Conversation"("trainerId");

-- CreateIndex
CREATE INDEX "Conversation_clientId_idx" ON "Conversation"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_trainerId_clientId_key" ON "Conversation"("trainerId", "clientId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMedia" ADD CONSTRAINT "DailyMedia_dailyEntryId_fkey" FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMetric" ADD CONSTRAINT "DailyMetric_dailyEntryId_fkey" FOREIGN KEY ("dailyEntryId") REFERENCES "DailyEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanRow" ADD CONSTRAINT "PlanRow_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "PlanTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanTable" ADD CONSTRAINT "PlanTable_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPrompt" ADD CONSTRAINT "UserPrompt_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPrompt" ADD CONSTRAINT "UserPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterLog" ADD CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutDay" ADD CONSTRAINT "WorkoutDay_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerClient" ADD CONSTRAINT "TrainerClient_assignedPlanId_fkey" FOREIGN KEY ("assignedPlanId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

