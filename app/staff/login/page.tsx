// app/staff/login/page.tsx
// Login interno único para personal de Admisión y Sistemas
// Acceso desde PC conectado a red interna ClinicaIEQ-Interno
// Backend resuelve el rol y redirige al dashboard correspondiente

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, AlertCircle, LogIn, Building2, Shield } from "lucide-react";
import { LoginLayout } from "@/components/login/LoginLayout";

// Tipos de roles esperados del backend
// ADMISION -> /admision
// ADMIN / SUPERADMIN / SISTEMAS -> /admin

type LoginStatus = "idle" | "loading" | "error";

export default function StaffLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      // Endpoint unificado para login de staff
      const res = await fetch("/api/auth/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: usuario.trim(), 
          password 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Backend resuelve el rol y devuelve la ruta de redirección
        router.push(data.redirect);
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Error de conexión. Verifica tu red e intenta de nuevo.");
    }
  };

  const leftFeatures = [
    { icon: "shield" as const, bold: "Acceso restringido", text: "solo personal autorizado" },
    { icon: "users" as const, bold: "Gestión institucional", text: "admisión y sistemas" },
    { icon: "zap" as const, bold: "Panel en tiempo real", text: "monitoreo y control" },
  ];

  return (
    <LoginLayout
      leftColor="#1e293b"
      leftTitle="Acceso\nInterno IEQ"
      leftDescription="Portal de acceso exclusivo para el personal de Clínica IEQ."
      leftFeatures={leftFeatures}
      badgeSSID="ClinicaIEQ-Interno"
    >
      <div className="max-w-sm w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
          <p className="text-sm text-gray-500 mt-1">
            Personal de Admisión y Sistemas
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Tu usuario institucional"
                disabled={status === "loading"}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={status === "loading"}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 h-[18px] w-[18px]" />
              <div>
                <p className="text-sm text-red-700 font-medium">
                  {errorMsg || "Credenciales incorrectas"}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Verifica tu usuario y contraseña.
                </p>
              </div>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={status === "loading" || !usuario.trim() || !password.trim()}
            className="w-full mt-6 py-3 rounded-xl font-semibold text-sm bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
          >
            {status === "loading" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verificando...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Ingresar al sistema
              </>
            )}
          </button>
        </form>

        {/* Ayuda */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-700">
                <strong>¿Problemas para acceder?</strong>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Contacta al departamento de Sistemas.
                <br />
                <span className="font-medium">Ext. 101</span> o{" "}
                <span className="font-medium">sistemas@ieq.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 bg-slate-100 rounded-xl py-2.5 px-4">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Red Interna · Clínica IEQ</span>
          </span>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Este acceso es exclusivo para personal autorizado.
        </p>
      </div>
    </LoginLayout>
  );
}
