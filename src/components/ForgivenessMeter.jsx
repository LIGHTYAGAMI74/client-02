import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ForgivenessMeter() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isForgiven, setIsForgiven] = useState(false);
  const [hoverCount, setHoverCount] = useState(0);

  const handleYes = () => {
    setIsForgiven(true);
    
    // Create massive confetti explosion
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, animate them from the top/sides
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const handleDodge = () => {
    // Calculate new position offsets to glide away
    // We alternate directions and keep them within reasonable limits
    const rangeX = 220;
    const rangeY = 120;
    
    const randomX = (Math.random() - 0.5) * rangeX * 2;
    const randomY = (Math.random() - 0.5) * rangeY * 2;
    
    setPosition({ x: randomX, y: randomY });
    setHoverCount(prev => prev + 1);
  };

  const handleClose = () => {
    setIsForgiven(false);
    setPosition({ x: 0, y: 0 });
    setHoverCount(0);
  };

  // Fun helper messages as Vaibhavi tries to click "Not yet..."
  const getDodgeHint = () => {
    if (hoverCount === 0) return "Choose wisely... 😉";
    if (hoverCount < 3) return "Nope, try again! 😜";
    if (hoverCount < 6) return "You can't say no to me! 🥺";
    if (hoverCount < 10) return "Still trying? You must really love me! 😂";
    return "Just click YES already! ❤️";
  };

  return (
    <section className="relative px-4 py-24 bg-gradient-to-b from-background-cream to-white z-10 border-t border-secondary/20 overflow-hidden flex flex-col items-center">
      <div className="max-w-xl w-full text-center">
        
        {/* Decorative elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          className="absolute -top-10 left-10 text-secondary/30 pointer-events-none"
        >
          <Sparkles className="w-16 h-16 fill-secondary/15" />
        </motion.div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
          <Heart className="w-3.5 h-3.5 fill-primary animate-pulse" />
          <span>Decision Time</span>
        </div>

        <h2 className="font-romantic text-3xl md:text-5xl font-bold text-dark-red mb-4">
          Will you forgive me, Vaibhavi? 🥺
        </h2>
        
        <p className="text-dark-red/70 text-sm md:text-base mb-8 max-w-sm mx-auto font-medium">
          {getDodgeHint()}
        </p>

        {/* Action Button Container */}
        <div className="relative h-44 w-full flex items-center justify-center gap-4">
          {/* YES Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleYes}
            className="px-8 py-4 bg-gradient-to-r from-primary to-accent-pink text-white rounded-2xl text-base md:text-lg font-bold shadow-md shadow-primary/20 cursor-pointer focus:outline-none hover:shadow-lg transition-shadow duration-300 z-10"
          >
            Yes, of course! ❤️
          </motion.button>

          {/* NO (Dodging) Button */}
          <motion.button
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 180, damping: 15 }}
            onMouseEnter={handleDodge}
            onClick={handleDodge} // For mobile touchscreen taps
            className="px-6 py-4 bg-white border border-secondary text-dark-red/70 rounded-2xl text-base font-semibold shadow-sm focus:outline-none select-none z-10"
          >
            Not yet... 😤
          </motion.button>
        </div>

      </div>

      {/* Forgiveness Celebration Modal */}
      <AnimatePresence>
        {isForgiven && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-dark-red/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-secondary shadow-2xl text-center relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-dark-red/40 hover:text-dark-red transition-colors focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Heart Sparkle Background */}
              <div className="absolute top-0 right-0 w-24 h-24 text-secondary/15 pointer-events-none">
                <Sparkles className="w-full h-full fill-secondary/5" />
              </div>

              {/* Celebration Cat Gif */}
              <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden mb-6 border border-secondary/30">
                <img
                  src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTVsc3c2b2J3OHZqN3hhMGc0cjVxY3dmaXB0eDNhbnM1OHR1NGF0eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/K1tgb1IFeBO550fbjm/giphy.gif"
                  alt="Celebration Happy Cat"
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-romantic text-2xl md:text-3xl font-extrabold text-primary mb-3">
                I knew you'd forgib me! 🥰❤️
              </h3>
              
              <p className="text-dark-red/80 text-sm md:text-base leading-relaxed mb-6 font-medium">
                You're the absolute best, Vaibhavi! I love you so much and promise to buy you beautiful dresses and treat you to the finest dates. Let's make your early birthday month special! 🎂✨
              </p>

              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-dark-red transition-colors cursor-pointer focus:outline-none"
              >
                Close & Hug 🧸
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
