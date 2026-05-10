"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push('/admision/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      title="Cerrar sesión"
    >
      <LogOut className="h-[15px] w-[15px]" />
    </button>
  );
}
