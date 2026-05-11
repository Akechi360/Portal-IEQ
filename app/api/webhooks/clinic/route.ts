// app/api/webhooks/clinic/route.ts
// POST — Webhook entrante desde sistemas de la clínica (HIS/ADT/Admisión).
// Modo offline: valida payload con Zod y responde 202 Accepted sin procesar.
// TODO Fase 3: procesar eventos reales (alta/baja de paciente, cambio de habitación, etc.)

import { NextResponse } from "next/server";
import { webhookClinicSchema } from "@/lib/validators";
import { logAccess } from "@/lib/audit";

// TODO Fase 3: verificar firma HMAC del webhook (header X-IEQ-Signature)
// const WEBHOOK_SECRET = process.env.WEBHOOK_CLINIC_SECRET ?? "";

export async function POST(req: Request) {
  try {
    // TODO Fase 3: verificar firma antes de procesar
    // const signature = req.headers.get("x-ieq-signature");
    // if (!verifyHmac(await req.text(), signature, WEBHOOK_SECRET)) {
    //   return NextResponse.json({ ok: false, message: "Firma inválida" }, { status: 401 });
    // }

    const json = await req.json();
    const parsed = webhookClinicSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Payload inválido", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { event, timestamp, payload } = parsed.data;

    // TODO Fase 3: procesar cada tipo de evento:
    // switch (event) {
    //   case "PATIENT_ADMITTED":   → crear Credential automática
    //   case "PATIENT_DISCHARGED": → revocar Credential (status BLOCKED)
    //   case "ROOM_CHANGE":        → actualizar habitacion en Credential
    //   default: console.warn("Evento de webhook desconocido:", event);
    // }

    await logAccess({
      event: "NEW_SESSION", // LOG placeholder — TODO Fase 3: usar LogEvent específico para webhooks
      actor: "webhook:clinic",
      detail: `event:${event}|ts:${timestamp ?? "N/A"}`,
    });

    console.info("[webhook][clinic][offline] Evento recibido:", event, payload ?? {});

    return NextResponse.json(
      { ok: true, message: "Evento recibido", accepted: true, offline: true },
      { status: 202 }
    );
  } catch (error) {
    console.error("POST /api/webhooks/clinic", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
