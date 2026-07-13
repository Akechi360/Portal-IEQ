import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    // Attempt 2: Doctor email (insensible a mayúsculas: el gateway envía el
    // correo tal como lo escribió el médico, la DB lo guarda en minúsculas)
    const doctor = await db.doctor.findFirst({
      where: { email: { equals: username.trim(), mode: "insensitive" } },
    });

    if (doctor && doctor.status === "ACTIVE") {
      console.log(`[RADIUS Verify] ACCEPT doctor: ${username}`);
      return NextResponse.json({
        "control:Auth-Type": "Accept",
        "control:Cleartext-Password": password,
      });
    }

    // Attempt 3: Staff email (insensible a mayúsculas, mismo motivo)
    const staff = await db.staffUser.findFirst({
      where: { email: { equals: username.trim(), mode: "insensitive" } },
    });

    if (staff && staff.status === "ACTIVE") {
      console.log(`[RADIUS Verify] ACCEPT staff: ${username}`);
      return NextResponse.json({
        "control:Auth-Type": "Accept",
        "control:Cleartext-Password": password,
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
