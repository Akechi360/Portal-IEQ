"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

/** Aviso honesto en secciones aún no conectadas a un backend real. */
export function MockNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
      <p>{children ?? "Esta sección todavía no está conectada a un backend real — los cambios no se guardan."}</p>
    </div>
  );
}

export function Switch({ enabled, onChange }: { enabled: boolean; onChange?: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${
        enabled ? "bg-primary-500" : "bg-neutral-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </div>
  );
}

export function InputField({
  label,
  defaultValue,
  value,
  onChange,
  type = "text",
  colSpan = false,
  readOnly = false
}: {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  colSpan?: boolean;
  readOnly?: boolean;
}) {
  const isControlled = value !== undefined;
  return (
    <div className={`flex flex-col gap-1.5 ${colSpan ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <input
        type={type}
        {...(isControlled
          ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) }
          : { defaultValue })}
        readOnly={readOnly}
        className={`w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 ${
          readOnly ? "bg-neutral-50 text-neutral-500 cursor-not-allowed" : "bg-white"
        }`}
      />
    </div>
  );
}

export function ColorPickerField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          defaultValue={defaultValue}
          className="h-9 w-12 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
        />
        <input
          type="text"
          defaultValue={defaultValue}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 uppercase"
        />
      </div>
    </div>
  );
}

export function SelectField({
  label,
  defaultValue,
  value,
  onChange,
  options = [],
}: {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: { label: string; value: string }[] | string[];
}) {
  const isControlled = value !== undefined;
  const normalized = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <select
        {...(isControlled
          ? { value, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value) }
          : { defaultValue })}
        className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: `right 0.5rem center`,
          backgroundRepeat: `no-repeat`,
          backgroundSize: `1.5em 1.5em`,
          paddingRight: `2.5rem`,
        }}
      >
        {normalized.length > 0 ? (
          normalized.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))
        ) : (
          <option value={defaultValue ?? value}>{defaultValue ?? value}</option>
        )}
      </select>
    </div>
  );
}

export function ToggleRow({
  label,
  subLabel,
  defaultEnabled,
  enabled: controlledEnabled,
  onChange,
}: {
  label: string;
  subLabel?: string;
  defaultEnabled?: boolean;
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
}) {
  const isControlled = controlledEnabled !== undefined;
  const [internalEnabled, setInternalEnabled] = useState(defaultEnabled ?? false);
  const enabled = isControlled ? controlledEnabled : internalEnabled;

  const toggle = () => {
    if (isControlled) {
      onChange?.(!enabled);
    } else {
      setInternalEnabled(!enabled);
    }
  };

  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {subLabel && <p className="mt-1 text-xs text-neutral-400">{subLabel}</p>}
      </div>
      <Switch enabled={enabled} onChange={toggle} />
    </div>
  );
}
