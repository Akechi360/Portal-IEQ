"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Ingrese su usuario y contrasena para continuar.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/admin/dashboard");
  };

  return (
    <main className="flex items-center justify-center">
      <section className="glass-panel w-full max-w-md rounded-xl border border-white/60 p-6">
        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Clinica IEQ</p>
          <h1 className="mt-1 text-xl font-bold text-neutral-900">Portal Interno de Conectividad</h1>
          <p className="mt-1 text-sm text-neutral-500">Acceda con sus credenciales para gestionar el WiFi institucional.</p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-neutral-600">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="glass-input h-10 w-full rounded-lg border border-white/60 px-3 text-sm text-neutral-800 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
              placeholder="usuario.admision"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-600">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="glass-input h-10 w-full rounded-lg border border-white/60 px-3 text-sm text-neutral-800 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
              placeholder="Ingrese su contrasena"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-400 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
            {loading ? "Validando..." : "Ingresar al Portal Interno de Conectividad"}
          </button>
        </form>
      </section>
    </main>
  );
}
