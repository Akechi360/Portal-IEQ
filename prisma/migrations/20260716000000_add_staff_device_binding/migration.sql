-- CreateTable: casa el correo de un miembro del personal (StaffUser) con su(s)
-- MAC de dispositivo, respetando max_devices_staff. Cierra el hueco de
-- compartir el correo institucional con muchos equipos (espejo de
-- DoctorDeviceBinding).
CREATE TABLE "StaffDeviceBinding" (
    "id" TEXT NOT NULL,
    "staffUserId" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "boundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffDeviceBinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffDeviceBinding_staffUserId_mac_key" ON "StaffDeviceBinding"("staffUserId", "mac");

-- CreateIndex
CREATE INDEX "StaffDeviceBinding_staffUserId_idx" ON "StaffDeviceBinding"("staffUserId");

-- AddForeignKey
ALTER TABLE "StaffDeviceBinding" ADD CONSTRAINT "StaffDeviceBinding_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
