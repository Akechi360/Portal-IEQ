import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial admin users...');

  // Hash passwords
  const passwordAdmision = await bcrypt.hash('admision123', 10);
  const passwordSistemas = await bcrypt.hash('sistemas123', 10);

  // Create OPERADOR (Admisión)
  const adminAdmision = await prisma.admin.upsert({
    where: { username: 'admision' },
    update: {},
    create: {
      nombre: 'Operador Admisión',
      username: 'admision',
      email: 'admision@ieq-clinica',
      passwordHash: passwordAdmision,
      role: 'OPERADOR',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created OPERADOR (Admisión):', adminAdmision.username);

  // Create SUPERADMIN (Sistemas)
  const adminSistemas = await prisma.admin.upsert({
    where: { username: 'sistemas' },
    update: {},
    create: {
      nombre: 'Administrador Sistemas',
      username: 'sistemas',
      email: 'sistemas@ieq-clinica',
      passwordHash: passwordSistemas,
      role: 'SUPERADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created SUPERADMIN (Sistemas):', adminSistemas.username);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admins:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
