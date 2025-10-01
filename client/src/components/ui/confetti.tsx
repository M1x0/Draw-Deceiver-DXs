import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  delay: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export function Confetti({ active, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const colors = ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6", "#EC4899"];
    const newParticles: ConfettiParticle[] = [];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5
      });
    }

    setParticles(newParticles);

    const timeout = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timeout);
  }, [active, duration]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: "-10px",
            backgroundColor: particle.color
          }}
          initial={{ y: -10, rotate: 0 }}
          animate={{
            y: "100vh",
            rotate: 360,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: duration / 1000,
            delay: particle.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}
