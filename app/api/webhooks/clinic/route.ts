// app/api/webhooks/clinic/route.ts
// POST — Webhook entrante desde sistemas de la clínica (HIS/ADT/Admisión).
// Conectado a la base de datos real y al gateway Ruijie en Fase 3.

import { NextResponse } from "next/server";
import { webhookClinicSchema } from "@/lib/validators";
import { logAccess } from "@/lib/audit";
import { db } from "@/lib/db";
import { LogEvent } from "@prisma/client";
import { generateVoucherCode } from "@/lib/auth";
import { createVoucher } from "@/lib/ruijie";
import crypto from "crypto";

function verifyHmac(body: string, signature: string | null, secret: string): boolean {
  if (!secret) return true;
  if (!signature) return false;
  const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return hash.toLowerCase() === signature.trim().toLowerCase();
}

function getExpireAt(tipo: "PACIENTE" | "TRANSITO", diasEstancia?: number): Date {
  const now = new Date();
  if (tipo === "TRANSITO") {
    return new Date(now.getTime() + 30 * 60 * 1000); // 30 minutos
  }
  const days = diasEstancia ?? 2;
  return new Date(now.getTime() + (days * 24 + 2) * 60 * 60 * 1000);
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const WEBHOOK_SECRET = process.env.WEBHOOK_CLINIC_SECRET ?? "";
    const signature = req.headers.get("x-ieq-signature") || req.headers.get("X-IEQ-Signature");

    if (WEBHOOK_SECRET) {
      if (!signature || !verifyHmac(rawBody, signature, WEBHOOK_SECRET)) {
        return NextResponse.json({ ok: false, message: "Firma inválida" }, { status: 401 });
      }
    }

    const json = JSON.parse(rawBody);
    const parsed = webhookClinicSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: "Payload inválido", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { event, timestamp, payload = {} } = parsed.data;

    let detail = `event:${event}`;

    switch (event) {
      case "PATIENT_ADMITTED": {
        // Encontrar administrador de sistemas
        let admin = await db.admin.findUnique({
          where: { username: "admin_sistemas" }
        });
        if (!admin) {
          admin = await db.admin.findFirst({
            where: { status: "ACTIVE" }
          });
        }
        if (!admin) {
          return NextResponse.json({ ok: false, message: "No active admin found" }, { status: 500 });
        }

        const nombre = (payload.nombre || payload.name || payload.patientName || "Paciente Admitido") as string;
        const habitacion = (payload.habitacion || payload.room || payload.bed || null) as string | null;
        const diasEstancia = (payload.diasEstancia || payload.days || 2) as number;

        const voucherCode = generateVoucherCode();
        const expireAt = getExpireAt("PACIENTE", diasEstancia);

        const credential = await db.credential.create({
          data: {
            voucherCode,
            tipo: "PACIENTE",
            nombre,
            habitacion,
            maxDevices: 2,
            diasEstancia,
            expireAt,
            issuerId: admin.id,
            status: "ACTIVE",
          },
        });

        const groupId = process.env.RUIJIE_GROUP_ID || "default-group";
        try {
          await createVoucher({ code: voucherCode, groupId, maxDevices: 2, expireAt, note: nombre });
        } catch (e) {
          console.warn("Fallo al crear voucher en Ruijie para webhook", e);
        }

        detail = `admitted:${nombre}:code:${voucherCode}:room:${habitacion ?? "N/A"}`;
        break;
      }

      case "PATIENT_DISCHARGED": {
        const voucherCode = (payload.voucherCode || payload.code) as string | undefined;
        const habitacion = (payload.habitacion || payload.room || payload.bed) as string | undefined;
        const nombre = (payload.nombre || payload.name || payload.patientName) as string | undefined;

        let credential = null;
        if (voucherCode) {
          credential = await db.credential.findFirst({
            where: { voucherCode, status: "ACTIVE" }
          });
        }
        if (!credential && habitacion) {
          credential = await db.credential.findFirst({
            where: { habitacion, status: "ACTIVE" }
          });
        }
        if (!credential && nombre) {
          credential = await db.credential.findFirst({
            where: { nombre: { contains: nombre, mode: "insensitive" }, status: "ACTIVE" }
          });
        }

        if (credential) {
          await db.credential.update({
            where: { id: credential.id },
            data: { status: "EXPIRED" }
          });

          await db.session.updateMany({
            where: { credentialId: credential.id, endedAt: null },
            data: { endedAt: new Date() }
          });

          detail = `discharged:${credential.nombre}:code:${credential.voucherCode}`;
        } else {
          detail = `discharged:not_found:${nombre ?? habitacion ?? voucherCode ?? "unknown"}`;
        }
        break;
      }

      case "ROOM_CHANGE": {
        const voucherCode = (payload.voucherCode || payload.code) as string | undefined;
        const oldRoom = (payload.habitacionAnterior || payload.oldRoom || payload.habitacion || payload.room) as string | undefined;
        const nombre = (payload.nombre || payload.name || payload.patientName) as string | undefined;
        const newRoom = (payload.nuevaHabitacion || payload.newRoom || payload.habitacionNueva) as string | undefined;

        let credential = null;
        if (voucherCode) {
          credential = await db.credential.findFirst({
            where: { voucherCode, status: "ACTIVE" }
          });
        }
        if (!credential && oldRoom) {
          credential = await db.credential.findFirst({
            where: { habitacion: oldRoom, status: "ACTIVE" }
          });
        }
        if (!credential && nombre) {
          credential = await db.credential.findFirst({
            where: { nombre: { contains: nombre, mode: "insensitive" }, status: "ACTIVE" }
          });
        }

        if (credential && newRoom) {
          await db.credential.update({
            where: { id: credential.id },
            data: { habitacion: newRoom }
          });
          detail = `room_change:${credential.nombre}:code:${credential.voucherCode}:new:${newRoom}`;
        } else {
          detail = `room_change:failed:new:${newRoom ?? "N/A"}`;
        }
        break;
      }

      default: {
        console.warn("Evento de webhook clínico desconocido:", event);
        detail = `unknown_event:${event}`;
      }
    }

    await logAccess({
      event: LogEvent.NEW_SESSION,
      actor: "webhook:clinic",
      detail: `${detail}|ts:${timestamp ?? "N/A"}`,
    });

    return NextResponse.json(
      { ok: true, message: "Evento recibido y procesado", accepted: true, offline: false },
      { status: 202 }
    );
  } catch (error) {
    console.error("POST /api/webhooks/clinic", error);
    return NextResponse.json({ ok: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
