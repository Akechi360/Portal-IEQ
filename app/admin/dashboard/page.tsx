import Link from "next/link";
const kpis = [
  { label: "Usuarios activos", value: 132 },
  { label: "Usuarios expirados hoy", value: 42 },
  { label: "Usuarios bloqueados", value: 5 },
  { label: "Total usuarios", value: 196 }
];

const roleBars = [
  { label: "Paciente", value: 96, width: "80%" },
  { label: "Transito", value: 18, width: "35%" },
  { label: "Medico", value: 14, width: "28%" },
  { label: "Gerencia", value: 4, width: "12%" }
];

export default function AdminDashboardPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <h1 className="text-xl font-bold text-neutral-900">Portal Interno de Conectividad</h1>
          <p className="text-sm text-neutral-500">Vista de alto nivel para operadores de Admision y jefe de sistemas.</p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <article key={kpi.label} className="glass-panel rounded-xl border border-white/60 p-4">
              <p className="text-xs text-neutral-500">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">{kpi.value}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel rounded-xl border border-white/60 p-4">
          <h2 className="text-lg font-bold text-neutral-900">Usuarios por tipo</h2>
          <div className="mt-3 space-y-2">
            {roleBars.map((bar) => (
              <div key={bar.label} className="space-y-1">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>{bar.label}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="relative h-4 overflow-hidden rounded-lg bg-neutral-100">
                  <div className="h-4 bg-primary-400" style={{ width: bar.width }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Link
            href="/admin/issue"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-400 px-4 py-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-500"
          >
            ➕ Emitir credencial nueva
          </Link>
          <Link
            href="/admin/list"
            className="glass-soft flex items-center justify-center gap-2 rounded-lg border border-white/60 px-4 py-4 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-white/75"
          >
            📋 Ver listado de usuarios
          </Link>
        </section>
      </div>
    </main>
  );
}
