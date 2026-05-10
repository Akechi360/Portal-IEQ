"use client";

import { Wifi, ShieldCheck, Zap, Clock, User, Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin/dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-neutral-900">
      
      {/* Left Panel - Dark Branding */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#0a1128] px-12 py-12 text-white">
        
        {/* Background Decorative Circles */}
        <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full border-[1px] border-white/5" />
        <div className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] rounded-full border-[1px] border-white/5" />
        <div className="absolute left-[10%] top-[20%] h-[800px] w-[800px] rounded-full border-[1px] border-white/5" />

        {/* Content wrapper with z-index to stay above background */}
        <div className="relative z-10 flex flex-col h-full">
          
          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 shadow-lg shadow-sky-500/20">
              <Wifi className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Portal IEQ</h1>
              <p className="text-xs text-neutral-400">Control de acceso WiFi</p>
            </div>
          </div>

          {/* Main Typography */}
          <div className="max-w-md">
            <h2 className="text-5xl font-bold leading-tight tracking-tight mb-6">
              Bienvenido a la <br />
              red WiFi <span className="text-sky-500">IEQ</span>
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed mb-12">
              Inicia sesión para conectarte a la red institucional y disfrutar de acceso seguro a internet.
            </p>

            {/* Feature List */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10">
                  <ShieldCheck className="h-5 w-5 text-sky-500" />
                </div>
                <p className="text-sm font-medium">
                  <span className="font-bold text-white">Conexión segura</span> <span className="text-neutral-400">con cifrado WPA3</span>
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10">
                  <Zap className="h-5 w-5 text-sky-500" />
                </div>
                <p className="text-sm font-medium">
                  <span className="font-bold text-white">Alta velocidad</span> <span className="text-neutral-400">hasta 500 Mbps</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10">
                  <Clock className="h-5 w-5 text-sky-500" />
                </div>
                <p className="text-sm font-medium">
                  <span className="font-bold text-white">Disponible</span> <span className="text-neutral-400">Lun-Vie 06:00-22:00</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-12">
            <p className="text-xs text-neutral-500">
              &copy; 2026 IEQ - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2 px-8 py-12 bg-white">
        <div className="w-full max-w-[400px]">
          
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-neutral-900 mb-2">Iniciar sesión</h3>
            <p className="text-sm text-neutral-500">Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User/Email Field */}
            <div>
              <label className="mb-2 block text-xs font-medium text-neutral-600">
                Usuario o correo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="usuario@ieq.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-[#2b2b2b] py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-2 block text-xs font-medium text-neutral-600">
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-[#2b2b2b] py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link href="#" className="text-xs font-medium text-sky-500 hover:text-sky-600">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-600 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Conectarme a la red
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-neutral-400">o</span>
            </div>
          </div>

          {/* Guest Access Button */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 active:scale-[0.98]"
          >
            <User className="h-4 w-4" />
            Acceso como invitado
          </button>

          {/* Status Bar */}
          <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 py-3 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Red disponible <span className="font-bold">IEQ-STAFF / IEQ-GUEST</span>
          </div>

          {/* Bottom Link */}
          <div className="mt-8 text-center text-xs text-neutral-500">
            ¿No tienes cuenta?{" "}
            <Link href="#" className="font-medium text-sky-500 hover:text-sky-600">
              Solicitar acceso
            </Link>
          </div>

        </div>
      </div>
      
    </div>
  );
}
