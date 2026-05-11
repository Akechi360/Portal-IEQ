<<<<<<< HEAD
﻿import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Legacy endpoint — use /api/auth/guest or /api/auth/doctor" },
    { status: 410 }
  );
}

=======
import { NextResponse } from "next/server";
import { z } from "zod";
import { executeLogin } from "@/lib/access";

const loginSchema = z.object({
  username: z.string().min(1),
  passwordOrToken: z.string().optional(),
  role: z.enum(["Paciente", "Transito", "Medico", "Gerencia"]).optional(),
  clientMac: z.string().min(1),
  apMac: z.string().min(1),
  ssid: z.string().min(1),
  redirect: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Payload invalido",
          errors: parsed.error.flatten()
        },
        { status: 400 }
      );
    }

    const result = await executeLogin(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ ok: false, message: "Acceso denegado" }, { status: 401 });
    }

    return NextResponse.json(
      {
        ok: true,
        nextUrl: parsed.data.redirect,
        sessionId: result.grantId
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/login", error);
    return NextResponse.json({ ok: false, message: "Error interno" }, { status: 500 });
  }
}
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
