'use client';

import React, { useRef, useEffect, useState } from 'react';

/**
 * SplineScenePlaceholder — Lightweight, interactive 3D canvas scene.
 * Simulates a glowing 3D holographic funding orb / shield with mouse tracking,
 * smooth orbital particles, and zero external network dependencies.
 * Respects prefers-reduced-motion and disables heavy renders on low-power devices.
 */
export default function SplineScenePlaceholder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setIsReduced(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Particle nodes for orbital 3D wireframe
    const numPoints = 28;
    const points: { phi: number; theta: number; r: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      points.push({
        phi: Math.acos(-1 + (2 * i) / numPoints),
        theta: Math.sqrt(numPoints * Math.PI) * Math.asin(-1 + (2 * i) / numPoints),
        r: 85,
      });
    }

    let angleY = 0;
    let angleX = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      angleY += 0.008 + mouseX * 0.015;
      angleX = mouseY * 0.4;

      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2;

      // Outer glowing ambient ring
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        120
      );
      grad.addColorStop(0, 'rgba(79, 70, 229, 0.22)');
      grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
      ctx.fill();

      // Project 3D points
      const projected: { x: number; y: number; z: number }[] = [];

      points.forEach((p) => {
        // Spherical coordinates
        const x3d = p.r * Math.sin(p.phi) * Math.cos(p.theta);
        const y3d = p.r * Math.cos(p.phi);
        const z3d = p.r * Math.sin(p.phi) * Math.sin(p.theta);

        // Rotate Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const xRot = x3d * cosY - z3d * sinY;
        const zRot = x3d * sinY + z3d * cosY;

        // Rotate X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const yRot = y3d * cosX - zRot * sinX;
        const zFinal = y3d * sinX + zRot * cosX;

        // Perspective projection
        const fov = 300;
        const scale = fov / (fov + zFinal);
        const x2d = centerX + xRot * scale;
        const y2d = centerY + yRot * scale;

        projected.push({ x: x2d, y: y2d, z: zFinal });
      });

      // Draw connective arcs
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 42) {
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw luminous nodes
      projected.forEach((p) => {
        const alpha = Math.max(0.15, (p.z + 90) / 180);
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.5, 2.5 * ((p.z + 100) / 200)), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isReduced) {
    return (
      <div
        className="w-full h-full flex items-center justify-center opacity-40"
        aria-hidden="true"
      >
        <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-brand-500/20 to-accent-500/20 blur-xl" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center pointer-events-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[420px] max-h-[380px]"
      />
    </div>
  );
}
