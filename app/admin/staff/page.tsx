"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import {
  UserPlus,
  Search,
  Ban,
  RotateCcw,
  Loader2,
  X,
  Upload,
} from "lucide-react";
import { parseCsv } from "@/lib/csv";
import { confirmAction } from "@/lib/alerts";

interface Staff {
  id: string;
  nombre: string | null;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export default function StaffPage() {
  const [filtro, setFiltro] = useState<"todos" | "activo" | "inactivo">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [modalStaff, setModalStaff] = useState({ nombre: "", email: "" });
  const [modalError, setModalError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ createdCount: number; skipped: { row: number; email?: string; reason: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, mutate } = useSWR("/api/admin/staff", (url) =>
    fetch(url).then((res) => res.json())
  );

  const staff: Staff[] = data?.data || [];

  const staffFiltrado = staff.filter((s) => {
    const matchesSearch =
      (s.nombre && s.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      s.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchesFiltro =
      filtro === "todos" ||
      (filtro === "activo" && s.status === "ACTIVE") ||
      (filtro === "inactivo" && s.status === "INACTIVE");
    return matchesSearch && matchesFiltro;
  });

  const handleRevoke = async (id: string, nombre: string) => {
    const ok = await confirmAction({
      title: `¿Revocar el acceso WiFi de ${nombre}?`,
      html:
        "Se usa cuando la persona ya no labora en la clínica. Su correo dejará de " +
        "conectarse y su dispositivo será desconectado en la próxima revalidación " +
        "del gateway (según el intervalo configurado). Podrás restaurarlo cuando quieras.",
      confirmText: "Revocar acceso",
      danger: true,
    });
    if (!ok) return;
    await handleToggleStatus(id, "INACTIVE");
  };

  const handleToggleStatus = async (id: string, nuevoStatus: "ACTIVE" | "INACTIVE") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nuevoStatus }),
      });
      if (res.ok) {
        mutate();
      } else {
        const err = await res.json();
        alert(err.message || "Error al actualizar estado.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red al actualizar estado.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRegistrar = async () => {
    if (!modalStaff.email.trim()) return;
    setModalError("");

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: modalStaff.nombre.trim() || undefined,
          email: modalStaff.email.trim(),
        }),
      });

      if (res.ok) {
        mutate();
        setModalAbierto(false);
        setModalStaff({ nombre: "", email: "" });
      } else {
        const err = await res.json();
        setModalError(err.message || "Error al registrar personal.");
      }
    } catch (e) {
      console.error(e);
      setModalError("Error de red al registrar personal.");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        alert("El archivo está vacío o no tiene el formato esperado (encabezado + filas).");
        return;
      }
      const res = await fetch("/api/admin/staff/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setImportResult({ createdCount: json.createdCount, skipped: json.skipped });
        mutate();
      } else {
        alert(json.message || "Error al importar el archivo.");
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo leer o importar el archivo.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* HEADER DE MÓDULO */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Personal</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Gestión de acceso de staff y gerencia</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-white border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-700 rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-60"
          >
            {importing ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin text-primary-500" />
            ) : (
              <Upload className="w-[18px] h-[18px]" />
            )}
            Importar CSV
          </button>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-primary-600 hover:bg-primary-700 transition-colors text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-[0_8px_16px_-8px_rgba(13,111,120,0.5)]"
          >
            <UserPlus className="w-[18px] h-[18px]" />
            Registrar personal
          </button>
        </div>
      </div>

      {/* RESUMEN DE IMPORTACIÓN */}
      {importResult && (
        <div className="mb-4 bg-primary-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-primary-800">
              <span className="font-semibold">{importResult.createdCount}</span> miembro(s) de personal importado(s) correctamente.
              {importResult.skipped.length > 0 && (
                <span> {importResult.skipped.length} fila(s) omitida(s).</span>
              )}
            </p>
            <button
              onClick={() => setImportResult(null)}
              className="text-primary-400 hover:text-primary-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {importResult.skipped.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-primary-700 max-h-32 overflow-y-auto">
              {importResult.skipped.map((s, i) => (
                <li key={i}>
                  Fila {s.row}{s.email ? ` (${s.email})` : ""}: {s.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-72 pl-9 pr-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["todos", "activo", "inactivo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors border capitalize ${
                filtro === f
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {f === "todos" ? "Todos" : f === "activo" ? "Activos" : "Inactivos"}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE STAFF */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.16)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-neutral-50/70 border-b border-neutral-100">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Personal</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Correo</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Fecha Registro</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                      Cargando listado de personal...
                    </div>
                  </td>
                </tr>
              ) : staffFiltrado.map((s) => {
                const iniciales = (s.nombre || s.email)
                  .split(/[\s@.]/)
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <tr key={s.id} className="hover:bg-neutral-50 border-b border-neutral-100 last:border-0 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-100 rounded-full w-9 h-9 shrink-0 flex items-center justify-center">
                          <span className="text-primary-700 text-xs font-bold">{iniciales}</span>
                        </div>
                        <p className="text-sm font-semibold text-neutral-900 leading-tight">{s.nombre || "—"}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-neutral-600 font-mono text-xs">{s.email}</td>

                    <td className="px-4 py-3.5 text-sm text-neutral-500">
                      {new Date(s.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-3.5">
                      {s.status === "ACTIVE" ? (
                        <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1">
                          Activo
                        </span>
                      ) : (
                        <span className="bg-neutral-50 text-neutral-400 border border-neutral-200 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1">
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {s.status === "ACTIVE" ? (
                        <button
                          title="Revocar el acceso WiFi de este personal"
                          onClick={() => handleRevoke(s.id, s.nombre || s.email)}
                          disabled={loadingId === s.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          {loadingId === s.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Ban className="h-3.5 w-3.5" />
                          )}
                          Revocar acceso
                        </button>
                      ) : (
                        <button
                          title="Restaurar el acceso WiFi de este personal"
                          onClick={() => handleToggleStatus(s.id, "ACTIVE")}
                          disabled={loadingId === s.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
                        >
                          {loadingId === s.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5" />
                          )}
                          Restaurar acceso
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!isLoading && staffFiltrado.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <p className="text-sm text-neutral-400">No se encontró personal</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REGISTRO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-neutral-900">Registrar personal</h2>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nombre completo (opcional)</label>
                <input
                  type="text"
                  value={modalStaff.nombre}
                  onChange={(e) => setModalStaff({ ...modalStaff, nombre: e.target.value })}
                  placeholder="María González"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Correo institucional</label>
                <input
                  type="email"
                  value={modalStaff.email}
                  onChange={(e) => setModalStaff({ ...modalStaff, email: e.target.value })}
                  placeholder="nombre@clinicaieq.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {modalError && (
              <p className="mt-3 text-sm text-red-600">{modalError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors rounded-xl px-4 py-2.5 text-sm flex-1 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrar}
                disabled={!modalStaff.email.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white transition-colors rounded-xl px-4 py-2.5 text-sm font-medium flex-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Registrar y activar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
