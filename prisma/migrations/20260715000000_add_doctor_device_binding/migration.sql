-- CreateTable: casa el correo de un médico (Doctor) con su(s) MAC de
-- dispositivo, respetando max_devices_doctor. Cierra el hueco de compartir
-- el correo con muchos equipos.
CREATE TABLE "DoctorDeviceBinding" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "boundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorDeviceBinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoctorDeviceBinding_doctorId_mac_key" ON "DoctorDeviceBinding"("doctorId", "mac");

-- CreateIndex
CREATE INDEX "DoctorDeviceBinding_doctorId_idx" ON "DoctorDeviceBinding"("doctorId");

-- AddForeignKey
ALTER TABLE "DoctorDeviceBinding" ADD CONSTRAINT "DoctorDeviceBinding_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
