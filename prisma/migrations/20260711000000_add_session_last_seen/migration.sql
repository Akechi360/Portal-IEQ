-- AlterTable: marca de tiempo del último paquete de accounting recibido.
-- Sirve para detectar sesiones "stale" (Stop perdido) y cerrarlas.
ALTER TABLE "Session" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
