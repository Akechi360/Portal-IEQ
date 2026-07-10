-- AlterTable: Acct-Session-Id de RADIUS para correlacionar los paquetes de
-- accounting (Start / Interim-Update / Stop) de una misma sesión del gateway.
ALTER TABLE "Session" ADD COLUMN "acctSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_acctSessionId_key" ON "Session"("acctSessionId");
