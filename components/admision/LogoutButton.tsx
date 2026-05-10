"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button 
      onClick={() => router.push('/admision/login')}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      title="Cerrar sesión"
    >
      <LogOut className="h-[15px] w-[15px]" />
    </button>
  );
}
