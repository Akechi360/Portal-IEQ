import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  // El gateway Reyee (EG1510XS) llama /auth/wifidogAuth/ping/ y
  // /auth/wifidogAuth/auth/ CON barra final y su cliente HTTP no sigue
  // redirects — el 308 de normalización de Next rompía el heartbeat WiFiDog
  // y el gateway denegaba todos los tokens. Las barras finales se manejan
  // en middleware.ts (rewrite para WiFiDog, redirect para el resto).
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Endpoints de PROTOCOLO WiFiDog → Pages API (res crudo, sin header Vary).
    // beforeFiles: deben ganarle al route handler del App Router que también
    // matchea estas rutas. login y portal NO se reescriben (siguen en App Router).
    return {
      beforeFiles: [
        { source: "/auth/wifidogAuth/auth", destination: "/api/wd/auth" },
        { source: "/auth/wifidogAuth/auth/", destination: "/api/wd/auth" },
        { source: "/auth/wifidogAuth/ping", destination: "/api/wd/ping" },
        { source: "/auth/wifidogAuth/ping/", destination: "/api/wd/ping" },
        { source: "/wifidog/auth", destination: "/api/wd/auth" },
        { source: "/wifidog/auth/", destination: "/api/wd/auth" },
        { source: "/wifidog/ping", destination: "/api/wd/ping" },
        { source: "/wifidog/ping/", destination: "/api/wd/ping" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
