// lib/alerts.ts
// Wrappers de SweetAlert2 con la identidad teal de Clínica IEQ. Uso client-side.
// Reemplaza los window.confirm/alert nativos por diálogos de marca.

import Swal from "sweetalert2";

const TEAL = "#0d6f78";
const RED = "#dc2626";
const NEUTRAL = "#e5e7eb";

const base = {
  buttonsStyling: true,
  reverseButtons: true,
  customClass: {
    popup: "rounded-2xl",
    title: "!text-lg !font-bold",
    confirmButton: "!rounded-xl !px-4 !py-2 !text-sm !font-medium",
    cancelButton: "!rounded-xl !px-4 !py-2 !text-sm !font-medium",
  },
} as const;

/**
 * Diálogo de confirmación. Devuelve true si el usuario confirma.
 * `danger` pinta el botón de confirmar en rojo (acciones destructivas).
 */
export async function confirmAction(opts: {
  title: string;
  html?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}): Promise<boolean> {
  const result = await Swal.fire({
    ...base,
    icon: opts.danger ? "warning" : "question",
    title: opts.title,
    html: opts.html,
    text: opts.text,
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? "Aceptar",
    cancelButtonText: opts.cancelText ?? "Cancelar",
    confirmButtonColor: opts.danger ? RED : TEAL,
    cancelButtonColor: NEUTRAL,
    focusCancel: !!opts.danger,
  });
  return result.isConfirmed;
}

/** Aviso simple (reemplaza alert()). */
export async function alertMessage(opts: {
  title: string;
  text?: string;
  html?: string;
  icon?: "success" | "error" | "warning" | "info";
}): Promise<void> {
  await Swal.fire({
    ...base,
    icon: opts.icon ?? "info",
    title: opts.title,
    text: opts.text,
    html: opts.html,
    confirmButtonText: "Entendido",
    confirmButtonColor: TEAL,
  });
}

/** Toast discreto arriba a la derecha (para éxitos). */
export function toastSuccess(title: string): void {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    customClass: { popup: "rounded-xl" },
  });
}
