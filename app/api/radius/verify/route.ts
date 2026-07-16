import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSystemConfig } from "@/lib/config";

/**
 * POST /api/radius/verify
 * 
 * Called by FreeRADIUS rlm_rest module to validate credentials.
 * The Gateway sends username/password (which are the voucher code).
 * 
 * IMPORTANT: Always return HTTP 200 for rlm_rest to work correctly.
 * Accept/Reject is communicated via the JSON body.
 * - Accept: { "control:Auth-Type": "Accept" }
 * - Reject: { "reply:Reply-Message": "Invalid credentials" } (no Auth-Type)
 */
/** Normaliza el MAC a "aa:bb:cc:dd:ee:ff" (el gateway lo manda con guiones). */
function normalizeMac(raw: string): string {
  const clean = (raw || "").replace(/[^a-fA-F0-9]/g, "").toLowerCase();
  if (clean.length !== 12) return "";
  return clean.match(/.{2}/g)!.join(":");
}

export async function POST(req: Request) {
  // Secreto compartido opcional: si RADIUS_SHARED_SECRET está definido, solo
  // FreeRADIUS (que envía el mismo secreto) puede consultar este endpoint,
  // evitando que cualquiera en internet enumere correos/vouchers válidos.
  // Si no está definido, se permite (compatibilidad con el flujo actual) pero
  // se registra una advertencia. Para activarlo: setear RADIUS_SHARED_SECRET
  // en Coolify y añadir "?k=<secreto>" a la uri del módulo rest de FreeRADIUS.
  const radiusSecret = process.env.RADIUS_SHARED_SECRET;
  if (radiusSecret) {
    const provided =
      req.headers.get("x-radius-secret") ||
      new URL(req.url).searchParams.get("k") ||
      "";
    if (provided !== radiusSecret) {
      console.warn("[RADIUS Verify] Secreto compartido ausente/incorrecto — rechazando");
      return NextResponse.json({ "reply:Reply-Message": "Unauthorized" }, { status: 200 });
    }
  } else {
    console.warn("[RADIUS Verify] RADIUS_SHARED_SECRET no configurado — endpoint sin protección de origen");
  }

  let username = "";
  let password = "";
  let rawMac = "";

  try {
    // Try JSON first (our config sends JSON)
    const body = await req.json();
    username = body.username || "";
    password = body.password || "";
    rawMac = body.mac || "";
  } catch {
    // If JSON parsing fails, try form-urlencoded
    try {
      const text = await req.text();
      const params = new URLSearchParams(text);
      username = params.get("username") || "";
      password = params.get("password") || "";
      rawMac = params.get("mac") || "";
    } catch {
      console.error("[RADIUS Verify] Could not parse request body");
      return NextResponse.json(
        { "reply:Reply-Message": "Server error" },
        { status: 200 }
      );
    }
  }

  const mac = normalizeMac(rawMac);

  console.log(`[RADIUS Verify] Checking user: ${username}`);

  if (!username) {
    console.log("[RADIUS Verify] Empty username, rejecting");
    return NextResponse.json(
      { "reply:Reply-Message": "No username provided" },
      { status: 200 }
    );
  }

  try {
    // Attempt 1: Guest voucher
    const credential = await db.credential.findUnique({
      where: { voucherCode: username },
    });

    if (credential && credential.status === "ACTIVE") {
      // Check expiration
      if (!credential.expireAt || credential.expireAt > new Date()) {
        // ── Device binding: casa el voucher con el/los MAC del dispositivo ──
        // Si el MAC ya está casado -> pasa. Si es nuevo y hay cupo
        // (< maxDevices) -> lo casa. Si no hay cupo -> rechaza (otro equipo
        // ya usa este voucher).
        if (mac) {
          const bindings = await db.deviceBinding.findMany({
            where: { credentialId: credential.id },
          });
          const alreadyBound = bindings.some((b) => b.mac === mac);
          if (!alreadyBound) {
            if (bindings.length >= credential.maxDevices) {
              console.log(
                `[RADIUS Verify] REJECT device-limit: ${username} mac=${mac} (max ${credential.maxDevices})`
              );
              return NextResponse.json(
                { "reply:Reply-Message": "Voucher en uso en otro dispositivo" },
                { status: 200 }
              );
            }
            // Primera conexión: arranca aquí el reloj de expiración. La
            // credencial se emite "en espera" (expireAt = null) y los días de
            // estancia (o los 30 min de tránsito) empiezan a contar ahora, no
            // al momento de emitir.
            if (bindings.length === 0 && !credential.expireAt) {
              const ms =
                credential.tipo === "TRANSITO"
                  ? 30 * 60 * 1000
                  : ((credential.diasEstancia ?? 1) * 24 + 2) * 60 * 60 * 1000;
              try {
                await db.credential.update({
                  where: { id: credential.id },
                  data: { expireAt: new Date(Date.now() + ms) },
                });
                console.log(`[RADIUS Verify] Reloj iniciado para ${username} (+${ms}ms)`);
              } catch {
                // Si falla el update, la credencial sigue válida (sin expiry aún).
              }
            }

            try {
              await db.deviceBinding.create({
                data: { credentialId: credential.id, mac },
              });
              console.log(`[RADIUS Verify] Bound ${username} -> ${mac}`);
            } catch {
              // Carrera con otra request que casó el mismo MAC: inofensivo.
            }
          }
        }

        console.log(`[RADIUS Verify] ACCEPT voucher: ${username}`);
        return NextResponse.json({
          "control:Auth-Type": "Accept",
          "control:Cleartext-Password": password,
        });
      } else {
        console.log(`[RADIUS Verify] Voucher expired: ${username}`);
      }
    }

    // Médicos y personal tienen acceso "permanente" pero revocable: en vez de
    // autorizar indefinidamente (lo que dejaría al gateway sin volver a
    // consultar nunca y haría imposible revocar a alguien que ya no labora),
    // devolvemos un Session-Timeout para que el gateway revalide contra RADIUS
    // cada N minutos. Termination-Action=RADIUS-Request(1) le pide reautenticar
    // en silencio al vencer, de modo que la sesión se siente permanente pero,
    // al desactivar a la persona, el próximo ciclo la rechaza y la desconecta.
    const reauthMinutes = await getSystemConfig("session_reauth_minutes");
    const sessionTimeout = String(Math.max(1, Math.round(reauthMinutes)) * 60);

    // Attempt 2: Doctor email (insensible a mayúsculas: el gateway envía el
    // correo tal como lo escribió el médico, la DB lo guarda en minúsculas)
    const doctor = await db.doctor.findFirst({
      where: { email: { equals: username.trim(), mode: "insensitive" } },
    });

    if (doctor && doctor.status === "ACTIVE") {
      // ── Device binding: casa el correo del médico con su(s) dispositivo(s),
      // hasta max_devices_doctor. Evita que un médico comparta su correo con
      // muchos equipos. Fail-open: si la tabla aún no existe (migración
      // pendiente) o falla la consulta, se permite el acceso igual.
      if (mac) {
        try {
          const maxDevices = await getSystemConfig("max_devices_doctor");
          const bindings = await db.doctorDeviceBinding.findMany({
            where: { doctorId: doctor.id },
          });
          const alreadyBound = bindings.some((b) => b.mac === mac);
          if (!alreadyBound) {
            if (bindings.length >= maxDevices) {
              console.log(`[RADIUS Verify] REJECT doctor device-limit: ${username} mac=${mac} (max ${maxDevices})`);
              return NextResponse.json(
                { "reply:Reply-Message": "Correo en uso en el máximo de dispositivos permitidos" },
                { status: 200 }
              );
            }
            try {
              await db.doctorDeviceBinding.create({ data: { doctorId: doctor.id, mac } });
              console.log(`[RADIUS Verify] Bound doctor ${username} -> ${mac}`);
            } catch {
              // Carrera con otra request que casó el mismo MAC: inofensivo.
            }
          }
        } catch (e) {
          console.warn(`[RADIUS Verify] doctor binding omitido (¿migración pendiente?):`, e);
        }
      }

      console.log(`[RADIUS Verify] ACCEPT doctor: ${username} (reauth ${sessionTimeout}s)`);
      return NextResponse.json({
        "control:Auth-Type": "Accept",
        "control:Cleartext-Password": password,
        "reply:Session-Timeout": sessionTimeout,
        "reply:Termination-Action": "1",
      });
    }

    // Attempt 3: Staff email (insensible a mayúsculas, mismo motivo)
    const staff = await db.staffUser.findFirst({
      where: { email: { equals: username.trim(), mode: "insensitive" } },
    });

    if (staff && staff.status === "ACTIVE") {
      // ── Device binding: igual que médicos, casa el correo del personal con
      // su(s) dispositivo(s) hasta max_devices_staff. Fail-open si la tabla no
      // existe (migración pendiente) para no romper el acceso.
      if (mac) {
        try {
          const maxDevices = await getSystemConfig("max_devices_staff");
          const bindings = await db.staffDeviceBinding.findMany({
            where: { staffUserId: staff.id },
          });
          const alreadyBound = bindings.some((b) => b.mac === mac);
          if (!alreadyBound) {
            if (bindings.length >= maxDevices) {
              console.log(`[RADIUS Verify] REJECT staff device-limit: ${username} mac=${mac} (max ${maxDevices})`);
              return NextResponse.json(
                { "reply:Reply-Message": "Correo en uso en el máximo de dispositivos permitidos" },
                { status: 200 }
              );
            }
            try {
              await db.staffDeviceBinding.create({ data: { staffUserId: staff.id, mac } });
              console.log(`[RADIUS Verify] Bound staff ${username} -> ${mac}`);
            } catch {
              // Carrera con otra request que casó el mismo MAC: inofensivo.
            }
          }
        } catch (e) {
          console.warn(`[RADIUS Verify] staff binding omitido (¿migración pendiente?):`, e);
        }
      }

      console.log(`[RADIUS Verify] ACCEPT staff: ${username} (reauth ${sessionTimeout}s)`);
      return NextResponse.json({
        "control:Auth-Type": "Accept",
        "control:Cleartext-Password": password,
        "reply:Session-Timeout": sessionTimeout,
        "reply:Termination-Action": "1",
      });
    }

    // No match found
    console.log(`[RADIUS Verify] REJECT - not found: ${username}`);
    return NextResponse.json(
      { "reply:Reply-Message": "Invalid credentials" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RADIUS Verify] DB Error:", error);
    // Even on DB error, return 200 so FreeRADIUS doesn't crash
    return NextResponse.json(
      { "reply:Reply-Message": "Server error" },
      { status: 200 }
    );
  }
}
