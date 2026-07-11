import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  mongoose.connect(databaseUrl)
    .then(() => console.log('Connected to MongoDB database successfully! 📌'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn("DATABASE_URL is not defined in the environment variables!");
}

// MongoDB Schema for Saved Clothes (Pinterest-like board)
const SavedItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Dresses & Co-ords' },
  price: { type: String, required: true },
  originalPrice: String,
  image: { type: String, required: true },
  shopUrl: { type: String, required: true },
  tag: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

// Avoid Recompiling Models in Vercel's Serverless environment
const SavedItem = mongoose.models.SavedItem || mongoose.model('SavedItem', SavedItemSchema);

// Load Unsplash Pool
let unsplashPool = { dresses: [], tops: [], streetwear: [], hoodies: [], default: [] };
try {
  const poolPath = path.join(process.cwd(), 'src', 'data', 'unsplashPool.json');
  if (fs.existsSync(poolPath)) {
    unsplashPool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
  }
} catch (e) {
  console.error("Failed to load unsplashPool.json, using fallback images.", e);
}

// Load Best Picks Data
let bestPicksData = [];
try {
  const bestPicksPath = path.join(process.cwd(), 'src', 'data', 'bestPicksData.json');
  if (fs.existsSync(bestPicksPath)) {
    bestPicksData = JSON.parse(fs.readFileSync(bestPicksPath, 'utf8'));
  }
} catch (e) {
  console.error("Failed to load bestPicksData.json:", e);
}

const getAestheticImage = (title) => {
  const t = title.toLowerCase();
  let list = unsplashPool.default;
  
  if (t.includes('dress') || t.includes('coord') || t.includes('set') || t.includes('skirt') || t.includes('frock')) {
    list = unsplashPool.dresses;
  } else if (t.includes('top') || t.includes('corset') || t.includes('shirt') || t.includes('tee') || t.includes('tshirt')) {
    if (t.includes('oversized') || t.includes('street') || t.includes('graphic')) {
      list = unsplashPool.streetwear;
    } else {
      list = unsplashPool.tops;
    }
  } else if (t.includes('hoodie') || t.includes('cardigan') || t.includes('sweater') || t.includes('jacket') || t.includes('fleece')) {
    list = unsplashPool.hoodies;
  } else if (t.includes('street') || t.includes('pant') || t.includes('cargo') || t.includes('jean')) {
    list = unsplashPool.streetwear;
  }

  if (!list || list.length === 0) {
    list = unsplashPool.default;
  }
  
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};

// --- API ENDPOINTS ---

// 1. GET Pinned Pinterest-like Items
app.get('/api/saved-items', async (req, res) => {
  try {
    const items = await SavedItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error('Failed to get saved items:', error);
    res.status(500).json({ error: 'Failed to fetch saved items from database' });
  }
});

// 2. POST Save/Pin an Item
app.post('/api/saved-items', async (req, res) => {
  try {
    const { title, category, price, originalPrice, image, shopUrl, tag, description } = req.body;
    
    // Check if already exists to prevent duplicate pins
    const existing = await SavedItem.findOne({ shopUrl });
    if (existing) {
      return res.status(200).json(existing); // Return existing if already pinned
    }

    const newItem = new SavedItem({ title, category, price, originalPrice, image, shopUrl, tag, description });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Failed to save item:', error);
    res.status(500).json({ error: 'Failed to save item to database' });
  }
});

// 3. DELETE Unpin/Remove an Item
app.delete('/api/saved-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await SavedItem.findByIdAndDelete(id);
    res.json({ success: true, message: 'Item unpinned successfully' });
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ error: 'Failed to delete item from database' });
  }
});

// 4. GET Search Clothes from Web Engine (Yahoo Search)
app.get('/api/search-clothes', async (req, res) => {
  const query = req.query.q || '';
  if (!query) {
    return res.json([]);
  }

  try {
    // Yahoo search query focusing on women's fashion in India
    const searchString = `site:myntra.com OR site:savana.com OR site:westside.com OR site:ajio.com women fashion ${query}`;
    const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(searchString)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    $('div.compTitle a').each((index, element) => {
      if (results.length >= 12) return; // Limit to top 12 items

      const titleText = $(element).text().trim();
      const rawUrl = $(element).attr('href');

      // Filter out internal Yahoo help/terms links
      if (titleText && rawUrl && !titleText.toLowerCase().includes('help.yahoo') && !rawUrl.includes('help.yahoo')) {
        let url = rawUrl;
        
        // Parse the destination URL out of Yahoo's search redirect URL parameter
        if (url.includes('/RU=')) {
          const parts = url.split('/RU=');
          if (parts[1]) {
            url = decodeURIComponent(parts[1].split('/')[0]);
          }
        }

        // Clean title
        let title = titleText
          .replace(/^[a-zA-Z0-9.-]+\.comhttps?:\/\/[a-zA-Z0-9.-]+/i, '') // Remove domain prefix
          .replace(/^[a-zA-Z0-9.-]+\.com/i, '')
          .replace(/ \|.*/, '')
          .replace(/ - Myntra$/i, '')
          .replace(/ - Savana$/i, '')
          .replace(/ - Westside$/i, '')
          .replace(/ - Ajio$/i, '')
          .replace(/ - URBANIC$/i, '')
          .replace(/Online Shopping.*/i, '')
          .replace(/Online at Best.*/i, '')
          .trim();

        // If title is empty after cleaning, use the original
        if (title.length < 5) {
          title = titleText;
        }

        // Skip ads
        if (title.toLowerCase() === 'ad' || url.includes('bing.com/aclick')) return;

        let tag = "Web Find 🌐";
        let category = "Casual Wear";
        if (url.includes('myntra.com')) {
          tag = "Myntra 🛍️";
        } else if (url.includes('savana.com')) {
          tag = "Savana ✨";
        } else if (url.includes('westside.com')) {
          tag = "Westside 🌸";
        } else if (url.includes('ajio.com')) {
          tag = "Ajio 💎";
        }

        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('dress') || lowerTitle.includes('set') || lowerTitle.includes('coord') || lowerTitle.includes('skirt')) {
          category = "Dresses & Co-ords";
        } else if (lowerTitle.includes('top') || lowerTitle.includes('corset') || lowerTitle.includes('shirt') || lowerTitle.includes('tee')) {
          category = "Cute Tops & Corsets";
        } else if (lowerTitle.includes('hoodie') || lowerTitle.includes('sweater') || lowerTitle.includes('cardigan') || lowerTitle.includes('jacket')) {
          category = "Cozy Hoodies & Cardigans";
        } else if (lowerTitle.includes('street') || lowerTitle.includes('cargo') || lowerTitle.includes('jeans')) {
          category = "Aesthetic Streetwear & Tees";
        }

        const seed = title.length + index;
        const priceNum = (seed % 15) * 100 + 699;
        const originalPriceNum = Math.floor(priceNum * 1.5);

        const image = getAestheticImage(title);

        results.push({
          id: `search-${index}-${seed}`,
          title: title.length > 50 ? title.substring(0, 50) + '...' : title,
          category,
          price: `₹${priceNum}`,
          originalPrice: `₹${originalPriceNum}`,
          image,
          shopUrl: url,
          tag,
          description: `Discovered live via search query "${query}". Perfect match for Vaibhavi.`
        });
      }
    });

    res.json(results);
  } catch (error) {
    console.error('Yahoo Search Scraper Error:', error);
    res.status(500).json({ error: 'Failed to query clothing items from search engine' });
  }
});

// Helper functions for scraping & fallbacks
const detectBrand = (url) => {
  if (url.includes('myntra.com')) return 'Myntra FWD';
  if (url.includes('flipkart.com')) return 'Flipkart Style';
  if (url.includes('savana.com')) return 'Savana';
  if (url.includes('ajio.com')) return 'Ajio';
  if (url.includes('westside.com')) return 'Westside';
  if (url.includes('urbanic.com')) return 'Urbanic';
  return 'E-Commerce Store';
};

const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/Online Shopping.*/i, '')
    .replace(/Online at Best Price.*/i, '')
    .replace(/ \|.*/, '')
    .replace(/ - Myntra$/i, '')
    .replace(/ - Savana$/i, '')
    .replace(/ - Flipkart$/i, '')
    .replace(/ - Ajio$/i, '')
    .replace(/ - Westside$/i, '')
    .replace(/ - URBANIC$/i, '')
    .trim();
};

const fallbackUrlParser = (url) => {
  const brand = detectBrand(url);
  let title = 'Chic Fashion Outfit';
  let category = 'Dresses & Co-ords';

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/');
    
    let descriptiveSegment = '';
    if (url.includes('myntra.com')) {
      const buyIdx = segments.indexOf('buy');
      if (buyIdx > 1) {
        descriptiveSegment = segments[buyIdx - 2] || segments[buyIdx - 1];
      } else {
        descriptiveSegment = segments[3] || segments[2] || '';
      }
    } else if (url.includes('flipkart.com')) {
      descriptiveSegment = segments[1] || '';
    } else {
      descriptiveSegment = segments[2] || segments[1] || '';
    }

    if (descriptiveSegment) {
      title = descriptiveSegment
        .replace(/[+-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      title = title
        .replace(/Buy\s+/gi, '')
        .replace(/\s+Online$/gi, '')
        .replace(/\s+At\s+Best\s+Price.*/gi, '');
      
      if (title.length < 5) title = 'Chic Fashion Pick';
    }

    const lowerTitle = title.toLowerCase();
    const lowerUrl = url.toLowerCase();
    
    if (lowerTitle.includes('top') || lowerTitle.includes('corset') || lowerTitle.includes('shirt') || lowerTitle.includes('tee') || lowerUrl.includes('top') || lowerUrl.includes('shirt') || lowerUrl.includes('tee')) {
      category = 'Cute Tops & Corsets';
    } else if (lowerTitle.includes('hoodie') || lowerTitle.includes('sweater') || lowerTitle.includes('cardigan') || lowerUrl.includes('hoodie') || lowerUrl.includes('sweater') || lowerUrl.includes('cardigan')) {
      category = 'Cozy Hoodies & Cardigans';
    } else if (lowerTitle.includes('street') || lowerTitle.includes('cargo') || lowerTitle.includes('jeans') || lowerUrl.includes('street') || lowerUrl.includes('cargo') || lowerUrl.includes('jeans') || lowerTitle.includes('pants') || lowerTitle.includes('skirt')) {
      category = 'Aesthetic Streetwear & Tees';
    }
  } catch (e) {}

  let priceBase = 899;
  if (category === 'Dresses & Co-ords') priceBase = 1299;
  if (category === 'Cozy Hoodies & Cardigans') priceBase = 1499;
  if (brand.includes('Myntra') || brand.includes('Ajio')) priceBase += 200;
  if (brand.includes('Savana')) priceBase -= 100;
  
  const seed = title.length;
  const priceNum = priceBase + (seed % 5) * 100;
  const originalPriceNum = Math.floor(priceNum * 1.6);

  return {
    title: title.length > 50 ? title.substring(0, 50) + '...' : title,
    category,
    brand,
    price: `₹${priceNum}`,
    originalPrice: `₹${originalPriceNum}`,
    description: `A stunning selection from ${brand}. This item features premium quality, chic details, and fits perfectly into Vaibhavi's aesthetic style.`,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: (4.4 + (seed % 6) * 0.1).toFixed(1),
    reviewsCount: 30 + (seed % 15) * 8
  };
};

// GET Live Product Preview Scraper & Details Parser
app.get('/api/scrape-product', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 5000
    });

    const $ = cheerio.load(response.data);
    
    const ogTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').text();
    const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
    const ogDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || '';
    const ogBrand = $('meta[property="product:brand"]').attr('content') || $('meta[name="brand"]').attr('content') || $('meta[property="og:site_name"]').attr('content');
    
    let price = $('meta[property="product:price:amount"]').attr('content') || $('meta[property="og:price:amount"]').attr('content');
    
    let jsonLdProduct = null;
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).text().trim());
        const searchProduct = (obj) => {
          if (!obj) return;
          if (obj['@type'] === 'Product') {
            jsonLdProduct = obj;
            return;
          }
          if (Array.isArray(obj)) {
            for (const item of obj) searchProduct(item);
          } else if (typeof obj === 'object') {
            if (obj['@graph']) searchProduct(obj['@graph']);
            for (const key in obj) {
              if (typeof obj[key] === 'object') searchProduct(obj[key]);
            }
          }
        };
        searchProduct(data);
      } catch (e) {}
    });

    let images = [];
    if (ogImage) images.push(ogImage);

    let title = ogTitle;
    let description = ogDesc;
    let brand = ogBrand;

    if (jsonLdProduct) {
      title = jsonLdProduct.name || title;
      description = jsonLdProduct.description || description;
      if (jsonLdProduct.brand) {
        brand = typeof jsonLdProduct.brand === 'object' ? jsonLdProduct.brand.name : jsonLdProduct.brand;
      }
      if (jsonLdProduct.image) {
        if (Array.isArray(jsonLdProduct.image)) {
          images = [...new Set([...images, ...jsonLdProduct.image])];
        } else if (typeof jsonLdProduct.image === 'string') {
          images.push(jsonLdProduct.image);
        } else if (typeof jsonLdProduct.image === 'object' && jsonLdProduct.image.url) {
          images.push(jsonLdProduct.image.url);
        }
      }
      if (jsonLdProduct.offers) {
        const offers = jsonLdProduct.offers;
        if (offers.price) {
          price = offers.price;
        } else if (Array.isArray(offers) && offers[0] && offers[0].price) {
          price = offers[0].price;
        } else if (offers.lowPrice) {
          price = offers.lowPrice;
        }
      }
    }

    let cleanPrice = price ? `₹${price}` : null;
    images = [...new Set(images)].filter(img => img && img.startsWith('http'));

    const isBlocked = !title || title.includes('Access Denied') || title.includes('Robot') || title.includes('CAPTCHA') || response.status === 403;

    if (isBlocked) {
      throw new Error('Blocked or page template invalid');
    }

    res.json({
      success: true,
      title: cleanText(title),
      description: cleanText(description) || 'A beautiful fashion piece perfect for your look.',
      brand: brand || detectBrand(url),
      price: cleanPrice,
      images: images.length > 0 ? images : null,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      rating: '4.8',
      reviewsCount: 42,
      source: 'live-scrape'
    });

  } catch (err) {
    console.log(`Scraper fallback triggered for: ${url} (${err.message})`);
    const parsedData = fallbackUrlParser(url);
    res.json({
      success: true,
      ...parsedData,
      source: 'url-fallback'
    });
  }
});

// 5. GET Automated Scraped Closet (Myntra FWD and Flipkart storefronts)
app.get('/api/automated-closet', async (req, res) => {
  const myntraUrl = 'https://www.myntra.com/shop/fwd-women';
  const flipkartUrl = 'https://www.flipkart.com/ls-bbdh-july-inline-women-b-at-store?param=10928374&BU=LifeStyle.';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  };

  const cards = [];

  // Crawl Myntra FWD
  try {
    const response = await axios.get(myntraUrl, { headers });
    const $ = cheerio.load(response.data);
    let myxData = null;
    
    $('script').each((i, el) => {
      const text = $(el).text() || '';
      if (text.includes('window.__myx =')) {
        const startIdx = text.indexOf('window.__myx =') + 'window.__myx ='.length;
        let jsonStr = text.substring(startIdx).trim();
        if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
        try {
          myxData = JSON.parse(jsonStr);
        } catch (e) {
          // Fallback brace parser
          let count = 0;
          let endIdx = 0;
          for (let i = 0; i < jsonStr.length; i++) {
            if (jsonStr[i] === '{') count++;
            else if (jsonStr[i] === '}') {
              count--;
              if (count === 0) {
                endIdx = i + 1;
                break;
              }
            }
          }
          try {
            myxData = JSON.parse(jsonStr.substring(0, endIdx));
          } catch (err) {}
        }
      }
    });

    if (myxData) {
      const traverse = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        
        if (obj.src && obj.url && typeof obj.src === 'string' && typeof obj.url === 'string') {
          if (obj.src.includes('assets.myntassets.com') && (obj.url.includes('myntra.com') || obj.url.startsWith('/'))) {
            let fullUrl = obj.url;
            if (fullUrl.startsWith('/')) {
              fullUrl = 'https://www.myntra.com' + fullUrl;
            }
            
            // Deduplicate
            if (!cards.some(c => c.shopUrl === fullUrl)) {
              let category = 'Dresses & Co-ords';
              if (fullUrl.toLowerCase().includes('top') || fullUrl.toLowerCase().includes('shirt') || fullUrl.toLowerCase().includes('tee')) {
                category = 'Cute Tops & Corsets';
              } else if (fullUrl.toLowerCase().includes('hoodie') || fullUrl.toLowerCase().includes('sweater')) {
                category = 'Cozy Hoodies & Cardigans';
              } else if (fullUrl.toLowerCase().includes('jeans') || fullUrl.toLowerCase().includes('cargo')) {
                category = 'Aesthetic Streetwear & Tees';
              }

              let title = 'Myntra FWD Special';
              if (fullUrl.includes('?f=') || fullUrl.includes('fwdgenz')) {
                const match = fullUrl.match(/fwd([a-z]+)collection/i);
                if (match && match[1]) {
                  title = `${match[1].charAt(0).toUpperCase() + match[1].slice(1)} Drip`;
                }
              }

              cards.push({
                title,
                category,
                price: '₹999',
                originalPrice: '₹1,999',
                image: obj.src,
                shopUrl: fullUrl,
                tag: 'Myntra FWD 🔥',
                description: 'A trendy Gen-Z outfit direct from Myntra FWD Store.'
              });
            }
          }
        }
        
        for (const k in obj) {
          traverse(obj[k]);
        }
      };
      traverse(myxData);
    }
  } catch (err) {
    console.error('Myntra crawler error:', err.message);
  }

  // Crawl Flipkart Women
  try {
    const response = await axios.get(flipkartUrl, { headers });
    const $ = cheerio.load(response.data);

    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const img = $(el).find('img');
      if (img.length > 0 && href) {
        const src = img.attr('src') || img.attr('data-src') || '';
        
        let fullUrl = href;
        if (fullUrl.startsWith('/')) {
          fullUrl = 'https://www.flipkart.com' + fullUrl;
        }

        const isFashion = !fullUrl.includes('flight') && 
                          !fullUrl.includes('travel') && 
                          !fullUrl.includes('seller') && 
                          !fullUrl.includes('help') && 
                          !fullUrl.includes('insurance') && 
                          !fullUrl.includes('/plus') &&
                          !fullUrl.includes('youtube.com') && 
                          !fullUrl.includes('instagram.com') && 
                          !fullUrl.includes('facebook.com') && 
                          !fullUrl.includes('twitter.com');
        
        if (src && (src.includes('rukminim') || src.includes('flixcart')) && isFashion && !src.includes('profile-') && !src.includes('logo-')) {
          if (!cards.some(c => c.shopUrl === fullUrl)) {
            let title = 'Flipkart Style Drip';
            if (fullUrl.includes('q=')) {
              const urlParams = new URLSearchParams(fullUrl.split('?')[1]);
              const qParam = urlParams.get('q');
              if (qParam) title = qParam.charAt(0).toUpperCase() + qParam.slice(1);
            } else if (fullUrl.includes('param=')) {
              title = 'LifeStyle Outfit';
            }

            let category = 'Dresses & Co-ords';
            const lowerUrl = fullUrl.toLowerCase();
            if (lowerUrl.includes('top') || lowerUrl.includes('tshirt') || lowerUrl.includes('shirt') || lowerUrl.includes('tee')) {
              category = 'Cute Tops & Corsets';
            } else if (lowerUrl.includes('hoodie') || lowerUrl.includes('sweater') || lowerUrl.includes('cardigan')) {
              category = 'Cozy Hoodies & Cardigans';
            } else if (lowerUrl.includes('jeans') || lowerUrl.includes('pants') || lowerUrl.includes('cargo') || lowerUrl.includes('skirt')) {
              category = 'Aesthetic Streetwear & Tees';
            }

            const seed = title.length + cards.length;
            const priceNum = (seed % 10) * 150 + 599; // Pricing from ₹599 to ₹1,949

            cards.push({
              title,
              category,
              price: `₹${priceNum}`,
              originalPrice: `₹${Math.floor(priceNum * 1.5)}`,
              image: src,
              shopUrl: fullUrl,
              tag: 'Flipkart Style ✨',
              description: 'Chic budget fashion found live on Flipkart LifeStyle Store.'
            });
          }
        }
      }
    });
  } catch (err) {
    console.error('Flipkart crawler error:', err.message);
  }

  // Combine crawled cards with curated Best Picks
  let combinedCards = [...bestPicksData];
  cards.forEach(c => {
    // Deduplicate based on shopUrl
    if (!combinedCards.some(cc => cc.shopUrl === c.shopUrl)) {
      c.id = `crawled-${combinedCards.length + 1}`;
      combinedCards.push(c);
    }
  });

  res.json(combinedCards);
});

export default app;
