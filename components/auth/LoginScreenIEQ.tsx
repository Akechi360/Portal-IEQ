'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LoginBackgroundFX } from '@/components/ui/LoginBackgroundFX';

export function LoginScreenIEQ() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Ingrese su usuario y contraseña para continuar.');
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push('/admin/dashboard');
  };

  return (
    <LoginBackgroundFX>
      {/* Card estilo corporativo claro — coherente con el fondo light de Antigravity */}
      <div className="relative w-full rounded-2xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-gray-200/80">

        <div className="mb-8 text-left">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4285F4]">
            Clínica IEQ
          </p>
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-[1.65rem] leading-tight">
            Portal Interno de Conectividad
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Acceda con sus credenciales para gestionar el WiFi institucional.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#4285F4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4285F4]/20"
              placeholder="usuario.admision"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#4285F4] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4285F4]/20"
              placeholder="Ingrese su contraseña"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="group mt-1 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#4285F4] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3367d6] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span>Ingresar al Portal Interno de Conectividad</span>
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-xs text-gray-400 transition-colors hover:text-[#4285F4]">
            ¿Necesitas ayuda con el acceso?
          </a>
        </div>
      </div>
    </LoginBackgroundFX>
  );
}
