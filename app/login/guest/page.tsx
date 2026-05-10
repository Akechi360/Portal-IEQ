"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, AlertCircle, Wifi, Stethoscope, ChevronRight } from "lucide-react";
import { LoginLayout } from "@/components/login/LoginLayout";

export default function GuestLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === "") return;

    setStatus("loading");

    // Simular llamada a API de validación
    await new Promise((r) => setTimeout(r, 1500));

    // Lógica mock: si empieza con A es válido
    if (code.trim().toUpperCase().startsWith("A")) {
      router.push(
        "/login/success?ssid=guest&plan=Paciente&nombre=Paciente&devicesUsed=1&maxDevices=4&timeLeft=72h&habitacion=302-A"
      );
    } else {
      setStatus("error");
      setErrorMsg("Código inválido o expirado.");
    }
  };

  const leftFeatures: Array<{ icon: "shield" | "zap" | "clock" | "infinity" | "users"; bold: string; text: string }> = [
    { icon: "shield", bold: "Conexión segura", text: "con cifrado WPA3" },
    { icon: "zap", bold: "Alta velocidad", text: "hasta 500 Mbps" },
    { icon: "clock", bold: "Disponible", text: "Lun–Vie 06:00–22:00" },
  ];

  return (
    <LoginLayout
      leftColor="#0F172A"
      leftTitle="Bienvenido a la\nred WiFi IEQ"
      leftDescription="Inicia sesión para conectarte a la red institucional y disfrutar de acceso seguro a internet."
      leftFeatures={leftFeatures}
      badgeSSID="IEQ-GUEST"
    >
      <div className="max-w-sm w-full mx-auto">
        <h2 className="text-2xl font-bold text-gray-900">Acceso WiFi</h2>
        <p className="text-sm text-gray-500 mt-1 mb-8">Ingresa el código que te entregó Admisión</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de acceso
            </label>
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: A3F9-2K7X"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent uppercase tracking-widest"
              />
            </div>
          </div>

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 h-[18px] w-[18px]" />
              <div>
                <p className="text-sm text-red-700 font-medium">
                  {errorMsg || "Código inválido o expirado."}
                </p>
                <p className="text-xs text-red-500">
                  Solicita un nuevo código en Admisión o recepción.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full mt-6 py-3 rounded-xl font-semibold text-sm bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verificando...
              </>
            ) : (
              <>
                Conectarme
                <Wifi className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="bg-gray-200 h-px flex-1" />
          <span className="text-xs text-gray-400">o</span>
          <div className="bg-gray-200 h-px flex-1" />
        </div>

        <button
          type="button"
          onClick={() => router.push("/login/medicos")}
          className="w-full mt-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium flex items-center gap-2"
        >
          <div className="flex flex-1 items-center justify-center gap-2 ml-4">
            <Stethoscope className="h-4 w-4 text-gray-500" />
            Soy médico de la clínica
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
        </button>

        <div className="mt-8 w-full flex items-center justify-center gap-2 bg-green-50 border border-green-100 rounded-xl py-2.5 px-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">
            Red disponible &middot;{" "}
            <span className="font-semibold text-green-600 text-xs">IEQ-GUEST</span>
          </span>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          ¿No tienes código? Solicítalo en <span className="text-sky-500 font-medium">Admisión</span> o en recepción.
        </p>
      </div>
    </LoginLayout>
  );
}
