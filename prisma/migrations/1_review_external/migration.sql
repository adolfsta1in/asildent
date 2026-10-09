-- AlterTable
ALTER TABLE "Review" ADD COLUMN "source" TEXT,
ADD COLUMN "externalId" TEXT,
ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Review_externalId_key" ON "Review"("externalId");
