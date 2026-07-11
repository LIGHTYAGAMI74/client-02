import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import FloatingHearts from './components/FloatingHearts';
import HeroSection from './components/HeroSection';
import ClosetSection from './components/ClosetSection';
import CatCorner from './components/CatCorner';
import ForgivenessMeter from './components/ForgivenessMeter';

export default function App() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-background-cream text-dark-red flex flex-col selection:bg-secondary/40 selection:text-dark-red">
      {/* Background Animation */}
      <FloatingHearts />

      {/* Floating Header / Navigation */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl bg-white/75 backdrop-blur-md border border-secondary/30 rounded-full px-5 py-3 flex items-center justify-between shadow-sm z-50 transition-all duration-300 hover:shadow-md">
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="flex items-center gap-1.5 cursor-pointer font-romantic font-extrabold text-sm md:text-base text-primary select-none"
        >
          <span>Vaibhavi's Corner</span>
          <Heart className="w-4 h-4 fill-primary text-primary animate-pulse" />
        </div>

        <nav className="flex items-center gap-3 md:gap-6 text-xs md:text-sm font-bold">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-primary transition-colors cursor-pointer focus:outline-none"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('closet')}
            className="hover:text-primary transition-colors cursor-pointer focus:outline-none"
          >
            Wardrobe
          </button>
          <button
            onClick={() => scrollToSection('cats')}
            className="hover:text-primary transition-colors cursor-pointer focus:outline-none"
          >
            Cats
          </button>
          <button
            onClick={() => scrollToSection('forgive')}
            className="hover:text-primary transition-colors cursor-pointer focus:outline-none bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20"
          >
            Forgive?
          </button>
        </nav>
      </header>

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section (Apology & Countdown) */}
        <div id="home">
          <HeroSection />
        </div>

        {/* Interactive Closet Wardrobe Section */}
        <div id="closet">
          <ClosetSection />
        </div>

        {/* Cats Corner Section */}
        <div id="cats">
          <CatCorner />
        </div>

        {/* Forgiveness Decision Section */}
        <div id="forgive">
          <ForgivenessMeter />
        </div>
      </main>

      {/* Romantic Footer */}
      <footer className="relative bg-white border-t border-secondary/20 py-8 text-center text-xs md:text-sm font-semibold text-dark-red/50 z-10">
        <div className="flex items-center justify-center gap-1 mb-2">
          <span>Made with all my love for Vaibhavi Sharma</span>
          <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
        </div>
        <div className="flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-accent-pink animate-pulse" />
          <span>Early Birthday Tribute • August 12</span>
        </div>
      </footer>
    </div>
  );
}
