import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, mac } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Correo institucional inválido" },
        { status: 400 }
      );
    }

    // Simulación de autenticación (mock)
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simular carga

    if (email.includes("notfound@")) {
      return NextResponse.json(
        { success: false, message: "Correo no encontrado en el registro de Staff." },
        { status: 404 }
      );
    }

    if (email.includes("error@")) {
      return NextResponse.json(
        { success: false, message: "Error temporal del sistema. Intenta de nuevo más tarde." },
        { status: 500 }
      );
    }

    // Simular éxito para cualquier otro correo válido
    return NextResponse.json({
      success: true,
      message: "Acceso concedido.",
      data: {
        email: email,
        name: "Staff IEQ", // Nombre mock
        mac: mac,
        accessType: "STAFF",
        sessionId: "mock_staff_session_id", // ID de sesión mock
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
