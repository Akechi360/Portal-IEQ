'use client';

import React, { useEffect, useRef } from 'react';

interface LoginBackgroundFXProps {
  children: React.ReactNode;
}

// ============================================================
// CONFIGURACIÓN — ajusta estos valores para tunear el efecto
// ============================================================
const CONFIG = {
  particleCount: 220,        // Cantidad de piezas de confeti
  minSize: 3,                // Ancho mínimo en px
  maxSize: 10,               // Ancho máximo en px
  aspectRatioMin: 0.25,      // Qué tan alargada es la pieza (0.25 = muy alargada)
  aspectRatioMax: 0.65,      // Forma más cuadrada
  parallaxMin: 0.3,          // Factor parallax capa lejana
  parallaxMax: 1.8,          // Factor parallax capa cercana
  cursorLag: 0.07,           // Inercia del cursor (0.01=muy lento, 0.2=directo)
  driftSpeed: 0.2,           // Velocidad de flotación autónoma (px/frame)
  edgeGlowOpacity: 0.6,      // Intensidad del glow azul en bordes laterales
};

// Paleta exacta Google: azul, rojo, amarillo, verde
const COLORS = [
  '#4285F4', // Google Blue
  '#EA4335', // Google Red
  '#FBBC05', // Google Yellow
  '#34A853', // Google Green
];

interface Piece {
  x: number;         // Posición base X
  y: number;         // Posición base Y
  w: number;         // Ancho
  h: number;         // Alto
  angle: number;     // Rotación fija
  color: string;
  parallax: number;  // Profundidad (mayor = más cercana = más movimiento)
  driftX: number;    // Velocidad de flotación
  driftY: number;
}

function buildPieces(W: number, H: number): Piece[] {
  return Array.from({ length: CONFIG.particleCount }, () => {
    const w = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
    const aspectRatio = CONFIG.aspectRatioMin + Math.random() * (CONFIG.aspectRatioMax - CONFIG.aspectRatioMin);
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      w,
      h: w * aspectRatio,
      angle: Math.random() * Math.PI,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      parallax: CONFIG.parallaxMin + Math.random() * (CONFIG.parallaxMax - CONFIG.parallaxMin),
      driftX: (Math.random() - 0.5) * CONFIG.driftSpeed,
      driftY: (Math.random() - 0.5) * CONFIG.driftSpeed,
    };
  });
}

export function LoginBackgroundFX({ children }: LoginBackgroundFXProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<Piece[]>([]);
  const rafRef = useRef<number>(0);

  // Posición del mouse interpolada — en coordenadas normalizadas -0.5..0.5
  const mouse = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    // HiDPI
    const setupCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      piecesRef.current = buildPieces(window.innerWidth, window.innerHeight);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    // Mouse tracking: normalizamos a -0.5..0.5 (0,0 = centro)
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) - 0.5;
      mouse.current.ty = (e.clientY / window.innerHeight) - 0.5;
    };
    if (!reducedMotion && !isMobile) {
      window.addEventListener('mousemove', onMouseMove);
    }

    const render = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;

      // Lerp del mouse
      mouse.current.cx += (mouse.current.tx - mouse.current.cx) * CONFIG.cursorLag;
      mouse.current.cy += (mouse.current.ty - mouse.current.cy) * CONFIG.cursorLag;

      // Limpiar con el fondo base
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#f1f3f4';
      ctx.fillRect(0, 0, W, H);

      // Dibujar cada pieza de confeti
      piecesRef.current.forEach(p => {
        // Deriva autónoma suave
        p.x += p.driftX;
        p.y += p.driftY;

        // Wrap alrededor de la pantalla
        if (p.x > W + 20) p.x = -20;
        else if (p.x < -20) p.x = W + 20;
        if (p.y > H + 20) p.y = -20;
        else if (p.y < -20) p.y = H + 20;

        // Desplazamiento parallax basado en el mouse interpolado
        // Multiplicamos por W/H para que el efecto sea proporcional al tamaño de pantalla
        const offsetX = mouse.current.cx * p.parallax * 120;
        const offsetY = mouse.current.cy * p.parallax * 120;

        const drawX = p.x - offsetX;
        const drawY = p.y - offsetY;

        // Dibujamos la píldora/rectángulo rotado
        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, p.h / 2);
        ctx.fill();
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', setupCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    // Fondo claro tipo Antigravity
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f1f3f4]">

      {/* Canvas con el efecto de confeti paralax */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
      />

      {/* Glow azul sutil en los bordes laterales (detalle visual de Antigravity) */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse at 0% 50%, rgba(66,133,244,${CONFIG.edgeGlowOpacity * 0.15}) 0%, transparent 50%),
                       radial-gradient(ellipse at 100% 50%, rgba(66,133,244,${CONFIG.edgeGlowOpacity * 0.15}) 0%, transparent 50%)`
        }}
      />

      {/* Contenido */}
      <div className="relative z-20 flex min-h-screen w-full items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in-[0.98] duration-700 ease-out">
          {children}
        </div>
      </div>
    </div>
  );
}
