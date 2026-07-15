"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Timer,
  Info,
  Minus,
  Plus,
  Ticket,
  CheckCircle2,
  Copy,
} from "lucide-react";

const AREAS = ["UCI Pediátrica", "Hospitalización", "Maternidad", "Pediatría"] as const;

export default function EmitirCredencialPage() {
  const router = useRouter();

  const [tipo, setTipo] = useState<"Paciente" | "Transito">("Paciente");
  const [nombre, setNombre] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [diasEstancia, setDiasEstancia] = useState(1);
  const [maxDispositivos, setMaxDispositivos] = useState(1);
  
  const [resultado, setResultado] = useState<{ codigo: string; expira: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [issuerId, setIssuerId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.sub) {
          setIssuerId(data.user.sub);
        } else {
          setIssuerId("admin_operador_fallback");
        }
      })
      .catch((err) => {
        console.error("Error fetching operator details:", err);
        setIssuerId("admin_operador_fallback");
      });
  }, []);

  const handleGenerar = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/credentials/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tipo === "Paciente" ? "PACIENTE" : "TRANSITO",
          nombre: nombre.trim(),
          habitacion: tipo === "Paciente" && habitacion ? habitacion.trim() : undefined,
          maxDevices: tipo === "Paciente" ? maxDispositivos : 1,
          diasEstancia: tipo === "Paciente" ? diasEstancia : undefined,
          issuerId: issuerId || "admin_operador_fallback",
        }),
      });

      const resData = await res.json();

      if (res.ok && resData.ok) {
        let expira = "";
        if (resData.data?.expireAt) {
          const expDate = new Date(resData.data.expireAt);
          expira = expDate.toLocaleString("es-ES", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }) + " (luego expirará automáticamente)";
        } else {
          expira = tipo === "Paciente"
            ? `${diasEstancia * 24 + 2} horas desde la primera conexión`
            : "30 minutos desde la primera conexión";
        }

        setResultado({ codigo: resData.data.voucherCode, expira });
      } else {
        setError(resData.message || "Error al emitir la credencial.");
      }
    } catch (err) {
      console.error("Error during voucher issuance:", err);
      setError("Error de red. Asegúrate de que el servidor está corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResultado(null);
    setNombre("");
    setHabitacion("");
    setDiasEstancia(1);
    setMaxDispositivos(1);
    setError("");
  };

  return (
    <div className="max-w-lg mx-auto">
      
      {/* HEADER DE PÁGINA */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push("/admision/dashboard")}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Emitir credencial</h1>
          <p className="text-sm text-gray-500">Genera acceso WiFi para un visitante</p>
        </div>
      </div>

      {/* RESULTADO (Éxito) */}
      {resultado ? (
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6 text-center">
          <CheckCircle2 className="text-green-500 w-8 h-8 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Credencial generada</h2>
          <p className="text-sm text-gray-500 mt-4 mb-2">Código de acceso:</p>
          
          <div className="font-mono text-3xl font-bold text-gray-900 tracking-widest bg-gray-50 rounded-xl py-3 px-6 border border-dashed border-gray-300 w-fit mx-auto">
            {resultado.codigo}
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(resultado.codigo)}
            className="bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2 mx-auto mt-3 transition-colors text-gray-700 font-medium"
          >
            <Copy className="w-4 h-4" />
            Copiar código
          </button>

          <p className="text-xs text-gray-400 mt-4">Expira: {resultado.expira}</p>

          <div className="border-t border-gray-100 my-4" />

          <button
            onClick={resetForm}
            className="text-primary-500 font-medium text-sm hover:underline"
          >
            Emitir otra credencial
          </button>

          <button
            onClick={() => router.push("/admision/credenciales")}
            className="block w-full bg-gray-900 hover:bg-gray-800 transition-colors text-white rounded-xl px-4 py-3 text-sm font-medium mt-4"
          >
            Ver todas las credenciales
          </button>
        </div>
      ) : (
        /* CARD FORMULARIO */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          
          {/* SELECTOR DE TIPO */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de acceso
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTipo("Paciente")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 text-sm font-medium transition-all ${
                  tipo === "Paciente"
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                <BedDouble className="w-4 h-4" />
                Paciente
              </button>
              <button
                onClick={() => setTipo("Transito")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 px-4 text-sm font-medium transition-all ${
                  tipo === "Transito"
                    ? "bg-primary-500 text-white border-primary-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                <Timer className="w-4 h-4" />
                Tránsito
              </button>
            </div>
          </div>

          {/* INFO DE TRÁNSITO */}
          {tipo === "Transito" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
              <Info className="text-amber-500 w-[14px] h-[14px] shrink-0 mt-0.5" />
              <span className="text-xs text-amber-700">
                Acceso de duración fija: 30 minutos &middot; 1 dispositivo
              </span>
            </div>
          )}

          {/* CAMPO NOMBRE */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tipo === "Paciente" ? "Nombre del paciente" : "Nombre del visitante"}
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={tipo === "Paciente" ? "Ej: Juan Pérez" : "Ej: Carlos Mendoza"}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* CAMPOS SOLO PARA PACIENTE */}
          {tipo === "Paciente" && (
            <>
              {/* CAMPO ÁREA */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área de hospitalización
                </label>
                <div className="relative">
                  <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={habitacion}
                    onChange={(e) => setHabitacion(e.target.value)}
                    className="w-full appearance-none pl-10 pr-9 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.75rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.25em 1.25em",
                    }}
                  >
                    <option value="" disabled>Selecciona el área…</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DÍAS DE ESTANCIA */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de estancia estimados
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDiasEstancia(Math.max(1, diasEstancia - 1))}
                    className="bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-[14px] h-[14px] text-gray-600" />
                  </button>
                  <span className="text-xl font-bold text-gray-900 w-8 text-center">
                    {diasEstancia}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDiasEstancia(Math.min(30, diasEstancia + 1))}
                    className="bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-[14px] h-[14px] text-gray-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  El código expirará {diasEstancia * 24 + 2}h después de su primera conexión
                </p>
              </div>

              {/* DISPOSITIVOS MÁXIMOS */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dispositivos permitidos (paciente + acompañantes)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxDispositivos(num)}
                      className={`rounded-xl py-2 text-sm font-semibold transition-colors ${
                        maxDispositivos === num
                          ? "bg-primary-500 text-white"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          {/* BOTÓN GENERAR */}
          <button
            onClick={handleGenerar}
            disabled={!nombre.trim() || (tipo === "Paciente" && !habitacion) || loading}
            className="w-full mt-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generando...
              </>
            ) : (
              <>
                <Ticket className="w-[18px] h-[18px]" />
                Generar credencial
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
