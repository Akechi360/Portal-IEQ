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
    <div className="w-full">
      <img
        src="/logo-ieq.png"
        alt="Clínica IEQ Los Mangos"
        className="mb-6 h-16 w-auto select-none"
      />
      <h2 className="text-[22px] font-bold text-neutral-900 tracking-tight">{title}</h2>
      <p className="text-sm text-neutral-500 mt-1.5 mb-7">
        {description}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
            Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={usernamePlaceholder}
            disabled={status === "loading"}
            className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-[15px] focus:outline-none focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        <div className="mb-2">
          <label className="block text-[13px] font-semibold text-neutral-700 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={status === "loading"}
            className="w-full px-4 py-3.5 rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-[15px] focus:outline-none focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500 focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        {error && status === "error" && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-3.5 mt-3 flex items-start gap-2.5">
            <AlertCircle className="text-red-500 shrink-0 h-[17px] w-[17px] mt-0.5" />
            <p className="text-[13px] text-red-700 font-medium leading-snug">
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading" || !username.trim() || !password.trim()}
          className="w-full mt-5 py-3.5 rounded-2xl font-semibold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_14px_28px_-12px_rgba(18,174,180,0.65)] bg-gradient-to-br from-primary-600 to-primary-500 hover:brightness-105"
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
