import React, { useEffect, useRef } from 'react';

export const BackgroundEffects: React.FC<{ theme?: string }> = ({ theme = 'neon' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle ambient floating numerals & dots
    const digits = ['7', '42', '99', '100', '314', '777', '999', '8', '3', '•', '+', '½'];
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      text: digits[Math.floor(Math.random() * digits.length)],
      speedY: 0.15 + Math.random() * 0.35,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: 0.04 + Math.random() * 0.08,
      size: 11 + Math.random() * 12
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle floating digital numbers
      ctx.font = '500 13px "JetBrains Mono", sans-serif';
      for (const p of particles) {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.fillStyle = theme === 'matrix' 
          ? `rgba(74, 222, 128, ${p.opacity})` 
          : theme === 'midnight' 
          ? `rgba(192, 132, 252, ${p.opacity})` 
          : `rgba(56, 189, 248, ${p.opacity})`;
        
        ctx.fillText(p.text, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Soft warm/cool ambient gradient glows */}
      <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[10%] w-[650px] h-[650px] bg-indigo-600/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute top-[40%] right-[35%] w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[130px] pointer-events-none" />
    </div>
  );
};
