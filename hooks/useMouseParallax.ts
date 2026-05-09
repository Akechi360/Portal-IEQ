'use client';

import { useEffect, useRef } from 'react';

// Interpolación lineal para suavizar el movimiento
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

interface UseMouseParallaxOptions {
  lerpFactor?: number; // Qué tan rápido sigue al mouse (0.01 a 1)
  disableOnMobile?: boolean;
}

export function useMouseParallax({
  lerpFactor = 0.08,
  disableOnMobile = true,
}: UseMouseParallaxOptions = {}) {
  // Referencia al contenedor que recibirá las variables CSS
  const containerRef = useRef<HTMLDivElement>(null);

  // Guardamos las posiciones sin usar setState para evitar re-renders
  const mousePos = useRef({ targetX: 0.5, targetY: 0.5, currentX: 0.5, currentY: 0.5 });
  const reqRef = useRef<number>(0);
  const isReducedMotion = useRef<boolean>(false);
  const isTouch = useRef<boolean>(false);

  useEffect(() => {
    // SSR check
    if (typeof window === 'undefined') return;

    // Chequear preferencias de accesibilidad
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReducedMotion.current = mediaQuery.matches;

    // Detectar si es touch (heurística simple)
    isTouch.current = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (isReducedMotion.current || (disableOnMobile && isTouch.current)) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Normalizamos la posición de 0 a 1 respecto al viewport
      mousePos.current.targetX = e.clientX / window.innerWidth;
      mousePos.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const { targetX, targetY, currentX, currentY } = mousePos.current;

      // Calculamos la nueva posición con lerp
      const newX = lerp(currentX, targetX, lerpFactor);
      const newY = lerp(currentY, targetY, lerpFactor);

      mousePos.current.currentX = newX;
      mousePos.current.currentY = newY;

      // Solo actualizamos si hay un cambio significativo para ahorrar CPU
      if (
        containerRef.current &&
        (Math.abs(newX - targetX) > 0.001 || Math.abs(newY - targetY) > 0.001)
      ) {
        // Inyectamos las variables CSS de forma directa
        containerRef.current.style.setProperty('--mouse-x', newX.toFixed(4));
        containerRef.current.style.setProperty('--mouse-y', newY.toFixed(4));
      }

      reqRef.current = requestAnimationFrame(animate);
    };

    // Iniciar loop
    reqRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqRef.current);
    };
  }, [lerpFactor, disableOnMobile]);

  return containerRef;
}
