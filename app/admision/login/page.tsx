<<<<<<< HEAD
// app/admision/login/page.tsx
// ⚠️ LEGACY — DEPRECATED
// Esta ruta está obsoleta. El login interno unificado ahora vive en /staff/login
// Fecha de deprecación: 2026-05-11
// TODO: Eliminar en una versión futura cuando se confirme que no hay dependencias

import { redirect } from "next/navigation";

export default function AdmisionLoginPageLegacy() {
  // Redirigir al nuevo login unificado para staff
  redirect("/staff/login");
=======
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, AlertCircle, LogIn } from "lucide-react";
import { LoginLayout } from "@/components/login/LoginLayout";

export default function AdmisionLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/admision/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(data.redirect || "/admision/dashboard");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  const leftFeatures: Array<{ icon: "shield" | "zap" | "clock" | "infinity" | "users"; bold: string; text: string }> = [
    { icon: "users", bold: "Gestión de pacientes", text: "emite credenciales de acceso" },
    { icon: "zap", bold: "Acceso rápido", text: "genera códigos en segundos" },
    { icon: "shield", bold: "Seguro", text: "acceso exclusivo para tu rol" },
  ];

  return (
    <LoginLayout
      leftColor="#0F172A"
      leftTitle="Panel de\nAdmisión IEQ"
      leftDescription="Acceso para el personal de admisión y recepción de la clínica."
      leftFeatures={leftFeatures}
      badgeSSID="Panel · Admisión"
      badgePrefix=""
      badgeTheme="slate"
    >
      <div className="max-w-sm w-full mx-auto">
        <h2 className="text-2xl font-bold text-gray-900">Iniciar sesión</h2>
        <p className="text-sm text-gray-500 mt-1 mb-8">Ingresa tus credenciales de operador</p>

        <form onSubmit={handleSubmit}>
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
                placeholder="admision"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 h-[18px] w-[18px]" />
              <p className="text-sm text-red-700">
                Credenciales incorrectas. Verifica tu usuario y contraseña.
              </p>
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
                <LogIn className="h-4 w-4" />
                Ingresar al panel
              </>
            )}
          </button>
        </form>

        <div className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Panel de Admisión · IEQ</span>
          </span>
        </div>
      </div>
    </LoginLayout>
  );
>>>>>>> 53f8a2c92a064c1299ac43fdff28034dd65a9b27
}
