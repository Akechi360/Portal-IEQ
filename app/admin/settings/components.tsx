"use client";

import { useState } from "react";

export function Switch({ enabled, onChange }: { enabled: boolean; onChange?: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${
        enabled ? "bg-sky-500" : "bg-neutral-200"
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
  colSpan = false, 
  readOnly = false 
}: { 
  label: string; 
  defaultValue: string; 
  colSpan?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${colSpan ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <input
        type="text"
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 ${
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
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 uppercase"
        />
      </div>
    </div>
  );
}

export function SelectField({ label, defaultValue, options = [] }: { label: string; defaultValue: string; options?: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-neutral-500">{label}</label>
      <select
        defaultValue={defaultValue}
        className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: `right 0.5rem center`,
          backgroundRepeat: `no-repeat`,
          backgroundSize: `1.5em 1.5em`,
          paddingRight: `2.5rem`,
        }}
      >
        {options.length > 0 ? (
          options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))
        ) : (
          <option value={defaultValue}>{defaultValue}</option>
        )}
      </select>
    </div>
  );
}

export function ToggleRow({ label, subLabel, defaultEnabled }: { label: string; subLabel?: string; defaultEnabled: boolean }) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        {subLabel && <p className="mt-1 text-xs text-neutral-400">{subLabel}</p>}
      </div>
      <Switch enabled={enabled} onChange={() => setEnabled(!enabled)} />
    </div>
  );
}
