"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  BedDouble,
  Clock,
  Smartphone,
  User,
  Stethoscope,
  Wifi,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  
  const ssid = searchParams.get("ssid");
  const plan = searchParams.get("plan");
  const nombre = searchParams.get("nombre");
  const devicesUsed = searchParams.get("devicesUsed");
  const maxDevices = searchParams.get("maxDevices");
  const timeLeft = searchParams.get("timeLeft");
  const habitacion = searchParams.get("habitacion");

  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md mx-auto">
        
        {/* 1. ÍCONO DE ÉXITO ANIMADO */}
        <div className={`mx-auto w-16 h-16 mb-6 bg-green-100 rounded-full flex items-center justify-center ${animate ? "animate-bounce" : ""}`}>
          <CheckCircle2 className="text-green-500 w-9 h-9" />
        </div>

        {/* 2. TÍTULO */}
        <h1 className="text-2xl font-bold text-gray-900 text-center">
          ¡Acceso concedido!
        </h1>

        {/* 3. SUBTÍTULO */}
        <p className="text-sm text-gray-500 text-center mt-1 mb-6">
          Ya estás conectado a la red WiFi de Clínica IEQ
        </p>

        {/* 4. SEPARADOR */}
        <div className="border-t border-gray-100" />

        {/* 5. INFO SEGÚN PLAN */}
        <div className="mt-6 flex flex-col gap-3">
          
          {plan === "Paciente" && (
            <>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Habitación</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{habitacion}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Tiempo disponible</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{timeLeft}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Dispositivos</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {devicesUsed} de {maxDevices} conectados
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Acceso para</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">Paciente y acompañantes</span>
              </div>
            </>
          )}

          {plan === "Medico" && (
            <>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Médico</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{nombre}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Tipo de acceso</span>
                </div>
                <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
                  Permanente
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Red asignada</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">IEQ-MEDICOS</span>
              </div>
            </>
          )}

          {plan === "Transito" && (
            <>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Tiempo disponible</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">30 minutos</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Dispositivos</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">1 dispositivo</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 mt-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Nota</span>
                    <span className="text-xs text-amber-600 mt-0.5">El acceso expira 30 min tras la primera conexión</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* 6. BOTÓN PRINCIPAL */}
        <button
          onClick={() => (window.location.href = "https://www.ieq.com/bienvenida")}
          className="mt-6 w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <ExternalLink className="w-4 h-4" />
          Ir a www.ieq.com/bienvenida
        </button>

        {/* 7. TEXTO SECUNDARIO */}
        <p className="mt-3 text-center text-xs text-gray-400">
          Puedes cerrar esta ventana en cualquier momento.
        </p>

        {/* 8. BADGE DE SSID */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              ssid === "medicos" ? "bg-blue-500" : "bg-green-500"
            }`}
          />
          <span className="text-xs text-gray-400">
            Conectado a{" "}
            <span
              className={`font-semibold ${
                ssid === "medicos" ? "text-blue-600" : "text-green-600"
              }`}
            >
              {ssid === "medicos" ? "IEQ-MEDICOS" : "IEQ-GUEST"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Envuelve el contenido en Suspense para evitar errores de hidratación con useSearchParams en App Router
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SuccessContent />
    </Suspense>
  );
}
