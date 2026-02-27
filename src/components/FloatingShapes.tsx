import React from 'react';
import { motion } from 'motion/react';

export default function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Circle 1 */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"
      />
      
      {/* Circle 2 */}
      <motion.div
        animate={{
          y: [0, 30, 0],
          rotate: [0, -15, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[15%] right-[10%] w-80 h-80 bg-accent/5 rounded-full blur-3xl"
      />

      {/* Floating Square */}
      <motion.div
        animate={{
          y: [0, -40, 0],
          rotate: [45, 90, 45],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[20%] right-[20%] w-12 h-12 border-2 border-primary/10 rounded-lg"
      />

      {/* Floating Triangle (simplified as a div with clip-path) */}
      <motion.div
        animate={{
          y: [0, 50, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-[30%] left-[15%] w-16 h-16 bg-accent/10"
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      />

      {/* Small Dots */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-2 h-2 bg-primary/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
