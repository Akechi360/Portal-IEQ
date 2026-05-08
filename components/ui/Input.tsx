import * as React from "react";
import { cn } from "@/app/lib/styles";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
          error && "border-red-400 focus:border-red-500 focus:ring-red-200",
          className
        )}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
