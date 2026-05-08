import * as React from "react";
import { cn } from "@/app/lib/styles";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export function Card({ title, subtitle, className, children, ...props }: CardProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white p-5 shadow-sm", className)} {...props}>
      {title ? <h3 className="text-lg font-bold text-gray-900">{title}</h3> : null}
      {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
      <div className={cn((title || subtitle) && "mt-4")}>{children}</div>
    </div>
  );
}
