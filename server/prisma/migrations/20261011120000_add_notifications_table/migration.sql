-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REPAIR_REQUEST_RECEIVED', 'REPAIR_REQUEST_ACCEPTED', 'REPAIR_REQUEST_REJECTED', 'REPAIR_REQUEST_CANCELLED', 'TECHNICIAN_ASSIGNED', 'DIAGNOSTICS_COMPLETED', 'REPAIR_STATUS_UPDATED', 'REPAIR_READY_FOR_PICKUP', 'REPAIR_COMPLETED', 'NEW_REPAIR_REQUEST');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
