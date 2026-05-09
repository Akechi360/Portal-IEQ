'use client';

import { useEffect, useRef } from 'react';

interface SwarmPointerState {
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
}

export function useSwarmPointer(parallaxStrength: number = 0.05) {
  // Posiciones en píxeles reales respecto a la pantalla
  const pointerPos = useRef<SwarmPointerState>({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
  });

  const isReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inicializar al centro de la pantalla
    pointerPos.current = {
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      currentX: window.innerWidth / 2,
      currentY: window.innerHeight / 2,
    };

    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      pointerPos.current.targetX = e.clientX;
      pointerPos.current.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return { pointerPos, isReducedMotion };
}
