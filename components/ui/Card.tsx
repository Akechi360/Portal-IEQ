import * as React from "react";
import { cn } from "@/lib/styles";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function Card({ title, subtitle, className, children, ...props }: CardProps) {
  return (
    <div className={cn("glass-panel rounded-xl border border-white/60 p-6", className)} {...props}>
      {title ? <h3 className="text-base font-semibold text-neutral-800">{title}</h3> : null}
      {subtitle ? <p className="mt-1 text-sm text-neutral-400">{subtitle}</p> : null}
      <div className={cn((title || subtitle) && "mt-4 border-t border-neutral-100 pt-4")}>{children}</div>
    </div>
  );
}
