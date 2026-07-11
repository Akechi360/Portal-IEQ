"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";

interface LoginClientInternalProps {
  title: string;
  description: string;
  usernamePlaceholder: string;
  endpoint: string;
  initialError?: string;
}

type StatusType = "idle" | "loading" | "error";

export function LoginClientInternal({
  title,
  description,
  usernamePlaceholder,
  endpoint,
  initialError,
}: LoginClientInternalProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<StatusType>("idle");
  const [error, setError] = useState(initialError || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirigir al dashboard según el rol devuelto por el API
        router.push(data.redirect || "/"); 
      } else {
        setStatus("error");
        setError(data.message || "Credenciales inválidas.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setStatus("error");
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      // Mantener en estado de error si lo hay, de lo contrario volver a idle
      if (!error) setStatus("idle");
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        {description}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={usernamePlaceholder}
            disabled={status === "loading"}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={status === "loading"}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {error && status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-3 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 h-[18px] w-[18px]" />
            <div>
              <p className="text-sm text-red-700 font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading" || !username.trim() || !password.trim()}
          className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
        >
          {status === "loading" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Iniciando sesión...
            </>
          ) : (
            <>
              Iniciar Sesión
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
