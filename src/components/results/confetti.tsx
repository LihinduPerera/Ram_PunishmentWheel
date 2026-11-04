"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  life: number;
}

const COLORS = [
  "#f472b6",
  "#c084fc",
  "#38bdf8",
  "#fb923c",
  "#34d399",
  "#facc15",
  "#ffffff",
];

export function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: 150 }).map((_, index) => {
      const fromLeft = index % 2 === 0;
      const originX = fromLeft ? width * 0.16 : width * 0.84;
      const originY = height * 0.42;
      const angle = fromLeft
        ? -Math.PI / 2 + (Math.random() - 0.35) * 0.9
        : -Math.PI / 2 + (Math.random() + 0.35) * 0.9;
      const speed = 10 + Math.random() * 15;

      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 7,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.35,
        color: COLORS[index % COLORS.length] ?? "#f472b6",
        life: 1,
      };
    });

    let animationFrame = 0;
    let lastTime = performance.now();
    const startedAt = lastTime;

    const draw = (now: number) => {
      const delta = Math.min(32, now - lastTime) / 16.67;
      lastTime = now;
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.vy += 0.38 * delta;
        particle.vx *= 0.992;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.rotation += particle.spin * delta;

        if (now - startedAt > 2300) {
          particle.life -= 0.018 * delta;
        }

        if (particle.life <= 0 || particle.y > height + 40) continue;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.globalAlpha = Math.max(0, particle.life);
        context.fillStyle = particle.color;
        context.fillRect(
          -particle.size / 2,
          -particle.size / 4,
          particle.size,
          particle.size / 2,
        );
        context.restore();
      }

      if (now - startedAt < 3600) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, width, height);
      }
    };

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 size-full"
    />
  );
}
