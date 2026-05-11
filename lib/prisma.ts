// Re-exportación unificada del cliente Prisma.
// Usar indistintamente: import { db } from '@/lib/prisma' o import { db } from '@/lib/db'
// app/lib/prisma.ts sigue existiendo para los Server Components del panel.
export { db } from "@/lib/db";
