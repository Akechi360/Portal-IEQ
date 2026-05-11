"use client";

import { useState } from "react";
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

export default function EmitirCredencialPage() {
  const router = useRouter();

  const [tipo, setTipo] = useState<"Paciente" | "Transito">("Paciente");
  const [nombre, setNombre] = useState("");
  const [habitacion, setHabitacion] = useState("");
  const [diasEstancia, setDiasEstancia] = useState(1);
  const [maxDispositivos, setMaxDispositivos] = useState(1);
  
  const [resultado, setResultado] = useState<{ codigo: string; expira: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerar = async () => {
    if (!nombre.trim()) return;
    setLoading(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1000));

    // Generar código
    const codePart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codePart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigo = `${codePart1}-${codePart2}`;

    let expira = "";
    if (tipo === "Paciente") {
      expira = `${diasEstancia * 24 + 2} horas desde la primera conexión`;
    } else {
      expira = "30 minutos desde primera conexión";
    }

    setResultado({ codigo, expira });
    setLoading(false);
  };

  const resetForm = () => {
    setResultado(null);
    setNombre("");
    setHabitacion("");
    setDiasEstancia(1);
    setMaxDispositivos(1);
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
            className="text-sky-500 font-medium text-sm hover:underline"
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
                    ? "bg-sky-500 text-white border-sky-500"
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
                    ? "bg-sky-500 text-white border-sky-500"
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
              Nombre del visitante
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={tipo === "Paciente" ? "Ej: Juan Pérez" : "Ej: Carlos Mendoza"}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* CAMPOS SOLO PARA PACIENTE */}
          {tipo === "Paciente" && (
            <>
              {/* CAMPO HABITACIÓN */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de habitación
                </label>
                <div className="relative">
                  <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={habitacion}
                    onChange={(e) => setHabitacion(e.target.value)}
                    placeholder="Ej: 302-A"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
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
                          ? "bg-sky-500 text-white"
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

          {/* BOTÓN GENERAR */}
          <button
            onClick={handleGenerar}
            disabled={!nombre.trim() || loading}
            className="w-full mt-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
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
