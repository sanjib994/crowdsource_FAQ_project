-- CreateEnum
CREATE TYPE "FAQCategory" AS ENUM ('REGISTRATION', 'TECHNICAL', 'EVENTS', 'GENERAL');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'CLAIMED', 'RESOLVED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "spurtiPoints" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "category" "FAQCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "questionText" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "linkedFaqId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_linkedFaqId_fkey" FOREIGN KEY ("linkedFaqId") REFERENCES "FAQ"("id") ON DELETE SET NULL ON UPDATE CASCADE;
