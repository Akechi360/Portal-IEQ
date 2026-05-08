"use client";

import * as React from "react";
import { cn } from "@/app/lib/styles";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary-400 text-white hover:bg-primary-500",
  secondary: "glass-soft border border-white/60 text-neutral-700 hover:bg-white/70",
  danger: "bg-danger text-white hover:bg-red-600",
  ghost: "bg-transparent text-neutral-700 hover:bg-white/60"
};

export function Button({
  className,
  children,
  variant = "primary",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}
