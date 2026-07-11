import { Wifi, User } from "lucide-react";
import { LogoutButton } from "@/components/admision/LogoutButton";

export default function AdmisionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-200 h-14 px-4 sm:px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">

        {/* IZQUIERDA del header */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img src="/logo-ieq.png" alt="IEQ" className="h-8 w-auto object-contain" />
          <span className="font-semibold text-gray-900 text-sm">Portal IEQ</span>
          <div className="hidden sm:block w-px h-4 bg-gray-300" />
          <span className="hidden sm:inline bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
            Admisión
          </span>
        </div>

        {/* DERECHA del header */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-full bg-gray-100 p-1.5 text-gray-600 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline text-sm text-gray-600">Operador</span>
          <LogoutButton />
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
