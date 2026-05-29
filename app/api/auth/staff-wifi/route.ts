import { NextResponse } from "next/server";
import { SessionAccessType, StaffStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { authorizeClient } from "@/lib/ruijie";
import { logAccess } from "@/lib/audit";
import { evaluatePolicy } from "@/lib/policy";

export async function POST(req: Request) {
  try {
    const { email, mac } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Correo institucional inválido" },
        { status: 400 }
      );
    }

    // 1. Buscar el usuario en la base de datos
    const staffUser = await db.staffUser.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!staffUser || staffUser.status !== StaffStatus.ACTIVE) {
      await logAccess({
        event: "AUTH_FAIL",
        actor: email,
        mac,
        ssid: "IEQ-Staff",
        detail: "STAFF_USER_NOT_FOUND_OR_INACTIVE"
      });
      return NextResponse.json(
        { success: false, message: "Correo no encontrado o inactivo en el registro de Staff." },
        { status: 404 }
      );
    }

    // 2. Evaluar políticas de seguridad (ej: accesos nocturnos anómalos)
    try {
      const policy = await evaluatePolicy({ mac, actor: email, tipo: "STAFF", ssid: "IEQ-Staff" });
      if (policy.blocked) {
        return NextResponse.json(
          { success: false, message: "Acceso bloqueado por política de seguridad." },
          { status: 403 }
        );
      }
    } catch (e) {
      console.warn("Fallo al evaluar políticas para Staff", e);
    }

    // 3. Autorizar MAC en gateway Ruijie (offline: mock/fallback seguro)
    try {
      await authorizeClient({ mac, username: email, groupId: "grp-admin" });
    } catch (e) {
      console.warn("Fallo al autorizar cliente Staff en Ruijie", e);
    }

    // 3. Registrar la sesión en la base de datos
    const session = await db.session.create({
      data: {
        mac,
        staffUserId: staffUser.id,
        ssid: "IEQ-Staff",
        accessType: SessionAccessType.STAFF
      }
    });

    await logAccess({
      event: "AUTH_SUCCESS",
      actor: email,
      mac,
      ssid: "IEQ-Staff",
      detail: `session:${session.id}`
    });

    return NextResponse.json({
      success: true,
      message: "Acceso concedido.",
      data: {
        email: staffUser.email,
        nombre: staffUser.nombre ?? "Staff IEQ",
        mac: mac,
        accessType: SessionAccessType.STAFF,
        sessionId: session.id
      },
    });
  } catch (error) {
    console.error("[POST /api/auth/staff-wifi]", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
