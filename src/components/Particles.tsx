import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
  seed?: number;
  className?: string;
  color?: string;
  glowColor?: string;
  glowIntensity?: number;
  maxSize?: number;
  minSize?: number;
}

export function Particles({
  count = 30,
  seed = 42,
  className = "absolute inset-0 overflow-hidden pointer-events-none",
  color = "0.8 0.18 18",
  glowColor = "0.8 0.18 18",
  glowIntensity = 0.4,
  maxSize = 12,
  minSize = 4,
}: ParticlesProps) {
  const particles = useMemo(() => {
    let s = seed;
    const rand = () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${rand() * 100}%`,
      bottom: `${rand() * 60}%`,
      size: minSize + rand() * (maxSize - minSize),
      duration: 10 + rand() * 14,
      delay: rand() * 8,
      opacity: 0.4 + rand() * 0.5,
    }));
  }, [count, seed, maxSize, minSize]);

  return (
    <div className={className}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle rounded-full"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, oklch(${color} / 0.8), oklch(${color} / 0.3) 60%, transparent 100%)`,
            boxShadow: `0 0 ${p.size * 1.5}px oklch(${glowColor} / ${glowIntensity})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
