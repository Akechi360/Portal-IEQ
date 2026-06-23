import * as React from "react";
import { cn } from "@/lib/styles";

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

export function Select({ label, options, error, id, className, ...props }: SelectProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      <label className="mb-1 block text-sm font-medium text-neutral-600" htmlFor={inputId}>
        {label}
      </label>
      <select
        id={inputId}
        className={cn(
          "glass-input h-10 w-full rounded-lg border border-white/60 px-3 py-2 text-sm text-neutral-800 transition-all duration-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300",
          error && "border-danger focus:ring-red-200",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
