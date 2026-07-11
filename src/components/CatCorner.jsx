import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

const REASONS = [
  {
    id: 1,
    catGif: 'https://media.giphy.com/media/MDJ9Ibhswvztm/giphy.gif',
    text: "Your smile is my absolute favorite thing in the universe. It makes everything better! 🌟",
    catName: "Sleepy Mochi"
  },
  {
    id: 2,
    catGif: 'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
    text: "You have the kindest soul, and the way you care for people is beautiful. 💖",
    catName: "Playful Cookie"
  },
  {
    id: 3,
    catGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbms5eTVlY21ncm1mOXB1ZXBrMmtocWZzZzRyMG54d245Nzd6a20ybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/VxeCc4wH2vF8101sUt/giphy.gif',
    text: "You are incredibly smart, driven, and support me in all my goals. 🚀",
    catName: "Flower Luna"
  },
  {
    id: 4,
    catGif: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTVsc3c2b2J3OHZqN3hhMGc0cjVxY3dmaXB0eDNhbnM1OHR1NGF0eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/K1tgb1IFeBO550fbjm/giphy.gif',
    text: "You give the best, warmest hugs that immediately melt all my stress away. 🧸",
    catName: "Confetti Milo"
  }
];

export default function CatCorner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [petCount, setPetCount] = useState(0);
  const [petHearts, setPetHearts] = useState([]);
  const [purrLevel, setPurrLevel] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % REASONS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + REASONS.length) % REASONS.length);
  };

  const playMeowSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      const now = audioCtx.currentTime;
      
      // Kitty meow frequency sweep: low -> high -> mid
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.35);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {
      console.log('Web Audio API is not supported or blocked by user interaction restrictions.', e);
    }
  };

  const handlePetCat = (e) => {
    playMeowSound();
    setPetCount(prev => prev + 1);
    
    // Increase purr level up to 100
    setPurrLevel(prev => {
      const next = prev + 10;
      return next > 100 ? 100 : next;
    });

    // Create a floating text particle ("MEOW!" or "PURR...")
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const words = ["Meow! 🐾", "Purr... ❤️", "Prrrt? 🐱", "Happy! ✨", "Soft... 💕"];
    const text = words[Math.floor(Math.random() * words.length)];
    
    const newHeart = {
      id: Math.random(),
      x,
      y,
      text
    };
    
    setPetHearts(prev => [...prev, newHeart]);
    
    // Cleanup particle after 1 second
    setTimeout(() => {
      setPetHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  };

  const resetPurr = () => {
    setPurrLevel(0);
    setPetCount(0);
  };

  return (
    <section className="relative px-4 py-20 bg-background-cream z-10 border-t border-secondary/20">
      <div className="max-w-4xl mx-auto">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Turn up volume for Meows!</span>
          </div>
          <h2 className="font-romantic text-3xl md:text-5xl font-bold text-dark-red mb-3">
            Vaibhavi's Cat Corner 🐾
          </h2>
          <p className="text-dark-red/75 max-w-md mx-auto text-sm">
            Spend some cozy time reading lovely thoughts and petting my virtual kittens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 md:p-8 border border-secondary/30 shadow-md">
          
          {/* Left Column: Reasons & speech bubble carousel */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-4">
              Reason #{REASONS[activeIndex].id} Why I Love You:
            </span>
            
            {/* Speech bubble layout */}
            <div className="relative bg-secondary/15 rounded-2xl p-6 border border-secondary/40 text-dark-red font-medium italic mb-6">
              {/* Speech bubble tail arrow */}
              <div className="absolute bottom-[-10px] left-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-secondary/40" />
              <div className="absolute bottom-[-8px] left-[41px] w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#FFF3F5]" />
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-base md:text-lg text-justify font-romantic"
                >
                  "{REASONS[activeIndex].text}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Carousel navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-secondary/60 flex items-center justify-center text-dark-red hover:bg-secondary/20 transition-colors cursor-pointer focus:outline-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold text-dark-red/70">
                {activeIndex + 1} / {REASONS.length}
              </span>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-secondary/60 flex items-center justify-center text-dark-red hover:bg-secondary/20 transition-colors cursor-pointer focus:outline-none"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Column: Cat image & Petting simulator */}
          <div className="flex flex-col items-center justify-center bg-background-cream/40 rounded-2xl p-4 border border-secondary/15">
            <div
              onClick={handlePetCat}
              className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-inner border border-secondary/20 bg-white cursor-pointer select-none group"
            >
              <img
                src={REASONS[activeIndex].catGif}
                alt={REASONS[activeIndex].catName}
                className="w-full h-full object-cover"
                draggable="false"
              />

              {/* Tap indicator */}
              <div className="absolute inset-0 bg-dark-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <span className="text-white text-xs font-bold uppercase tracking-wider bg-primary/80 px-3 py-1 rounded-full">
                  Tap to Pet! 👋
                </span>
              </div>

              {/* Floating click particles */}
              <AnimatePresence>
                {petHearts.map((heart) => (
                  <motion.div
                    key={heart.id}
                    initial={{ opacity: 1, y: heart.y - 10, scale: 0.7 }}
                    animate={{ opacity: 0, y: heart.y - 80, x: heart.x + (Math.random() * 40 - 20), scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute font-extrabold text-xs text-primary z-30 pointer-events-none drop-shadow-md select-none bg-white/90 border border-primary/20 px-2 py-0.5 rounded-full"
                    style={{ left: heart.x - 20 }}
                  >
                    {heart.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Cat Name tag */}
            <div className="mt-4 text-xs font-bold text-dark-red/60 uppercase">
              Kitten: {REASONS[activeIndex].catName}
            </div>

            {/* Purr/Happiness level meter */}
            <div className="w-full max-w-xs mt-6">
              <div className="flex justify-between items-center text-xs font-bold text-dark-red/80 mb-2">
                <span>Purr Meter 🐾</span>
                <span>{purrLevel}%</span>
              </div>
              <div className="w-full h-3 bg-secondary/20 rounded-full overflow-hidden border border-secondary/35">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${purrLevel}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent-pink"
                />
              </div>
              
              {/* Purr Reward Message */}
              <AnimatePresence>
                {purrLevel === 100 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 text-center p-3 bg-primary/10 border border-primary/20 rounded-xl"
                  >
                    <p className="text-xs font-bold text-primary mb-1">
                      🎉 Max Purriness Achieved!
                    </p>
                    <p className="text-[11px] text-dark-red font-medium">
                      Vaibhavi is officially the best cat-mom! Here is a super hug: 🧸❤️
                    </p>
                    <button
                      onClick={resetPurr}
                      className="mt-2 text-[10px] underline font-bold text-primary hover:text-dark-red cursor-pointer focus:outline-none"
                    >
                      Pet Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
