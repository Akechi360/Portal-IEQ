// prisma/seed.ts — Seed base alineado al schema clínico
// Modelos: Admin, PortalConfig, SystemConfig, Doctor, Credential, StaffUser
// Ejecutar: npm run prisma:seed  (requiere DB activa en Fase 3)

import { PrismaClient } from "@prisma/client";
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
      role:         "SUPERADMIN",
      status:       "ACTIVE",
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
      role:         "OPERADOR",
      status:       "ACTIVE",
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
    {
      key:         "ruijie_gateway_url",
      value:       "https://cloud-la.ruijienetworks.com",
      description: "URL del servidor/gateway de Ruijie Cloud",
    },
    {
      key:         "ruijie_group_guest",
      value:       "grp-guest",
      description: "Grupo de red en Ruijie para pacientes/invitados",
    },
    {
      key:         "ruijie_group_medicos",
      value:       "grp-medicos",
      description: "Grupo de red en Ruijie para médicos",
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


  console.log("\n✅ Seed completado.\n");
  console.log("─────────────────────────────────────────────");
  console.log("  Credenciales de acceso al panel:");
  console.log("  SUPERADMIN → admin_sistemas / Sistemas#2026");
  console.log("  OPERADOR   → admin_operador / Admision#2026");
  console.log("─────────────────────────────────────────────\n");
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
