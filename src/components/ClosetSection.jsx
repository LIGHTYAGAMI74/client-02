import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Pin, Sparkles, ShoppingBag, Loader, RefreshCw, ArrowRight } from 'lucide-react';
import ClosetCard from './ClosetCard';
import closetData from '../data/closetData.json';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  'All Wardrobe',
  'Dresses & Co-ords',
  'Cute Tops & Corsets',
  'Aesthetic Streetwear & Tees',
  'Cozy Hoodies & Cardigans',
];

const SUGGESTION_TAGS = [
  'Pastel Floral Dress',
  'Corset Top',
  'Oversized Hoodie',
  'Ribbon Crop Top',
  'Korean Streetwear'
];

export default function ClosetSection() {
  const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'search' | 'live' | 'saved'
  const [selectedCategory, setSelectedCategory] = useState('All Wardrobe');
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Live Scraped Store Feed States
  const [liveFeed, setLiveFeed] = useState([]);
  const [displayedLiveFeed, setDisplayedLiveFeed] = useState([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [liveIndex, setLiveIndex] = useState(0);

  // MongoDB Saved Wishlist States
  const [savedItems, setSavedItems] = useState([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Fetch Pinned items from database on load
  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    setIsLoadingSaved(true);
    try {
      const res = await fetch('/api/saved-items');
      if (res.ok) {
        const data = await res.json();
        setSavedItems(data);
      }
    } catch (e) {
      console.error("Failed to load saved items from MongoDB:", e);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleSearchSubmit = async (e, queryOverride = null) => {
    if (e) e.preventDefault();
    const query = queryOverride || searchQuery;
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search-clothes?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Failed to search clothes:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Crawl Myntra FWD and Flipkart storefronts
  const fetchLiveFeed = async (force = false) => {
    if (liveFeed.length > 0 && !force) return;
    
    setIsLoadingLive(true);
    try {
      const res = await fetch('/api/automated-closet');
      if (res.ok) {
        const data = await res.json();
        // Shuffle the fetched items initially
        const shuffled = data.sort(() => 0.5 - Math.random());
        setLiveFeed(shuffled);
        setDisplayedLiveFeed(shuffled.slice(0, 8));
        setLiveIndex(8);
      }
    } catch (err) {
      console.error("Failed to scrape live store feeds:", err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Pagination shuffling / Next items cycle
  const handleNextOutfits = () => {
    if (liveFeed.length === 0) return;

    // Trigger soft heart confetti explosion on refresh
    confetti({
      particleCount: 40,
      spread: 40,
      colors: ['#FFB7C5', '#FF85A1'],
      origin: { y: 0.8 }
    });

    let nextIdx = liveIndex + 8;
    if (nextIdx > liveFeed.length) {
      // Re-shuffle and start from page 1 when wrapping around
      const reshuffled = [...liveFeed].sort(() => 0.5 - Math.random());
      setLiveFeed(reshuffled);
      setDisplayedLiveFeed(reshuffled.slice(0, 8));
      setLiveIndex(8);
    } else {
      setDisplayedLiveFeed(liveFeed.slice(liveIndex, nextIdx));
      setLiveIndex(nextIdx);
    }
  };

  const handlePin = async (item) => {
    try {
      const res = await fetch('/api/saved-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: item.title,
          category: item.category,
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image,
          shopUrl: item.shopUrl,
          tag: item.tag || 'Web Find 🌐',
          description: item.description
        })
      });

      if (res.ok) {
        const savedItem = await res.json();
        if (!savedItems.some(si => si.shopUrl === savedItem.shopUrl)) {
          setSavedItems(prev => [savedItem, ...prev]);
        }
        
        confetti({
          particleCount: 50,
          spread: 40,
          colors: ['#E63946', '#FF85A1']
        });
      }
    } catch (err) {
      console.error("Failed to pin item to board:", err);
    }
  };

  const handleUnpin = async (item) => {
    const match = savedItems.find(si => si.shopUrl === item.shopUrl || si._id === item._id);
    if (!match) return;

    try {
      const res = await fetch(`/api/saved-items/${match._id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSavedItems(prev => prev.filter(si => si._id !== match._id));
      }
    } catch (err) {
      console.error("Failed to unpin item from database:", err);
    }
  };

  const isPinned = (item) => {
    return savedItems.some(si => si.shopUrl === item.shopUrl);
  };

  const filteredCuratedItems = selectedCategory === 'All Wardrobe'
    ? closetData
    : closetData.filter(item => item.category === selectedCategory);

  return (
    <section id="closet" className="relative px-4 py-20 bg-gradient-to-b from-white to-background-cream z-10 border-t border-secondary/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-pink/15 text-primary text-xs font-bold mb-4">
            <Heart className="w-3.5 h-3.5 fill-primary animate-pulse" />
            <span>Interactive Wardrobe Sandbox</span>
          </div>
          <h2 className="font-romantic text-3xl md:text-5xl font-bold text-dark-red mb-3">
            Vaibhavi's Closet Sandbox 🎀
          </h2>
          <p className="text-dark-red/75 max-w-lg mx-auto text-sm md:text-base">
            Choose from curated wardrobe picks, search live web brands, check automated live feeds, or view your saved board.
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex flex-wrap justify-center border-b border-secondary/30 mb-8 max-w-2xl mx-auto gap-2 md:gap-0">
          <button
            onClick={() => setActiveTab('curated')}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'curated'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-dark-red/60 hover:text-primary'
            }`}
          >
            🌸 Curated Pick
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-dark-red/60 hover:text-primary'
            }`}
          >
            🔍 Search Web
          </button>
          <button
            onClick={() => {
              setActiveTab('live');
              fetchLiveFeed();
            }}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-dark-red/60 hover:text-primary'
            }`}
          >
            ⚡ Live Store Feeds
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-center text-xs md:text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
              activeTab === 'saved'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-dark-red/60 hover:text-primary'
            }`}
          >
            📌 Saved Wishlist
            {savedItems.length > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                {savedItems.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: CURATED ITEMS */}
        {activeTab === 'curated' && (
          <div>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {CATEGORIES.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-dark-red/80 border-secondary/40 hover:bg-secondary/10'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCuratedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClosetCard
                      item={item}
                      isSaved={isPinned(item)}
                      onPin={handlePin}
                      onUnpin={handleUnpin}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* TAB 2: LIVE WEB SEARCH */}
        {activeTab === 'search' && (
          <div className="w-full">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-4 px-2">
              <div className="relative w-full flex items-center bg-white border border-secondary/40 shadow-sm rounded-full py-1.5 pl-6 pr-1.5 focus-within:border-primary/50 focus-within:shadow-md transition-all">
                <Search className="w-5 h-5 text-dark-red/40 mr-3" />
                <input
                  type="text"
                  placeholder="Search clothing items across e-commerce brands..."
                  className="flex-grow bg-transparent text-dark-red text-sm outline-none placeholder:text-dark-red/35 mr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-primary text-white text-xs md:text-sm font-bold px-6 py-2.5 rounded-full hover:bg-dark-red transition-all cursor-pointer focus:outline-none flex items-center gap-1.5"
                >
                  {isSearching ? <Loader className="w-4 h-4 animate-spin" /> : <span>Search</span>}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center items-center gap-2 mb-10 text-xs">
              <span className="text-dark-red/50 font-bold">Try searching:</span>
              {SUGGESTION_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    handleSearchSubmit(null, tag);
                  }}
                  className="bg-white hover:bg-secondary/10 text-dark-red border border-secondary/30 px-3 py-1 rounded-full cursor-pointer focus:outline-none transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader className="w-10 h-10 text-primary animate-spin" />
                <span className="text-sm font-bold text-dark-red/60 animate-pulse">
                  Searching fashion platforms...
                </span>
              </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {searchResults.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ClosetCard
                        item={item}
                        isSaved={isPinned(item)}
                        onPin={handlePin}
                        onUnpin={handleUnpin}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-16 bg-white border border-secondary/20 rounded-3xl max-w-xl mx-auto shadow-sm">
                <Search className="w-10 h-10 text-dark-red/30 mx-auto mb-3" />
                <h3 className="font-romantic font-bold text-lg text-dark-red mb-1">
                  Find Live Clothes in India
                </h3>
                <p className="text-xs text-dark-red/60 px-6">
                  Type in a search query above to fetch clothes from Myntra, Savana, Westside and Ajio.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIVE CRAWLED STORE FEEDS */}
        {activeTab === 'live' && (
          <div className="w-full">
            {/* Header info */}
            <div className="text-center mb-8">
              <h3 className="font-romantic font-bold text-xl text-dark-red mb-1">
                Automated Storefront Crawler Feed ⚡
              </h3>
              <p className="text-xs text-dark-red/65 max-w-md mx-auto">
                Crawling live items and banners directly from Myntra FWD and Flipkart Lifestyle stores. Click "Next Outfits" to load a new shuffle!
              </p>
            </div>

            {isLoadingLive ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader className="w-10 h-10 text-primary animate-spin" />
                <span className="text-sm font-bold text-dark-red/60 animate-pulse">
                  Crawling Myntra FWD & Flipkart Storefronts...
                </span>
              </div>
            ) : (
              <div>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                  <AnimatePresence mode="popLayout">
                    {displayedLiveFeed.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ClosetCard
                          item={item}
                          isSaved={isPinned(item)}
                          onPin={handlePin}
                          onUnpin={handleUnpin}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {liveFeed.length > 0 && (
                  <div className="flex justify-center items-center gap-4">
                    {/* Next Outfits Button */}
                    <button
                      onClick={handleNextOutfits}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-accent-pink text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <span>Next Outfits</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Recrawl Button */}
                    <button
                      onClick={() => fetchLiveFeed(true)}
                      className="px-5 py-3 bg-white border border-secondary/50 text-dark-red/80 rounded-full text-sm font-bold shadow-sm hover:bg-secondary/15 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Re-Crawl Stores</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PINTEREST BOARD */}
        {activeTab === 'saved' && (
          <div>
            {isLoadingSaved ? (
              <div className="flex justify-center py-20">
                <Loader className="w-10 h-10 text-primary animate-spin" />
              </div>
            ) : savedItems.length === 0 ? (
              <div className="text-center py-16 bg-white border border-secondary/20 rounded-3xl max-w-xl mx-auto shadow-sm flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border border-secondary/20">
                  <img
                    src="https://media.giphy.com/media/MDJ9Ibhswvztm/giphy.gif"
                    alt="Sleepy sad kitty"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-romantic font-bold text-xl text-dark-red mb-2">
                  Your Pinterest Board is Empty! 🥺
                </h3>
                <p className="text-xs text-dark-red/60 px-10 leading-relaxed mb-4">
                  Browse Curated picks, Search Web, or check Live Feeds and pin clothing items to save them here.
                </p>
                <button
                  onClick={() => setActiveTab('curated')}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-dark-red transition-all cursor-pointer focus:outline-none"
                >
                  Explore Outfits
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6 px-2">
                  <span className="text-xs font-bold text-dark-red/60 uppercase">
                    Your Wishlist (Saved in MongoDB Atlas)
                  </span>
                  <button
                    onClick={fetchSavedItems}
                    className="text-xs font-bold text-primary underline hover:text-dark-red cursor-pointer focus:outline-none"
                  >
                    Sync Board
                  </button>
                </div>
                
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  <AnimatePresence mode="popLayout">
                    {savedItems.map((item) => (
                      <motion.div
                        key={item._id || item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ClosetCard
                          item={item}
                          isSaved={true}
                          onPin={handlePin}
                          onUnpin={handleUnpin}
                          isFromSavedBoard={true}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
