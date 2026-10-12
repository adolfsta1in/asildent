-- CreateTable
CREATE TABLE "DoctorCertificate" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeforeAfterCase" (
    "id" TEXT NOT NULL,
    "beforeUrl" TEXT NOT NULL,
    "afterUrl" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "doctorId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeforeAfterCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "dueDate" TEXT,
    "dueMin" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorCertificate_doctorId_sortOrder_idx" ON "DoctorCertificate"("doctorId", "sortOrder");

-- CreateIndex
CREATE INDEX "BeforeAfterCase_sortOrder_idx" ON "BeforeAfterCase"("sortOrder");

-- CreateIndex
CREATE INDEX "Task_isDone_dueDate_idx" ON "Task"("isDone", "dueDate");

-- CreateIndex
CREATE INDEX "Task_appointmentId_idx" ON "Task"("appointmentId");

-- AddForeignKey
ALTER TABLE "DoctorCertificate" ADD CONSTRAINT "DoctorCertificate_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeforeAfterCase" ADD CONSTRAINT "BeforeAfterCase_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

