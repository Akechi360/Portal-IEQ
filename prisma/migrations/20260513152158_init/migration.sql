-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('PACIENTE', 'TRANSITO');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "DoctorStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "LogEvent" AS ENUM ('AUTH_SUCCESS', 'AUTH_FAIL', 'BLOCKED', 'DISCONNECTED', 'NEW_SESSION', 'LIMIT_REACHED', 'DOCTOR_APPROVED', 'DOCTOR_REJECTED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "voucherCode" TEXT NOT NULL,
    "tipo" "CredentialType" NOT NULL,
    "nombre" TEXT NOT NULL,
    "habitacion" TEXT,
    "maxDevices" INTEGER NOT NULL DEFAULT 1,
    "diasEstancia" INTEGER,
    "expireAt" TIMESTAMP(3),
    "issuerId" TEXT NOT NULL,
    "status" "CredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "especialidad" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "voucherCode" TEXT,
    "status" "DoctorStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "mac" TEXT NOT NULL,
    "ip" TEXT,
    "ssid" TEXT,
    "credentialId" TEXT,
    "doctorId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "dataDownMB" DOUBLE PRECISION,
    "dataUpMB" DOUBLE PRECISION,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "event" "LogEvent" NOT NULL,
    "actor" TEXT NOT NULL,
    "mac" TEXT,
    "ip" TEXT,
    "ssid" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'OPERADOR',
    "status" "AdminStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalConfig" (
    "id" TEXT NOT NULL,
    "portalName" TEXT NOT NULL DEFAULT 'Portal IEQ',
    "slogan" TEXT,
    "logoUrl" TEXT,
    "bgUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0EA5E9',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "loginTitle" TEXT NOT NULL DEFAULT 'Acceso WiFi',
    "loginButton" TEXT NOT NULL DEFAULT 'Conectarme',
    "successMsg" TEXT NOT NULL DEFAULT '¡Acceso concedido!',
    "errorMsg" TEXT NOT NULL DEFAULT 'Código inválido o expirado.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credential_voucherCode_key" ON "Credential"("voucherCode");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_voucherCode_key" ON "Doctor"("voucherCode");

-- CreateIndex
CREATE INDEX "Session_mac_idx" ON "Session"("mac");

-- CreateIndex
CREATE INDEX "Session_startedAt_idx" ON "Session"("startedAt");

-- CreateIndex
CREATE INDEX "Session_credentialId_idx" ON "Session"("credentialId");

-- CreateIndex
CREATE INDEX "Session_doctorId_idx" ON "Session"("doctorId");

-- CreateIndex
CREATE INDEX "AccessLog_createdAt_idx" ON "AccessLog"("createdAt");

-- CreateIndex
CREATE INDEX "AccessLog_event_idx" ON "AccessLog"("event");

-- CreateIndex
CREATE INDEX "AccessLog_mac_idx" ON "AccessLog"("mac");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
