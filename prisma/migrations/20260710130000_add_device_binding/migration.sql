-- CreateTable: casa un voucher (Credential) con el/los MAC de dispositivo,
-- respetando Credential.maxDevices. Binding persistente ("matrimonio").
CREATE TABLE "DeviceBinding" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "boundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceBinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceBinding_credentialId_mac_key" ON "DeviceBinding"("credentialId", "mac");

-- CreateIndex
CREATE INDEX "DeviceBinding_credentialId_idx" ON "DeviceBinding"("credentialId");

-- AddForeignKey
ALTER TABLE "DeviceBinding" ADD CONSTRAINT "DeviceBinding_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;
