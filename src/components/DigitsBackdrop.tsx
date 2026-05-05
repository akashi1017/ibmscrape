import { useMemo } from "react";

export function DigitsBackdrop() {
  const digits = useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      digit: Math.floor(Math.random() * 10),
      left: Math.random() * 95,
      top: Math.random() * 95,
      size: 80 + Math.random() * 180,
      duration: 8 + Math.random() * 10,
      delay: -Math.random() * 10,
      dx: (Math.random() - 0.5) * 100,
      dy: (Math.random() - 0.5) * 100,
      rot: (Math.random() - 0.5) * 40,
    }));
  }, []);

  return (
    <div className="digits-backdrop" aria-hidden="true">
      {digits.map((d, i) => (
        <span
          key={i}
          className="floating-digit mono"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            fontSize: `${d.size}px`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            "--dx": `${d.dx}px`,
            "--dy": `${d.dy}px`,
            "--rot": `${d.rot}deg`,
          } as React.CSSProperties}
        >
          {d.digit}
        </span>
      ))}
    </div>
  );
}
