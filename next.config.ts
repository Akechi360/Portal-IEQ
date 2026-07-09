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
};

export default nextConfig;
