import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
