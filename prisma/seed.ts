<<<<<<< HEAD
// prisma/seed.ts — Seed base alineado al schema clínico
// Modelos: Admin, PortalConfig, SystemConfig, Doctor, Credential
// Ejecutar: npm run prisma:seed  (requiere DB activa en Fase 3)

import { PrismaClient, AdminRole, AdminStatus, DoctorStatus, CredentialType, CredentialStatus } from "@prisma/client";
=======
import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

<<<<<<< HEAD
async function main() {
  console.log("🌱 Iniciando seed del Portal IEQ...\n");

  // ────────────────────────────────────────────────────────────────────────────
  // 1. ADMINS
  // ────────────────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────────
  // 2. PORTAL CONFIG
  // ────────────────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────────
  // 3. SYSTEM CONFIG (5 entradas iniciales)
  //    Los valores se almacenan como strings; JSON.parse/stringify en la capa de acceso.
  // ────────────────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────────
  // 4. DATOS DE DEMO (médicos y credenciales para pruebas offline)
  //    Eliminable antes de producción.
  // ────────────────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────────
  // RESUMEN
  // ────────────────────────────────────────────────────────────────────────────
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
=======
function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60 * 1000);
}

async function main() {
  const now = new Date();

  const profiles = [
    { code: "PACIENTE_STD", name: "Paciente estandar", maxDevices: 4, sessionMinutes: 60 * 24 + 120, permanent: false, canIssue: false, canBrowse: true },
    { code: "TRANSITO_30M", name: "Transito 30 minutos", maxDevices: 1, sessionMinutes: 30, permanent: false, canIssue: false, canBrowse: true },
    { code: "MEDICO_PERM", name: "Medico permanente", maxDevices: 3, sessionMinutes: null, permanent: true, canIssue: false, canBrowse: true },
    { code: "GERENCIA_PERM", name: "Gerencia permanente", maxDevices: 5, sessionMinutes: null, permanent: true, canIssue: true, canBrowse: true },
    { code: "SYSTEMS_ADMIN", name: "Sistemas administrador", maxDevices: 5, sessionMinutes: null, permanent: true, canIssue: true, canBrowse: true }
  ];

  for (const profile of profiles) {
    await prisma.accessProfile.upsert({
      where: { code: profile.code },
      update: profile,
      create: profile
    });
  }

  const admissionPass = await bcrypt.hash("Admision#2026", 10);
  const sistemasPass = await bcrypt.hash("Sistemas#2026", 10);

  const admission = await prisma.user.upsert({
    where: { username: "admission_operator_01" },
    update: {},
    create: {
      username: "admission_operator_01",
      personName: "Operador Admision 01",
      role: UserRole.ADMISSION_OPERATOR,
      status: UserStatus.ACTIVE,
      passwordHash: admissionPass,
      createdByRole: UserRole.SYSTEMS
    }
  });

  const systems = await prisma.user.upsert({
    where: { username: "systems_admin_01" },
    update: {},
    create: {
      username: "systems_admin_01",
      personName: "Administrador de Sistemas",
      role: UserRole.SYSTEMS,
      status: UserStatus.ACTIVE,
      passwordHash: sistemasPass,
      createdByRole: UserRole.SYSTEMS
    }
  });

  const systemsAdminToken = "SYS1-ADM1-2026-TEST";
  await prisma.accessGrant.upsert({
    where: { token: systemsAdminToken },
    update: {
      userId: systems.id,
      profileCode: "SYSTEMS_ADMIN",
      room: "Sistemas",
      startsAt: now,
      endsAt: null,
      active: true,
      maxDevices: 5,
      createdBy: UserRole.SYSTEMS
    },
    create: {
      userId: systems.id,
      profileCode: "SYSTEMS_ADMIN",
      room: "Sistemas",
      token: systemsAdminToken,
      startsAt: now,
      endsAt: null,
      active: true,
      maxDevices: 5,
      createdBy: UserRole.SYSTEMS
    }
  });

  const seededUsers = [
    {
      username: "paciente_1001",
      personName: "Paciente Demo Uno",
      role: UserRole.PACIENTE,
      status: UserStatus.ACTIVE,
      createdByRole: UserRole.ADMISSION_OPERATOR,
      expiresAt: addMinutes(now, 60 * 24 + 120),
      profileCode: "PACIENTE_STD",
      room: "H-204",
      token: "PA01-BC23-DE45"
    },
    {
      username: "transito_3001",
      personName: "Transito Demo",
      role: UserRole.TRANSITO,
      status: UserStatus.ACTIVE,
      createdByRole: UserRole.ADMISSION_OPERATOR,
      expiresAt: addMinutes(now, 30),
      profileCode: "TRANSITO_30M",
      room: "Caja",
      token: "TR00-AB11-CD22"
    },
    {
      username: "medico_5001",
      personName: "Dra. Elena Vargas",
      role: UserRole.MEDICO,
      status: UserStatus.ACTIVE,
      createdByRole: UserRole.SYSTEMS,
      expiresAt: null,
      profileCode: "MEDICO_PERM",
      room: "Consulta Externa",
      token: "MD99-AA88-BB77"
    },
    {
      username: "gerencia_7001",
      personName: "Gerencia General",
      role: UserRole.GERENCIA,
      status: UserStatus.ACTIVE,
      createdByRole: UserRole.SYSTEMS,
      expiresAt: null,
      profileCode: "GERENCIA_PERM",
      room: "Direccion",
      token: "GE12-FE34-DC56"
    }
  ];

  for (const entry of seededUsers) {
    const user = await prisma.user.upsert({
      where: { username: entry.username },
      update: {
        personName: entry.personName,
        role: entry.role,
        status: entry.status,
        createdByRole: entry.createdByRole,
        expiresAt: entry.expiresAt
      },
      create: {
        username: entry.username,
        personName: entry.personName,
        role: entry.role,
        status: entry.status,
        createdByRole: entry.createdByRole,
        expiresAt: entry.expiresAt
      }
    });

    await prisma.accessGrant.upsert({
      where: { token: entry.token },
      update: {
        userId: user.id,
        profileCode: entry.profileCode,
        room: entry.room,
        startsAt: now,
        endsAt: entry.expiresAt,
        active: true,
        createdBy: entry.createdByRole
      },
      create: {
        userId: user.id,
        profileCode: entry.profileCode,
        room: entry.room,
        token: entry.token,
        startsAt: now,
        endsAt: entry.expiresAt,
        active: true,
        createdBy: entry.createdByRole
      }
    });
  }

  const paciente = await prisma.user.findUniqueOrThrow({ where: { username: "paciente_1001" } });
  const medico = await prisma.user.findUniqueOrThrow({ where: { username: "medico_5001" } });

  await prisma.device.upsert({
    where: { userId_mac: { userId: paciente.id, mac: "00:1A:C2:7B:00:47" } },
    update: { lastSeen: now, anomalies: [] },
    create: {
      userId: paciente.id,
      mac: "00:1A:C2:7B:00:47",
      label: "iPhone Familiar",
      firstSeen: addMinutes(now, -120),
      lastSeen: now,
      anomalies: []
    }
  });

  await prisma.device.upsert({
    where: { userId_mac: { userId: medico.id, mac: "9C:3D:CF:2F:BC:11" } },
    update: { lastSeen: now, anomalies: ["UNUSUAL_NIGHT_LOGIN"] },
    create: {
      userId: medico.id,
      mac: "9C:3D:CF:2F:BC:11",
      label: "Laptop Consultorio",
      firstSeen: addMinutes(now, -260),
      lastSeen: now,
      anomalies: ["UNUSUAL_NIGHT_LOGIN"]
    }
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actor: admission.username,
        actorUserId: admission.id,
        actorUsername: admission.username,
        action: "ISSUE_ACCESS",
        target: paciente.username,
        targetUserId: paciente.id,
        metadata: { role: "PACIENTE", maxDevices: 4, room: "H-204" }
      },
      {
        actor: systems.username,
        actorUserId: systems.id,
        actorUsername: systems.username,
        action: "POLICY_ANOMALY",
        target: medico.username,
        targetUserId: medico.id,
        metadata: { anomaly: "UNUSUAL_NIGHT_LOGIN", source: "policy-engine" }
      }
    ]
  });

  console.log("Credencial de prueba SISTEMAS lista:");
  console.log("username: systems_admin_01");
  console.log("password: Sistemas#2026");
  console.log("token: SYS1-ADM1-2026-TEST");
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
<<<<<<< HEAD
    console.error("❌ Seed error:", error);
=======
    console.error(error);
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
    await prisma.$disconnect();
    process.exit(1);
  });
