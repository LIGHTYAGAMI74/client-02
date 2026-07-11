import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingHearts() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    // Spawns a heart every 800ms
    const interval = setInterval(() => {
      const id = Math.random();
      const newHeart = {
        id,
        x: Math.random() * 100, // random horizontal position (vw)
        size: Math.random() * 20 + 12, // sizes from 12px to 32px
        duration: Math.random() * 5 + 6, // animation duration from 6s to 11s
        color: Math.random() > 0.6 ? '#E63946' : Math.random() > 0.3 ? '#FF85A1' : '#FFB7C5',
        rotation: Math.random() * 60 - 30, // random rotation tilt
      };
      setHearts((prev) => [...prev.slice(-30), newHeart]); // Keep at most 30 active hearts
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ y: '105vh', x: `${heart.x}vw`, opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.7, 0.7, 0],
              scale: [0.5, 1, 1, 0.8],
              rotate: heart.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: heart.duration,
              ease: 'easeInOut',
            }}
            className="absolute"
            style={{
              width: heart.size,
              height: heart.size,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full"
              style={{ fill: heart.color }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
