import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Portal WiFi Clinica IEQ",
  description: "Frontend del portal cautivo para pacientes, visitantes, medicos y gerencia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
