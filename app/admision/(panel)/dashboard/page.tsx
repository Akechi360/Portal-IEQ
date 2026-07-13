"use client";

import Link from "next/link";
import { PlusCircle, ArrowRight, ClipboardList, List } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdmisionDashboardPage() {
  const { data, isLoading } = useSWR("/api/list", fetcher, { refreshInterval: 10000 });

  // Calcular saludo
  const hour = new Date().getHours();
  let greeting = "Buenas tardes";
  if (hour < 12) greeting = "Buenos días";
  else if (hour > 19) greeting = "Buenas noches";

  // Formatear fecha
  const formatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateStr = formatter.format(new Date());
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const items = data?.items || [];
  const today = new Date().toISOString().split('T')[0];

  const credencialesHoy = items.filter((c: any) => c.createdAt.startsWith(today) && (c.type === 'PACIENTE' || c.type === 'TRANSITO')).length;
  const pacientesActivos = items.filter((c: any) => c.type === 'PACIENTE' && c.status === 'Active').length;
  const transitoActivos = items.filter((c: any) => c.type === 'TRANSITO' && c.status === 'Active').length;
  const totalActivos = pacientesActivos + transitoActivos || 1;
  const pacientesPct = Math.round((pacientesActivos / totalActivos) * 100);

  return (
    <div className="mx-auto max-w-2xl">

      {/* Turno + credenciales de hoy — hermano compacto del hero del admin */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-500 p-6 text-white shadow-[0_20px_44px_-18px_rgba(13,111,120,0.5)]">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-medium text-primary-50/85">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Turno activo
            </p>
            <h1 className="mt-2 text-xl font-bold tracking-tight">{greeting}, Operador</h1>
            <p className="text-sm text-primary-50/75">{formattedDate}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold leading-none tabular-nums">{isLoading ? "–" : credencialesHoy}</p>
            <p className="mt-1 text-xs text-primary-50/80">credenciales hoy</p>
          </div>
        </div>
      </div>

      {/* Split de activos: proporción real paciente/tránsito, no dos cajas sueltas */}
      <div className="mb-8 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.16)]">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            Pacientes activos · <span className="font-semibold text-neutral-800 tabular-nums">{isLoading ? "-" : pacientesActivos}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Tránsito activos · <span className="font-semibold text-neutral-800 tabular-nums">{isLoading ? "-" : transitoActivos}</span>
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-neutral-100">
          <div className="bg-primary-500 transition-[width] duration-500 ease-out" style={{ width: `${pacientesPct}%` }} />
          <div className="flex-1 bg-amber-400" />
        </div>
      </div>

      {/* ACCIONES PRINCIPALES */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Acciones rápidas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* CARD ACCIÓN 1 — primaria, tratamiento teal (el único acento fuerte) */}
          <Link href="/admision/emitir" className="group block h-full">
            <div className="flex h-full flex-col rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.16)] transition-all hover:border-primary-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_14px_34px_-12px_rgba(15,23,42,0.2)]">
              <div className="mb-4 w-fit rounded-xl bg-primary-600 p-3 shadow-[0_8px_16px_-8px_rgba(13,111,120,0.6)] transition-colors group-hover:bg-primary-700">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Emitir credencial nueva
              </h3>
              <p className="text-sm text-neutral-500 mt-1 mb-4 flex-1">
                Genera acceso WiFi para un Paciente o persona en Tránsito
              </p>
              <div className="bg-primary-600 group-hover:bg-primary-700 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 w-fit transition-colors">
                <ArrowRight className="w-[14px] h-[14px]" />
                Emitir ahora
              </div>
            </div>
          </Link>

          {/* CARD ACCIÓN 2 — secundaria, neutral */}
          <Link href="/admision/credenciales" className="group block h-full">
            <div className="flex h-full flex-col rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.16)] transition-all hover:border-neutral-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_14px_34px_-12px_rgba(15,23,42,0.2)]">
              <div className="bg-neutral-100 rounded-xl p-3 w-fit mb-4 group-hover:bg-neutral-200 transition-colors">
                <ClipboardList className="text-neutral-600 w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Credenciales de hoy
              </h3>
              <p className="text-sm text-neutral-500 mt-1 mb-4 flex-1">
                Consulta todos los accesos generados durante el turno actual
              </p>
              <div className="bg-neutral-900 hover:bg-neutral-700 text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 w-fit transition-colors">
                <List className="w-[14px] h-[14px]" />
                Ver listado
              </div>
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}
