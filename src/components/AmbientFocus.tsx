import { useEffect, useRef } from 'react';

interface AmbientFocusProps {
  active: boolean;
}

export function AmbientFocus({ active }: AmbientFocusProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 300);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 80);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Algorithmic generative waves (Harmonic flow fields inspired by algorithmic-art)
    let step = 0;
    const waves = [
      { frequency: 0.015, amplitude: 14, speed: 0.02, color: 'rgba(37, 99, 235, 0.08)' },
      { frequency: 0.025, amplitude: 10, speed: 0.035, color: 'rgba(59, 130, 246, 0.06)' },
      { frequency: 0.01, amplitude: 18, speed: 0.015, color: 'rgba(30, 58, 138, 0.05)' },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        for (let x = 0; x < width; x += 4) {
          const y =
            height / 2 +
            Math.sin(x * w.frequency + step * w.speed) * w.amplitude +
            Math.cos(x * 0.005 + step * 0.01) * 6;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = w.color;
        ctx.fill();
      });

      step += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-75">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
