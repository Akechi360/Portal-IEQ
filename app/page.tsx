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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-6">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Clinica IEQ</p>
          <h1 className="mt-1 text-xl font-bold text-gray-900">Portal Interno de Conectividad</h1>
          <p className="mt-1 text-sm text-gray-600">Acceda con sus credenciales para gestionar el WiFi institucional.</p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario.admision"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese su contrasena"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
            {loading ? "Validando..." : "Ingresar al Portal Interno de Conectividad"}
          </button>
        </form>
      </section>
    </main>
  );
}
