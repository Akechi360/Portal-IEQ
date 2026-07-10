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
export async function POST(req: Request) {
  let username = "";
  let password = "";

  try {
    // Try JSON first (our config sends JSON)
    const body = await req.json();
    username = body.username || "";
    password = body.password || "";
  } catch {
    // If JSON parsing fails, try form-urlencoded
    try {
      const text = await req.text();
      const params = new URLSearchParams(text);
      username = params.get("username") || "";
      password = params.get("password") || "";
    } catch {
      console.error("[RADIUS Verify] Could not parse request body");
      return NextResponse.json(
        { "reply:Reply-Message": "Server error" },
        { status: 200 }
      );
    }
  }

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
        console.log(`[RADIUS Verify] ACCEPT voucher: ${username}`);
        return NextResponse.json({
          "control:Auth-Type": "Accept",
          "control:Cleartext-Password": password,
        });
      } else {
        console.log(`[RADIUS Verify] Voucher expired: ${username}`);
      }
    }

    // Attempt 2: Doctor email
    const doctor = await db.doctor.findUnique({
      where: { email: username },
    });

    if (doctor && doctor.status === "ACTIVE") {
      console.log(`[RADIUS Verify] ACCEPT doctor: ${username}`);
      return NextResponse.json({
        "control:Auth-Type": "Accept",
        "control:Cleartext-Password": password,
      });
    }

    // Attempt 3: Staff email
    const staff = await db.staffUser.findUnique({
      where: { email: username },
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
