"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wifi,
  ShieldCheck,
  Zap,
  Clock,
  User,
  Lock,
  LogOut // just in case for a different icon, let's use LogIn maybe? Actually, "Conectarme a la red" might just have no icon in the image. Ah, it has an icon that looks like a login box or file. Let's use LogIn.
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("usuario@ieq.com");
  const [password, setPassword] = useState("••••••");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/admin/dashboard");
  };

  return (
    <main className="fixed inset-0 flex bg-white font-sans text-neutral-900">
      {/* Left Pane - Dark Blue */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0a1122] p-12 lg:flex xl:p-16">
        {/* Background Circles */}
        <div className="pointer-events-none absolute -left-64 -top-64 h-[800px] w-[800px] rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -bottom-96 -left-32 h-[800px] w-[800px] rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -right-32 top-32 h-[600px] w-[600px] rounded-full border border-white/5" />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-400 text-white shadow-lg">
            <Wifi className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Portal IEQ</h2>
            <p className="text-sm text-neutral-400">Control de acceso WiFi</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 my-auto max-w-md pt-8">
          <h1 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
            Bienvenido a la<br />
            red WiFi <span className="text-primary-400">IEQ</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-400">
            Inicia sesión para conectarte a la red institucional y disfrutar de acceso seguro a internet.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900/40 text-primary-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-sm text-white">
                <span className="font-semibold">Conexión segura</span> <span className="text-neutral-400">con cifrado WPA3</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900/40 text-primary-400">
                <Zap className="h-5 w-5" />
              </div>
              <p className="text-sm text-white">
                <span className="font-semibold">Alta velocidad</span> <span className="text-neutral-400">hasta 500 Mbps</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900/40 text-primary-400">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-sm text-white">
                <span className="font-semibold">Disponible</span> <span className="text-neutral-400">Lun–Vie 06:00–22:00</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm text-neutral-500">
            © 2026 IEQ · Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* Right Pane - White */}
      <div className="flex w-full items-center justify-center bg-white p-8 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-neutral-900">Iniciar sesión</h2>
            <p className="mt-2 text-base text-neutral-500">Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700">
                Usuario o correo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block h-12 w-full rounded-lg bg-[#333333] pl-10 pr-3 text-white placeholder-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  placeholder="usuario@ieq.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block h-12 w-full rounded-lg bg-[#333333] pl-10 pr-3 text-white placeholder-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
                  placeholder="••••••"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-sm font-medium text-primary-500 hover:text-primary-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* "Conectarme a la red" button (Disabled appearance as in image) */}
            <button
              type="submit"
              disabled
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-neutral-100 bg-white text-sm font-medium text-neutral-200 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Conectarme a la red
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="mx-4 flex-shrink-0 text-sm text-neutral-400">o</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            {/* "Acceso como invitado" button */}
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <User className="h-4 w-4" />
              Acceso como invitado
            </button>

            {/* Status indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>
                Red disponible · <span className="font-semibold">IEQ-STAFF / IEQ-GUEST</span>
              </span>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm text-neutral-500">
                ¿No tienes cuenta?{" "}
                <Link href="#" className="font-medium text-primary-500 hover:text-primary-600 hover:underline">
                  Solicitar acceso
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

