'use client';

import { useEffect, useRef } from 'react';

interface UseClusteredSwarmProps {
  cursorLag?: number;
}

export function useClusteredSwarm({ cursorLag = 0.08 }: UseClusteredSwarmProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const pos = useRef({
    targetX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    targetY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    currentX: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    currentY: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
  });

  const reqRef = useRef<number>(0);
  const isReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      pos.current.targetX = e.clientX;
      pos.current.targetY = e.clientY;
    };

    if (!isReducedMotion.current) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    const animate = () => {
      const { targetX, targetY, currentX, currentY } = pos.current;

      const newX = currentX + (targetX - currentX) * cursorLag;
      const newY = currentY + (targetY - currentY) * cursorLag;

      pos.current.currentX = newX;
      pos.current.currentY = newY;

      if (
        containerRef.current &&
        (Math.abs(newX - targetX) > 0.1 || Math.abs(newY - targetY) > 0.1)
      ) {
        // Inyectamos las coordenadas absolutas en pixeles
        containerRef.current.style.setProperty('--cx', `${newX}px`);
        containerRef.current.style.setProperty('--cy', `${newY}px`);
      }

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(reqRef.current);
    };
  }, [cursorLag]);

  return containerRef;
}
