// app/api/admin/ruijie/groups/route.ts
// GET — Lista los grupos de usuario (perfiles de ancho de banda) reales
// configurados en Ruijie Cloud, para que Configuración pueda asignarlos por
// tipo de credencial en vez de un valor fijo por variable de entorno.

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/jwt";
import { getUserGroups } from "@/lib/ruijie";

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const groups = await getUserGroups();
    return NextResponse.json({ ok: true, data: groups });
  } catch (error) {
    console.error("GET /api/admin/ruijie/groups", error);
    return NextResponse.json({ ok: false, message: "Error al obtener grupos de Ruijie." }, { status: 500 });
  }
}
