import { NextResponse } from "next/server";
import { guestLogin, doctorLogin } from "@/lib/access";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // rlm_rest usually sends JSON with the credentials
    const body = await req.json();
    const { username, password } = body;

    if (!username) {
      return NextResponse.json({ "control:Auth-Type": "Reject" }, { status: 401 });
    }

    // Attempt 1: Guest (Voucher)
    const guestRes = await guestLogin({ voucherCode: username, mac: "" });
    if (guestRes.ok) {
      return NextResponse.json({ "control:Auth-Type": "Accept" });
    }

    // Attempt 2: Doctor (Email)
    const docRes = await doctorLogin({ voucherCode: username, mac: "" });
    if (docRes.ok) {
      return NextResponse.json({ "control:Auth-Type": "Accept" });
    }

    // Attempt 3: Staff (Email)
    const staff = await db.staffUser.findUnique({ where: { email: username } });
    if (staff && staff.status === "ACTIVE") {
      return NextResponse.json({ "control:Auth-Type": "Accept" });
    }

    // If all fail
    return NextResponse.json({ "control:Auth-Type": "Reject" }, { status: 401 });
  } catch (error) {
    console.error("[RADIUS Verify] Error:", error);
    return NextResponse.json({ "control:Auth-Type": "Reject" }, { status: 500 });
  }
}
