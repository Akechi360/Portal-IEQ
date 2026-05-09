import * as React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="glass-panel overflow-hidden rounded-xl border border-white/60">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/45 text-xs font-medium uppercase tracking-wide text-neutral-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
