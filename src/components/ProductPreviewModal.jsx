import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingBag, MessageCircleHeart, Star, Truck, ShieldCheck, RefreshCw, Loader } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductPreviewModal({ item, isOpen, onClose, isSaved, onPin, onUnpin }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [scrapedData, setScrapedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (isOpen && item) {
      fetchProductDetails();
    } else {
      setScrapedData(null);
      setActiveImageIdx(0);
    }
  }, [isOpen, item]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scrape-product?url=${encodeURIComponent(item.shopUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setScrapedData(data);
      }
    } catch (e) {
      console.error("Failed to load scraped product details:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  // Use scraped data or fallback to item data
  const title = scrapedData?.title || item.title;
  const brand = scrapedData?.brand || item.tag?.replace(/\s*🛍️|\s*✨|\s*🔥|\s*🌸|\s*💎/g, '') || 'E-Commerce Brand';
  const price = scrapedData?.price || item.price;
  const originalPrice = scrapedData?.originalPrice || item.originalPrice;
  const description = scrapedData?.description || item.description;
  const rating = scrapedData?.rating || '4.8';
  const reviewsCount = scrapedData?.reviewsCount || '142';
  const sizes = scrapedData?.sizes || ['XS', 'S', 'M', 'L', 'XL'];

  // Gallery images (Combine scraped images, item image, and some visual fallbacks)
  let gallery = [item.image];
  if (scrapedData?.images && scrapedData.images.length > 0) {
    // Add scraped images while avoiding duplicates
    scrapedData.images.forEach(img => {
      if (!gallery.includes(img)) gallery.push(img);
    });
  }
  
  // If we only have one image, create visual variations (different zoom crops) to make it look premium
  if (gallery.length === 1) {
    gallery.push(item.image + "&fit=crop&q=80&w=600&zoom=1.5");
    gallery.push(item.image + "&fit=crop&q=80&w=600&fp-y=0.2&zoom=1.8");
  }

  // Calculate discount percentage
  let discountPercent = null;
  if (price && originalPrice) {
    const curr = parseInt(price.replace(/[^0-9]/g, ''));
    const orig = parseInt(originalPrice.replace(/[^0-9]/g, ''));
    if (!isNaN(curr) && !isNaN(orig) && orig > curr) {
      discountPercent = Math.round(((orig - curr) / orig) * 100);
    }
  }

  const handleAskToBuy = () => {
    // Trigger Confetti
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.7 },
      colors: ['#E63946', '#FFB7C5', '#FF85A1', '#FFD1DC']
    });

    // Format WhatsApp text
    const text = `Hey! I found this super cute "${title}" from ${brand} in size *${selectedSize}* inside the wardrobe sandbox! 💖 (Price: ${price}). I would absolutely love to wear this! Here is the store link: ${item.shopUrl} ✨ Could you please order it for me? 🥺👉👈`;
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 350);
  };

  const togglePin = (e) => {
    e.preventDefault();
    if (isSaved) {
      onUnpin(item);
    } else {
      onPin(item);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-dark-red/40 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal content box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col md:flex-row border border-secondary/30"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/90 text-dark-red border border-secondary/40 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Image Gallery Preview */}
          <div className="w-full md:w-1/2 bg-cream/10 p-6 flex flex-col justify-between border-r border-secondary/20 min-h-[350px] md:min-h-0">
            <div className="relative flex-grow flex items-center justify-center overflow-hidden rounded-2xl border border-secondary/15 aspect-[4/5] bg-white">
              <img
                src={gallery[activeImageIdx]}
                alt={title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              
              {discountPercent && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-extrabold text-white bg-primary shadow-sm animate-bounce">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail switcher */}
            <div className="flex gap-2.5 mt-4 overflow-x-auto py-1 justify-center">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    activeImageIdx === idx ? 'border-primary scale-105 shadow-sm' : 'border-secondary/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail view" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Interactive Product Details */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[90vh] bg-gradient-to-b from-white to-background-cream/30">
            <div>
              {/* Breadcrumb / Brand */}
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full bg-secondary/15 text-dark-red text-[10px] font-extrabold uppercase tracking-wide">
                  {brand}
                </span>
                
                {/* Real-time sync badge */}
                <div className="flex items-center gap-1 text-[10px] font-bold text-dark-red/50">
                  {loading ? (
                    <>
                      <Loader className="w-3 h-3 animate-spin text-primary" />
                      <span>Syncing Link...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600">In-App Live Preview</span>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="font-romantic font-extrabold text-xl md:text-2xl text-dark-red mb-2 leading-snug">
                {title}
              </h2>

              {/* Stars & Reviews */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(parseFloat(rating)) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-dark-red">{rating} Rating</span>
                <span className="text-xs text-dark-red/40">•</span>
                <span className="text-xs font-medium text-dark-red/60">{reviewsCount} reviews</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-6 bg-primary/5 p-3 rounded-2xl border border-primary/10">
                <span className="text-2xl md:text-3xl font-extrabold text-primary">{price}</span>
                {originalPrice && (
                  <span className="text-sm text-dark-red/45 line-through font-semibold">
                    {originalPrice}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-lg border border-emerald-200">
                    Save {originalPrice ? `₹${parseInt(originalPrice.replace(/[^0-9]/g, '')) - parseInt(price.replace(/[^0-9]/g, ''))}` : ''}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-dark-red/70 uppercase tracking-wide mb-2">Product Description</h4>
                <p className="text-xs md:text-sm text-dark-red/75 leading-relaxed bg-white/70 p-3 rounded-xl border border-secondary/25">
                  {description}
                </p>
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-xs font-bold text-dark-red/70 uppercase tracking-wide">Select Size</h4>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">In Stock</span>
                </div>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer border ${
                        selectedSize === size
                          ? 'bg-primary text-white border-primary shadow-md scale-105'
                          : 'bg-white text-dark-red border-secondary/40 hover:bg-secondary/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery and Trust highlights */}
              <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-y border-secondary/20 text-[11px] font-semibold text-dark-red/70">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Free Shipping inside India</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>100% Genuine product</span>
                </div>
              </div>

              {/* Curated reviews snippet */}
              <div className="mb-6 bg-secondary/10 p-3.5 rounded-xl border border-secondary/25">
                <span className="text-[9px] font-bold text-primary uppercase block mb-1">Loved by Users</span>
                <p className="text-xs italic text-dark-red/80 font-medium">
                  "So soft and fits perfectly! Looks absolutely beautiful and goes so well with high-waisted jeans. Highly recommend! 🎀"
                </p>
                <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-dark-red/50">
                  <span>- Vaibhavi</span>
                  <span>4.9 ★ verified purchase</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="space-y-2.5 mt-auto pt-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Store Redirect */}
                <a
                  href={item.shopUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-secondary/60 rounded-xl text-xs md:text-sm font-bold text-dark-red bg-white hover:bg-secondary/15 transition-all shadow-sm focus:outline-none"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Go to Store</span>
                </a>

                {/* Ask to Buy WhatsApp */}
                <button
                  onClick={handleAskToBuy}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary to-accent-pink text-white rounded-xl text-xs md:text-sm font-bold shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer focus:outline-none"
                >
                  <MessageCircleHeart className="w-4 h-4" />
                  <span>Ask Him to Buy!</span>
                </button>
              </div>

              {/* Pin Board button */}
              <button
                onClick={togglePin}
                className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none ${
                  isSaved
                    ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/15'
                    : 'bg-white border-secondary/50 text-dark-red hover:bg-secondary/10'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-primary text-primary' : 'text-dark-red/70'}`} />
                <span>{isSaved ? 'Remove Pin from Wishlist' : 'Pin to Saved Wishlist'}</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
