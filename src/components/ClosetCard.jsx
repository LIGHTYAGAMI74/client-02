import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowUpRight, MessageCircleHeart, Heart, HeartOff, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClosetCard({ item, isSaved, onPin, onUnpin, isFromSavedBoard, onPreview }) {
  
  const handleAskToBuy = () => {
    // 1. Trigger Confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#E63946', '#FFB7C5', '#FF85A1', '#FFD1DC']
    });

    // 2. Format WhatsApp link
    const text = `Hey! I found this super cute "${item.title}" in the wardrobe you built for me! 💖 (Price: ${item.price}). I'd love to have it! Here is the link: ${item.shopUrl} ✨ Please buy it for me? 🥺👉👈`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    
    // Open whatsapp in new tab
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className={`bg-white rounded-2xl border ${
        item.tag?.includes('Best Pick') 
          ? 'border-amber-400/95 ring-1 ring-amber-400/20 bg-gradient-to-b from-amber-50/10 to-white shadow-sm' 
          : 'border-secondary/35'
      } shadow-sm overflow-hidden flex flex-col justify-between group transition-shadow duration-300 hover:shadow-lg relative`}
    >
      {/* Floating Pinterest Heart Pin */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isSaved) {
            onUnpin(item);
          } else {
            onPin(item);
          }
        }}
        className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 focus:outline-none cursor-pointer hover:scale-110 ${
          isSaved
            ? 'bg-primary text-white border border-primary/20'
            : 'bg-white/90 text-primary border border-secondary/30 hover:bg-white'
        }`}
        title={isSaved ? "Remove from Saved Board" : "Pin to Saved Board"}
      >
        <Heart className={`w-4.5 h-4.5 ${isSaved ? 'fill-white' : ''}`} />
      </button>

      <div className="relative overflow-hidden aspect-[4/5] bg-cream/10">
        
        {/* Category tag */}
        {item.tag && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 text-[10px] font-bold text-white bg-primary rounded-full shadow-sm">
            {item.tag}
          </span>
        )}

        {/* Outfit image with zoom hover */}
        <img
          src={item.image}
          alt={item.title}
          onClick={() => onPreview && onPreview(item)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          loading="lazy"
        />

        {/* Hover backdrop overlay */}
        <div 
          onClick={() => onPreview && onPreview(item)}
          className="absolute inset-0 bg-gradient-to-t from-dark-red/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 cursor-pointer"
        >
          <span className="self-end bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 hover:bg-white/35 transition-colors">
            👗 Preview Inside
          </span>
          <p className="text-white text-xs font-medium leading-relaxed drop-shadow-sm">
            {item.description}
          </p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-dark-red/50 block mb-1">
            {item.category}
          </span>
          <h3 
            onClick={() => onPreview && onPreview(item)}
            className="font-romantic font-bold text-base text-dark-red line-clamp-1 mb-2 hover:text-primary cursor-pointer transition-colors"
          >
            {item.title}
          </h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-extrabold text-primary">{item.price}</span>
            {item.originalPrice && (
              <span className="text-xs text-dark-red/40 line-through font-medium">
                {item.originalPrice}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          {/* Shop Direct Link */}
          <a
            href={item.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-2 px-3 border border-secondary/60 rounded-xl text-xs font-bold text-dark-red hover:bg-secondary/10 transition-colors focus:outline-none"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop Link</span>
            <ArrowUpRight className="w-3 h-3 text-dark-red/60" />
          </a>

          {/* Ask to Buy (WhatsApp) */}
          <button
            onClick={handleAskToBuy}
            className="flex items-center justify-center gap-1 py-2 px-3 bg-gradient-to-r from-primary to-accent-pink text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all hover:brightness-105 focus:outline-none cursor-pointer"
          >
            <MessageCircleHeart className="w-3.5 h-3.5" />
            <span>Ask Him!</span>
          </button>
        </div>

        {/* Saved Board Trash Option */}
        {isFromSavedBoard && (
          <button
            onClick={() => onUnpin(item)}
            className="mt-2 w-full py-1.5 border border-primary/20 hover:border-primary/40 rounded-xl text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 flex items-center justify-center gap-1 cursor-pointer focus:outline-none transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove from Pinned Board</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
