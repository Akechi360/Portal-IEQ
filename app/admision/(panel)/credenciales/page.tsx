"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, PlusCircle, Search, ClipboardList, Loader2, Download } from "lucide-react";

type TipoAcceso = "Todos" | "Paciente" | "Transito";

interface ListItem {
  id: string;
  name: string;
  type: "PACIENTE" | "TRANSITO" | "MEDICO";
  identifier: string; // voucherCode
  room?: string | null;
  status: string; // "Active" | "Expired" | "Blocked" | "Pending"
  devicesCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export default function CredencialesPage() {
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoAcceso>("Todos");

  // Map filters to API params
  const typeParam = filtroTipo === "Paciente" ? "PACIENTE" : filtroTipo === "Transito" ? "TRANSITO" : "";

  // SWR query
  // scope=credentials: Admisión solo gestiona pacientes/tránsito. Los médicos
  // los administra Sistemas y no deben aparecer aquí ni con el filtro "Todos".
  const { data, error, isLoading } = useSWR(
    `/api/list?scope=credentials&limit=100${typeParam ? `&type=${typeParam}` : ""}${search ? `&search=${search}` : ""}`,
    (url) => fetch(url).then((res) => res.json())
  );

  const items: ListItem[] = data?.items || [];
  const total = data?.total || 0;

  const [exporting, setExporting] = useState(false);

  const tipoLabel = (t: string) =>
    t === "PACIENTE" ? "Paciente" : t === "TRANSITO" ? "Tránsito" : "Médico";
  const estadoLabel = (s: string) =>
    s === "Active" ? "Activo" : s === "Expired" ? "Expirado" : s === "Blocked" ? "Bloqueado" : s;

  async function handleExportPDF() {
    if (items.length === 0) return;
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();

      doc.setFontSize(14);
      doc.text("Credenciales emitidas — Clínica IEQ Los Mangos", 14, 16);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Generado: ${new Date().toLocaleString("es-ES")}  ·  ${items.length} credencial(es)`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [["Código", "Tipo", "Nombre", "Área / Habitación", "Creada", "Expira", "Disp.", "Estado"]],
        body: items.map((c) => [
          c.identifier,
          tipoLabel(c.type),
          c.name,
          c.room || "—",
          new Date(c.createdAt).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
          c.expiresAt
            ? new Date(c.expiresAt).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
            : "Al conectarse",
          String(c.devicesCount),
          estadoLabel(c.status),
        ]),
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [13, 111, 120], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [244, 246, 249] },
      });

      doc.save(`credenciales-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("Error al exportar PDF:", e);
      alert("No se pudo generar el PDF.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* HEADER DE PÁGINA */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admision/dashboard")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Credenciales de hoy</h1>
          <span className="bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-2.5 py-0.5 text-xs font-semibold">
            {isLoading ? "..." : `${total} total`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={exporting || items.length === 0}
            className="bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700 rounded-xl px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin text-primary-500" />
            ) : (
              <Download className="w-[18px] h-[18px]" />
            )}
            Exportar PDF
          </button>
          <button
            onClick={() => router.push("/admision/emitir")}
            className="bg-primary-500 hover:bg-primary-600 transition-colors text-white rounded-xl px-4 py-2 text-sm flex items-center gap-2"
          >
            <PlusCircle className="w-[18px] h-[18px]" />
            Nueva credencial
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {(["Todos", "Paciente", "Transito"] as TipoAcceso[]).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors border ${
                filtroTipo === t
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</th>
                <th className="hidden sm:table-cell px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Área / Habitación</th>
                <th className="hidden xl:table-cell px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Creada</th>
                <th className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Expira</th>
                <th className="hidden xl:table-cell px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Disp.</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                      Cargando credenciales emitidas...
                    </div>
                  </td>
                </tr>
              ) : items.length > 0 ? (
                items.map((cred) => (
                  <tr key={cred.id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                    <td className="px-4 py-3.5 text-sm">
                      <span className="font-mono font-semibold text-gray-900 tracking-wider">
                        {cred.identifier}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3.5 text-sm">
                      {cred.type === "PACIENTE" ? (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-xs">
                          Paciente
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-xs">
                          Tránsito
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">
                      <p className="truncate">{cred.name}</p>
                      {/* En móvil, área/habitación se apila aquí (su columna está oculta). */}
                      {cred.room && (
                        <p className="md:hidden truncate text-[11px] font-normal text-gray-400">{cred.room}</p>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3.5 text-sm text-gray-500">
                      {cred.room || "—"}
                    </td>
                    <td className="hidden xl:table-cell px-4 py-3.5 text-sm text-gray-500">
                      {new Date(cred.createdAt).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-3.5 text-sm text-gray-500">
                      {cred.expiresAt ? (
                        new Date(cred.expiresAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      ) : (
                        <span className="text-gray-400">Al conectarse</span>
                      )}
                    </td>
                    <td className="hidden xl:table-cell px-4 py-3.5 text-sm text-center text-gray-600">
                      {cred.devicesCount} c.
                    </td>
                    <td className="px-4 py-3.5 text-sm">
                      {cred.status === "Active" && (
                        <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 text-xs">
                          Activo
                        </span>
                      )}
                      {cred.status === "Expired" && (
                        <span className="bg-gray-50 text-gray-500 border border-gray-200 rounded-full px-2 py-0.5 text-xs">
                          Expirado
                        </span>
                      )}
                      {cred.status === "Blocked" && (
                        <span className="bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 text-xs">
                          Bloqueado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <ClipboardList className="text-gray-300 w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No se encontraron credenciales</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER DE TABLA */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          Mostrando {items.length} credencial(es) en tiempo real
        </div>
      </div>

    </div>
  );
}
