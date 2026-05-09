'use client';

import { useEffect, useRef } from 'react';

// Interpolación lineal suave
const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

interface UsePointerSceneOptions {
  lerpFactor?: number;
  disableOnMobile?: boolean;
}

export function usePointerScene({
  lerpFactor = 0.04, // Aún más lento/suave para inercia premium
  disableOnMobile = true,
}: UsePointerSceneOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Guardamos posiciones. Usamos -1 a 1 para cálculos de parallax más limpios (0 es el centro)
  const pos = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
  });
  
  const reqRef = useRef<number>(0);
  const isReducedMotion = useRef<boolean>(false);
  const isTouch = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isTouch.current = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (isReducedMotion.current || (disableOnMobile && isTouch.current)) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalizar de -1 a 1
      pos.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pos.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const { targetX, targetY, currentX, currentY } = pos.current;

      const newX = lerp(currentX, targetX, lerpFactor);
      const newY = lerp(currentY, targetY, lerpFactor);

      pos.current.currentX = newX;
      pos.current.currentY = newY;

      if (
        containerRef.current &&
        (Math.abs(newX - targetX) > 0.0001 || Math.abs(newY - targetY) > 0.0001)
      ) {
        // Variables CSS de -1 a 1
        containerRef.current.style.setProperty('--px', newX.toFixed(4));
        containerRef.current.style.setProperty('--py', newY.toFixed(4));
        
        // Variables CSS de 0 a 1 (para gradientes)
        containerRef.current.style.setProperty('--px-norm', ((newX + 1) / 2).toFixed(4));
        containerRef.current.style.setProperty('--py-norm', ((newY + 1) / 2).toFixed(4));
      }

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqRef.current);
    };
  }, [lerpFactor, disableOnMobile]);

  return containerRef;
}
