// app/login/LoginClient.tsx
// Componente client-side del portal cautivo único
// Maneja el selector entre "Acceso con código" y "Soy médico"

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Mail, AlertCircle, Wifi, Stethoscope, User, ArrowRight, CheckCircle2, Building2 } from "lucide-react";
import { LoginLayout } from "@/components/login/LoginLayout";

interface LoginClientProps {
  mac: string;
  ip: string;
  redirect: string;
  ssid: string;
}

type TabType = "code" | "doctor" | "staff";
type StatusType = "idle" | "loading" | "success" | "error";

export function LoginClient({ mac, ip, redirect, ssid }: LoginClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("code");
  
  // Formulario de código (PACIENTE / TRANSITO)
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<StatusType>("idle");
  const [codeError, setCodeError] = useState("");
  
  // Formulario de médico
  const [email, setEmail] = useState("");
  const [doctorStatus, setDoctorStatus] = useState<StatusType>("idle");
  const [doctorError, setDoctorError] = useState("");

  // Formulario de Gerencia / Staff
  const [staffEmail, setStaffEmail] = useState("");
  const [staffStatus, setStaffStatus] = useState<StatusType>("idle");
  const [staffError, setStaffError] = useState("");

  // Características para el panel lateral
  const leftFeatures = [
    { icon: "shield" as const, bold: "Conexión segura", text: "con cifrado WPA3" },
    { icon: "zap" as const, bold: "Alta velocidad", text: "hasta 500 Mbps" },
    { icon: "clock" as const, bold: "Disponible", text: "Lun–Vie 06:00–22:00" },
  ];

  // Handler para acceso con código
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setCodeStatus("loading");

    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          voucherCode: code.trim().toUpperCase(),
          mac 
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setCodeStatus("success");
        // Redirigir a página de éxito con los datos del usuario
        const successUrl = new URL("/login/success", window.location.origin);
        successUrl.searchParams.set("plan", data.data?.tipo === "TRANSITO" ? "Transito" : "Paciente");
        successUrl.searchParams.set("nombre", data.data?.nombre || "");
        successUrl.searchParams.set("timeLeft", data.data?.expireAt ? calculateTimeLeft(data.data.expireAt) : "permanente");
        if (data.data?.habitacion) {
          successUrl.searchParams.set("habitacion", data.data.habitacion);
        }
        successUrl.searchParams.set("ssid", "WiFi-ClinicaIEQ");
        
        router.push(successUrl.toString());
      } else {
        setCodeStatus("error");
        setCodeError(data.message || "Código inválido o expirado");
      }
    } catch (err) {
      setCodeStatus("error");
      setCodeError("Error de conexión. Intenta de nuevo.");
    }
  };

  // Handler para acceso de médico
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setDoctorStatus("loading");

    try {
      const res = await fetch("/api/auth/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          voucherCode: email.trim(),
          mac 
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setDoctorStatus("success");
        // Redirigir a página de éxito
        const successUrl = new URL("/login/success", window.location.origin);
        successUrl.searchParams.set("plan", "Medico");
        successUrl.searchParams.set("nombre", data.data?.nombre || "");
        successUrl.searchParams.set("timeLeft", "permanente");
        successUrl.searchParams.set("ssid", "WiFi-ClinicaIEQ");
        
        router.push(successUrl.toString());
      } else {
        setDoctorStatus("error");
        setDoctorError(data.message || "Correo no registrado como médico");
      }
    } catch (err) {
      setDoctorStatus("error");
      setDoctorError("Error de conexión. Intenta de nuevo.");
    } finally {
      setDoctorStatus("idle");
    }
  };

  // Handler simulado para acceso de Gerencia / Staff
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffEmail.includes("@")) {
      setStaffError("Ingresa un correo institucional válido.");
      return;
    }

    setStaffStatus("loading");
    setStaffError("");

    try {
      const res = await fetch("/api/auth/staff-wifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: staffEmail.trim(),
          mac 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStaffStatus("success");
        // Redirigir a página de éxito
        const successUrl = new URL("/login/success", window.location.origin);
        successUrl.searchParams.set("plan", "Staff");
        successUrl.searchParams.set("nombre", data.data?.nombre || "");
        successUrl.searchParams.set("timeLeft", "permanente");
        successUrl.searchParams.set("ssid", "WiFi-ClinicaIEQ");
        
        router.push(successUrl.toString());
      } else {
        setStaffStatus("error");
        setStaffError(data.message || "Error de autenticación.");
      }
    } catch (err) {
      setStaffStatus("error");
      setStaffError("Error de conexión. Intenta de nuevo.");
    } finally {
      setStaffStatus("idle");
    }
  };

  // Helper para calcular tiempo restante
  function calculateTimeLeft(expireAt: string): string {
    const diff = new Date(expireAt).getTime() - Date.now();
    if (diff <= 0) return "0h";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h`;
  }

  return (
    <LoginLayout
      leftColor="#0F172A"
      leftTitle="Bienvenido a\nClínica IEQ"
      leftDescription="Conéctate a nuestra red WiFi institucional de forma segura y rápida."
      leftFeatures={leftFeatures}
      badgeSSID="WiFi-ClinicaIEQ"
    >
      <div className="max-w-sm w-full mx-auto">
        <h2 className="text-2xl font-bold text-gray-900">Acceso WiFi</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">
          Selecciona cómo deseas conectarte
        </p>

        {/* Selector de tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === "code"
                ? "bg-sky-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Ticket className="h-4 w-4" />
              Acceso con código
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("doctor")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === "doctor"
                ? "bg-sky-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Soy médico
            </div>
          </button>
          {/* Nuevo botón para Gerencia / Staff */}
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === "staff"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building2 className="h-4 w-4" />
              Gerencia / Staff
            </div>
          </button>
        </div>

        {/* Panel: Acceso con código */}
        {activeTab === "code" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <form onSubmit={handleCodeSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de acceso
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Ingresa el código que te entregó Admisión
                </p>
                <div className="relative">
                  <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ej: IEQ-3A7F-B12C"
                    disabled={codeStatus === "loading"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent uppercase tracking-widest disabled:opacity-50"
                  />
                </div>
              </div>

              {codeStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3 flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 h-[18px] w-[18px]" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">
                      {codeError || "Código inválido o expirado."}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      Solicita un nuevo código en Admisión.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={codeStatus === "loading" || !code.trim()}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
              >
                {codeStatus === "loading" ? (
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

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>¿No tienes código?</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Solicítalo en <strong>Admisión</strong> o en recepción. 
                Los códigos son válidos por el tiempo de tu estancia.
              </p>
            </div>
          </div>
        )}

        {/* Panel: Soy médico */}
        {activeTab === "doctor" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <form onSubmit={handleDoctorSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo institucional
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Usa tu correo @ieq.com o @ieq.med
                </p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.apellido@ieq.com"
                    disabled={doctorStatus === "loading"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>

              {doctorStatus === "error" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3 flex items-start gap-3">
                  <AlertCircle className="text-amber-500 shrink-0 h-[18px] w-[18px]" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">
                      {doctorError || "Correo no registrado como médico."}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Contacta al departamento de Sistemas para registrarte.
                    </p>
                    <p className="text-xs text-amber-700 font-semibold mt-2">
                      📞 Ext. 101 — Sistemas
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={doctorStatus === "loading" || !email.trim()}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
              >
                {doctorStatus === "loading" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar y conectar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  Acceso permanente
                </p>
              </div>
              <p className="text-xs text-green-600">
                Los médicos registrados tienen acceso ilimitado a la red 
                <strong>WiFi-ClinicaIEQ</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Panel: Gerencia / Staff */}
        {activeTab === "staff" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            <form onSubmit={handleStaffSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo institucional
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Conéctate a la red WiFi con tu correo institucional.
                </p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="nombre@clinicaieq.com"
                    disabled={staffStatus === "loading"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>

              {staffStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3 flex items-start gap-3">
                  <AlertCircle className="text-red-500 shrink-0 h-[18px] w-[18px]" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">
                      {staffError || "Error de autenticación."}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      Verifica tu correo o intenta de nuevo.
                    </p>
                  </div>
                </div>
              )}
              {staffStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-3 flex items-start gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0 h-[18px] w-[18px]" />
                  <div>
                    <p className="text-sm text-green-700 font-medium">
                      Acceso concedido.
                    </p>
                    <p className="text-xs text-green-500 mt-1">
                      Redirigiendo para conectarte...
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={staffStatus === "loading" || !staffEmail.trim()}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
              >
                {staffStatus === "loading" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar y conectar
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("code")} // Volver al tab de código como opción general
                className="w-full mt-2 py-3 rounded-xl font-semibold text-sm text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
              >
                Volver a opciones
              </button>
            </form>
          </div>
        )}

        {/* Info técnica (solo para debugging) */}
        {(mac || ip) && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              {mac && <span>MAC: {mac}</span>}
              {mac && ip && <span> · </span>}
              {ip && <span>IP: {ip}</span>}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
          <span className="text-xs text-gray-500">
            Red disponible ·{" "}
            <span className="font-semibold text-gray-500">WiFi-ClinicaIEQ</span>
          </span>
        </div>
      </div>
    </LoginLayout>
  );
}