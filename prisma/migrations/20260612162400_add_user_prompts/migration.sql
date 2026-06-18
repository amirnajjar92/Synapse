-- CreateTable
CREATE TABLE IF NOT EXISTS "UserPrompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "prompt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPrompt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserPrompt" ADD CONSTRAINT "UserPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserPrompt" ADD CONSTRAINT "UserPrompt_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
