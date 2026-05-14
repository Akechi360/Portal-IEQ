// prisma/seed.ts — Seed base alineado al schema clínico
// Modelos: Admin, PortalConfig, SystemConfig, Doctor, Credential
// Ejecutar: npm run prisma:seed  (requiere DB activa en Fase 3)

import { PrismaClient, AdminRole, AdminStatus, DoctorStatus, CredentialType, CredentialStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed del Portal IEQ...\n");

  // 1. ADMINS
  console.log("👤 Creando admins...");

  const superadminHash = await bcrypt.hash("Sistemas#2026", 10);
  const operadorHash   = await bcrypt.hash("Admision#2026", 10);

  const superadmin = await prisma.admin.upsert({
    where:  { username: "admin_sistemas" },
    update: {},
    create: {
      nombre:       "Administrador de Sistemas",
      username:     "admin_sistemas",
      email:        "sistemas@ieq.med",
      passwordHash: superadminHash,
      role:         AdminRole.SUPERADMIN,
      status:       AdminStatus.ACTIVE,
    },
  });

  const operador = await prisma.admin.upsert({
    where:  { username: "admin_operador" },
    update: {},
    create: {
      nombre:       "Operador de Admisión",
      username:     "admin_operador",
      email:        "admision@ieq.med",
      passwordHash: operadorHash,
      role:         AdminRole.OPERADOR,
      status:       AdminStatus.ACTIVE,
    },
  });

  console.log(`  ✔ SUPERADMIN → ${superadmin.username}`);
  console.log(`  ✔ OPERADOR   → ${operador.username}`);

  // 2. PORTAL CONFIG
  console.log("\n🎨 Creando PortalConfig...");

  const existingPortal = await prisma.portalConfig.findFirst();
  if (!existingPortal) {
    await prisma.portalConfig.create({
      data: {
        portalName:   "Portal IEQ",
        slogan:       "Acceso WiFi para pacientes y personal médico",
        logoUrl:      null,
        bgUrl:        null,
        primaryColor: "#0EA5E9",
        fontFamily:   "Inter",
        loginTitle:   "Acceso WiFi",
        loginButton:  "Conectarme",
        successMsg:   "¡Acceso concedido! Ya puedes navegar.",
        errorMsg:     "Código inválido o expirado. Verifica con admisión.",
      },
    });
    console.log("  ✔ PortalConfig creada");
  } else {
    console.log("  ↩ PortalConfig ya existe, omitiendo");
  }

  // 3. SYSTEM CONFIG
  console.log("\n⚙️  Creando SystemConfig...");

  const systemConfigs = [
    {
      key:         "guest_session_hours",
      value:       "48",
      description: "Duración de sesión para pacientes en horas (incluye 2h de gracia)",
    },
    {
      key:         "doctor_session_hours",
      value:       "null",
      description: "Duración de sesión para médicos en horas. null = permanente",
    },
    {
      key:         "max_devices_guest",
      value:       "2",
      description: "Número máximo de dispositivos simultáneos por credencial de invitado",
    },
    {
      key:         "max_devices_doctor",
      value:       "3",
      description: "Número máximo de dispositivos simultáneos por médico",
    },
    {
      key:         "webhook_clinic_enabled",
      value:       "false",
      description: "Activar recepción de webhooks desde el HIS/ADT de la clínica",
    },
  ];

  for (const cfg of systemConfigs) {
    await prisma.systemConfig.upsert({
      where:  { key: cfg.key },
      update: {},
      create: cfg,
    });
    console.log(`  ✔ ${cfg.key} = ${cfg.value}`);
  }

  // 4. DATOS DE DEMO
  console.log("\n🏥 Creando datos de demo...");

  const doctor1 = await prisma.doctor.upsert({
    where:  { email: "j.ramirez@ieq.med" },
    update: {},
    create: {
      nombre:      "Dr. Jaime Ramírez",
      especialidad:"Cardiología",
      email:       "j.ramirez@ieq.med",
      telefono:    "809-555-0101",
      voucherCode: "IEQ-AA11-BB22",
      status:      DoctorStatus.ACTIVE,
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where:  { email: "e.vargas@ieq.med" },
    update: {},
    create: {
      nombre:      "Dra. Elena Vargas",
      especialidad:"Pediatría",
      email:       "e.vargas@ieq.med",
      telefono:    "809-555-0202",
      voucherCode: "IEQ-CC33-DD44",
      status:      DoctorStatus.ACTIVE,
    },
  });

  console.log(`  ✔ Médico → ${doctor1.nombre} (${doctor1.voucherCode})`);
  console.log(`  ✔ Médico → ${doctor2.nombre} (${doctor2.voucherCode})`);

  // Credenciales de demo
  const credential1 = await prisma.credential.upsert({
    where:  { voucherCode: "IEQ-DEMO-PAC1" },
    update: {},
    create: {
      voucherCode:  "IEQ-DEMO-PAC1",
      tipo:         CredentialType.PACIENTE,
      nombre:       "Paciente Demo Uno",
      habitacion:   "H-204",
      maxDevices:   2,
      diasEstancia: 2,
      expireAt:     new Date(Date.now() + 50 * 60 * 60 * 1000), // ~2 días
      issuerId:     operador.id,
      status:       CredentialStatus.ACTIVE,
    },
  });

  const credential2 = await prisma.credential.upsert({
    where:  { voucherCode: "IEQ-DEMO-TRN1" },
    update: {},
    create: {
      voucherCode: "IEQ-DEMO-TRN1",
      tipo:        CredentialType.TRANSITO,
      nombre:      "Visitante Demo",
      habitacion:  "Caja",
      maxDevices:  1,
      expireAt:    new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      issuerId:    operador.id,
      status:      CredentialStatus.ACTIVE,
    },
  });

  console.log(`  ✔ Credential PACIENTE → ${credential1.voucherCode}`);
  console.log(`  ✔ Credential TRANSITO → ${credential2.voucherCode}`);

  console.log("\n✅ Seed completado.\n");
  console.log("─────────────────────────────────────────────");
  console.log("  Credenciales de acceso al panel:");
  console.log("  SUPERADMIN → admin_sistemas / Sistemas#2026");
  console.log("  OPERADOR   → admin_operador / Admision#2026");
  console.log("─────────────────────────────────────────────");
  console.log("  Vouchers de demo WiFi:");
  console.log("  Paciente  → IEQ-DEMO-PAC1");
  console.log("  Tránsito  → IEQ-DEMO-TRN1");
  console.log("  Médico 1  → IEQ-AA11-BB22");
  console.log("  Médico 2  → IEQ-CC33-DD44");
  console.log("─────────────────────────────────────────────\n");
}
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seed error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
