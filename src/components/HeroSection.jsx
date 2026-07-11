import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Gift, ChevronDown, Calendar } from 'lucide-react';
import vaibhaviImage from '../assets/image.png';

export default function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let year = now.getFullYear();
      let target = new Date(`August 12, ${year} 00:00:00`);
      
      // If birthday has already passed this year, count down to next year
      if (now > target) {
        target = new Date(`August 12, ${year + 1} 00:00:00`);
      }

      const difference = target.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollToCloset = () => {
    const closet = document.getElementById('closet');
    if (closet) {
      closet.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-height-[90vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 z-10">
      
      {/* Top Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-secondary shadow-sm text-xs font-semibold text-primary mb-6 backdrop-blur-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-accent-pink animate-pulse" />
        <span>Early Birthday Tribute & Heartfelt Apology</span>
        <Heart className="w-3.5 h-3.5 text-primary fill-primary animate-ping" />
      </motion.div>

      {/* Main Apology Headline */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="font-romantic text-4xl md:text-6xl font-bold tracking-tight text-dark-red max-w-4xl leading-tight mb-6"
      >
        I'm Really Sorry, <span className="text-primary underline decoration-accent-pink/50 decoration-wavy">Vaibhavi</span>... <br />
        <span className="text-3xl md:text-5xl font-sans mt-2 block">But You Mean The World To Me! 💖</span>
      </motion.h1>

      {/* Cute Interactive Flower Cat SVG */}
      <div className="relative w-64 h-64 my-4 flex items-center justify-center">
        {/* Sparkles around cat */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-2 left-6 text-accent-pink"
        >
          <Sparkles className="w-6 h-6 fill-accent-pink" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
          className="absolute bottom-6 right-4 text-primary"
        >
          <Sparkles className="w-5 h-5 fill-primary" />
        </motion.div>

        {/* Animated Cute SVG Cat */}
        <motion.svg
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.4 }}
          className="w-56 h-56 drop-shadow-md"
          viewBox="0 0 200 200"
        >
          {/* Tail */}
          <motion.path
            d="M 60,150 Q 30,130 30,100 T 50,70"
            fill="none"
            stroke="#ffffff"
            strokeWidth="10"
            strokeLinecap="round"
            animate={{ rotate: [-5, 10, -5] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            style={{ transformOrigin: '60px 150px' }}
          />
          {/* Body */}
          <ellipse cx="100" cy="130" rx="45" ry="40" fill="#ffffff" />
          
          {/* Head */}
          <circle cx="100" cy="85" r="35" fill="#ffffff" />
          
          {/* Ears */}
          <polygon points="70,60 85,30 90,60" fill="#ffffff" />
          <polygon points="70,60 85,30 90,60" fill="#FFB7C5" transform="scale(0.8) translate(28, 12)" />
          
          <polygon points="130,60 115,30 110,60" fill="#ffffff" />
          <polygon points="130,60 115,30 110,60" fill="#FFB7C5" transform="scale(0.8) translate(42, 12)" />

          {/* Eyes (Blinking) */}
          <motion.circle
            cx="88"
            cy="80"
            r="3.5"
            fill="#5A0012"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
          />
          <motion.circle
            cx="112"
            cy="80"
            r="3.5"
            fill="#5A0012"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
          />

          {/* Snout & Whiskers */}
          <path d="M 97,88 Q 100,91 103,88" fill="none" stroke="#5A0012" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="68" y1="85" x2="52" y2="83" stroke="#e5e5e5" strokeWidth="2" />
          <line x1="68" y1="90" x2="50" y2="92" stroke="#e5e5e5" strokeWidth="2" />
          <line x1="132" y1="85" x2="148" y2="83" stroke="#e5e5e5" strokeWidth="2" />
          <line x1="132" y1="90" x2="150" y2="92" stroke="#e5e5e5" strokeWidth="2" />

          {/* Cheeks */}
          <circle cx="80" cy="85" r="4.5" fill="#FF85A1" opacity="0.6" />
          <circle cx="120" cy="85" r="4.5" fill="#FF85A1" opacity="0.6" />

          {/* Arms holding a Heart Sign */}
          <ellipse cx="80" cy="115" rx="8" ry="12" fill="#ffffff" transform="rotate(-15 80 115)" />
          <ellipse cx="120" cy="115" rx="8" ry="12" fill="#ffffff" transform="rotate(15 120 115)" />

          {/* Red Heart */}
          <motion.path
            d="M 100,105 C 95,95 80,95 80,107 C 80,120 100,130 100,130 C 100,130 120,120 120,107 C 120,95 105,95 100,105 Z"
            fill="#E63946"
            stroke="#5A0012"
            strokeWidth="1.5"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ transformOrigin: '100px 112px' }}
          />

          {/* Sign text inside Heart */}
          <text x="100" y="112" fontSize="5" fontWeight="bold" fill="#ffffff" textAnchor="middle">
            SORRY!
          </text>
        </motion.svg>
      </div>

      {/* Photo and Apology Card Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12 w-full max-w-4xl px-4">
        {/* Polaroid Styled Photo of Vaibhavi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          whileHover={{ scale: 1.05, rotate: 1 }}
          className="bg-white p-4 pb-8 shadow-md border border-secondary/20 rounded-md max-w-[260px] rotate-[-2deg] flex-shrink-0"
        >
          <div className="w-[228px] h-[280px] bg-cream/10 overflow-hidden border border-secondary/15 rounded-sm">
            <img
              src={vaibhaviImage}
              alt="Beautiful Vaibhavi"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center font-romantic font-bold text-base text-dark-red mt-4 select-none tracking-wide">
            My Favorite Girl 🌸
          </p>
        </motion.div>

        {/* Heartfelt Apology Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex-grow max-w-xl bg-white/70 backdrop-blur-md border border-secondary/50 rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden text-left"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-accent-pink" />
          <p className="text-dark-red text-base md:text-lg leading-relaxed text-justify italic font-romantic">
            "Vaibhavi, you are my favorite person, my best friend, and the girl I cherish most in this entire world. I know I make mistakes, get stubborn, or say silly things sometimes, but my love for you is absolute and unconditional. I made this little cozy corner just to show you how much I care, and to make up for my silly slip-ups. You deserve to be treated like a queen, and I hope this puts a lovely smile on your face. Will you read this and forgib me please? 👉👈"
          </p>
          <div className="mt-4 flex items-center justify-end gap-2 text-primary font-bold text-sm">
            <span>Forever Yours, Me</span>
            <Heart className="w-4 h-4 fill-primary animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Early Birthday Countdown Banner */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="w-full max-w-2xl bg-gradient-to-r from-white via-white/80 to-white border border-primary/20 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col items-center mb-16"
      >
        <div className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl mb-6">
          <Gift className="w-5 h-5 text-accent-pink animate-bounce" />
          <span>Counting down to my favorite girl's birthday! 🎂✨</span>
        </div>

        {/* Timer Cards */}
        <div className="grid grid-cols-4 gap-3 md:gap-6 w-full max-w-md">
          {Object.entries(timeLeft).map(([label, value]) => (
            <div key={label} className="flex flex-col items-center">
              <div className="w-14 h-16 md:w-20 md:h-20 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden">
                {/* Visual split line for retro flip feel */}
                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-primary/20" />
                <span className="text-2xl md:text-4xl font-extrabold text-primary font-mono tracking-tight z-10">
                  {String(value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] md:text-xs font-semibold uppercase text-dark-red/70 tracking-widest mt-2">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-xs text-dark-red/60 font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Birthday Celebration on August 12</span>
        </div>
      </motion.div>

      {/* Scroll to Closet CTA */}
      <motion.button
        onClick={handleScrollToCloset}
        whileHover={{ y: 4 }}
        className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 text-primary hover:text-accent-pink transition-colors font-bold text-sm tracking-wide focus:outline-none"
      >
        <span>Explore Your Personal Closet 👗</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

    </section>
  );
}
