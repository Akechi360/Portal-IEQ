-- Agrega el tipo de credencial EMERGENCIA (paciente de emergencia adulto no
-- hospitalizado + familiares; acceso de horas, no de días).
-- Nota: ALTER TYPE ... ADD VALUE debe ejecutarse fuera de una transacción.
ALTER TYPE "CredentialType" ADD VALUE IF NOT EXISTS 'EMERGENCIA';
