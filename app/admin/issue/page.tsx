"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AccessRole } from "@/types";

const roleOptions = [
  { label: "Paciente", value: "paciente" },
  { label: "Transito", value: "transito" },
  { label: "Medico", value: "medico" },
];

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface IssuedResult {
  voucherCode: string;
  nombre: string;
  tipo: string;
  maxDevices: number;
  expireAt: string | null;
}

export default function AdminIssuePage() {
  const [role, setRole] = useState<AccessRole>("paciente");
  const [nombre, setNombre] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [diasEstancia, setDiasEstancia] = useState<number | "">("");
  const [maxDevices, setMaxDevices] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IssuedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: meData } = useSWR("/api/auth/me", fetcher);
  const issuerId: string = meData?.user?.sub || "";

  const isMedico = role === "medico";

  const duration = useMemo(() => {
    if (role === "paciente") return "Días de estancia + 2 h adicionales";
    if (role === "transito") return "30 minutos";
    return "Permanente";
  }, [role]);

  const roleDescription = useMemo(() => {
    if (role === "paciente")
      return 'Acceso "Paciente": válido según estancia + 2 horas. Hasta 5 dispositivos.';
    if (role === "transito") return 'Acceso "Tránsito": válido 30 minutos.';
    return 'Los médicos se gestionan en la sección "Médicos" (acceso permanente por correo).';
  }, [role]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setCopied(false);

    if (isMedico) {
      setError('Los médicos se emiten desde la sección "Médicos".');
      return;
    }
    if (nombre.trim().length < 2) {
      setError("Ingresa el nombre de la persona (mín. 2 caracteres).");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        tipo: role === "paciente" ? "PACIENTE" : "TRANSITO",
        nombre: nombre.trim(),
        maxDevices,
        issuerId,
      };
      if (role === "paciente") {
        if (habitacion.trim()) payload.habitacion = habitacion.trim();
        if (diasEstancia !== "" && Number(diasEstancia) >= 1)
          payload.diasEstancia = Number(diasEstancia);
      }

      const res = await fetch("/api/admin/credentials/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message || "No se pudo emitir la credencial.");
        return;
      }
      setResult({
        voucherCode: json.data.voucherCode,
        nombre: json.data.nombre,
        tipo: json.data.tipo,
        maxDevices: json.data.maxDevices,
        expireAt: json.data.expireAt,
      });
      setNombre("");
      setHabitacion("");
      setDiasEstancia("");
    } catch {
      setError("Error de red al emitir la credencial.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-3xl space-y-4">
        <header>
          <h1 className="text-xl font-bold text-neutral-900">Emisión de credenciales de WiFi</h1>
          <p className="text-sm text-neutral-500">Cree acceso para pacientes o visitantes.</p>
        </header>

        <Card>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Select
                label="Tipo de usuario"
                options={roleOptions}
                value={role}
                onChange={(event) => setRole(event.target.value as AccessRole)}
                className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
              />
              <div className="glass-soft mt-2 rounded-lg px-3 py-2 text-sm text-primary-700">
                {roleDescription}
              </div>
            </div>

            {!isMedico && (
              <>
                <Input
                  label="Nombre de la persona"
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
                />

                {role === "paciente" && (
                  <div className="glass-soft space-y-3 rounded-lg border border-white/50 p-3">
                    <Input
                      label="Habitación / área"
                      placeholder="Ej. H-204, Urgencias"
                      value={habitacion}
                      onChange={(e) => setHabitacion(e.target.value)}
                      className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
                    />
                    <Input
                      label="Días de estancia"
                      type="number"
                      min={1}
                      placeholder="Ej. 2"
                      value={diasEstancia}
                      onChange={(e) =>
                        setDiasEstancia(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
                    />
                    <p className="text-xs text-neutral-500">Días de estancia + 2 horas adicionales.</p>
                  </div>
                )}

                <div>
                  <Input
                    label="Máximo de dispositivos (1-5)"
                    type="number"
                    min={1}
                    max={5}
                    value={maxDevices}
                    onChange={(event) =>
                      setMaxDevices(Math.min(5, Math.max(1, Number(event.target.value) || 1)))
                    }
                    required
                    className="rounded-lg border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-300"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Número máximo de dispositivos que puede usar este voucher.
                  </p>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || isMedico}>
              {loading ? "Generando..." : "Generar credencial"}
            </Button>
          </form>
        </Card>

        <Card>
          {result ? (
            <div className="glass-soft mt-1 rounded-lg border border-white/60 px-4 py-3">
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-neutral-400">Nombre:</dt>
                  <dd className="text-sm font-medium text-neutral-900">{result.nombre}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Voucher:</dt>
                  <dd className="text-sm font-mono text-neutral-900">
                    <span className="rounded-lg bg-white/70 px-2 py-1">{result.voucherCode}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Tipo:</dt>
                  <dd className="text-sm capitalize text-neutral-900">
                    {result.tipo === "PACIENTE" ? "Paciente" : "Tránsito"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Duración:</dt>
                  <dd className="text-sm text-neutral-900">{duration}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Vence:</dt>
                  <dd className="text-sm text-neutral-900">
                    {result.expireAt
                      ? new Date(result.expireAt).toLocaleString("es-ES", {
                          timeZone: "America/Caracas",
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-400">Dispositivos máximos:</dt>
                  <dd className="text-sm text-neutral-900">{result.maxDevices}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(result.voucherCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="glass-soft rounded-lg border border-white/60 px-3 py-2 text-sm text-neutral-700 transition-colors duration-150 hover:bg-white/75"
                >
                  {copied ? "✓ Copiado" : "📋 Copiar voucher"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Completa el formulario y presiona Generar credencial.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
