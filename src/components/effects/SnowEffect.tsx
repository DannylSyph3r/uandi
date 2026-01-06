"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  depth: number;
}

interface SnowEffectProps {
  particleCount?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  avoidRadius?: number;
  avoidStrength?: number;
  windStrength?: number;
}

export function SnowEffect({
  particleCount = 250,
  color = "255, 255, 255",
  minSize = 0.5,
  maxSize = 4,
  speed = 1.2,
  avoidRadius = 120,
  avoidStrength = 0.2,
  windStrength = 0.3,
}: SnowEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const windRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        const depth = Math.random();
        const sizeRange = maxSize - minSize;
        const size = minSize + sizeRange * depth * 0.7 + sizeRange * 0.3 * Math.random();
        
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (0.3 + depth * 0.7) * speed + Math.random() * 0.3,
          size,
          opacity: 0.2 + depth * 0.6,
          wobbleSpeed: 0.02 + Math.random() * 0.03,
          wobbleOffset: Math.random() * Math.PI * 2,
          depth,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      windRef.current = Math.sin(timeRef.current * 0.005) * windStrength + 
                        Math.sin(timeRef.current * 0.002) * windStrength * 0.5;

      const mouse = mouseRef.current;
      const sortedParticles = [...particlesRef.current].sort((a, b) => a.depth - b.depth);

      sortedParticles.forEach((p) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const effectiveAvoidRadius = avoidRadius * (0.5 + p.depth * 0.5);

        if (dist < effectiveAvoidRadius && dist > 0) {
          const force = (effectiveAvoidRadius - dist) / effectiveAvoidRadius;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * avoidStrength * p.depth;
          p.vy += Math.sin(angle) * force * avoidStrength * 0.5;
        }

        const wobble = Math.sin(timeRef.current * p.wobbleSpeed + p.wobbleOffset) * 0.3;
        const windEffect = windRef.current * (0.3 + p.depth * 0.7);

        p.x += p.vx + wobble + windEffect;
        p.y += p.vy;
        p.vx *= 0.96;

        const baseSpeed = (0.3 + p.depth * 0.7) * speed;
        p.vy += (baseSpeed - p.vy) * 0.02;

        if (p.y > canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        ctx.beginPath();
        
        if (p.size > 2.5) {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          gradient.addColorStop(0, `rgba(${color}, ${p.opacity})`);
          gradient.addColorStop(0.4, `rgba(${color}, ${p.opacity * 0.5})`);
          gradient.addColorStop(1, `rgba(${color}, 0)`);
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        } else {
          ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        }
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    handleResize();
    initParticles();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [particleCount, color, minSize, maxSize, speed, avoidRadius, avoidStrength, windStrength]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}