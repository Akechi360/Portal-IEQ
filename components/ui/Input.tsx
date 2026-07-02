import * as React from "react";
import { cn } from "@/lib/styles";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      <label className="mb-1 block text-sm font-medium text-neutral-600" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "glass-input h-10 w-full rounded-lg border border-white/60 px-3 py-2 text-sm text-neutral-800 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300",
          error && "border-danger focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
