// backend/src/scripts/seed.js
// Run with: npm run seed
// Creates admin user, 5 demo farmers, and 75 products with Unsplash images.

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const User     = require('../models/User')
const Product  = require('../models/Product')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agrozon'

// ── Demo users ────────────────────────────────────────────────
const USERS = [
  {
    name: 'Admin User',  email: 'admin@agrozon.com',
    password: 'admin123', role: 'admin',
    farmName: '', location: '',
  },
  {
    name: 'Raju Patil',   email: 'raju@farm.com',
    password: 'farmer123', role: 'farmer',
    farmName: 'Patil Organic Farm', location: 'Nashik, Maharashtra',
    bio: 'Third-generation farmer specialising in tomatoes, onions and organic vegetables.',
  },
  {
    name: 'Suresh Naik',  email: 'suresh@farm.com',
    password: 'farmer123', role: 'farmer',
    farmName: 'Konkan Orchards', location: 'Ratnagiri, Maharashtra',
    bio: 'Known for premium Alphonso mangoes and tropical fruits from the Konkan coast.',
  },
  {
    name: 'Anita Sharma', email: 'anita@farm.com',
    password: 'farmer123', role: 'farmer',
    farmName: 'Sharma Spice Garden', location: 'Erode, Tamil Nadu',
    bio: 'Organic spice grower — turmeric, cardamom, pepper and traditional blends.',
  },
  {
    name: 'Harvinder Singh', email: 'harvinder@farm.com',
    password: 'farmer123', role: 'farmer',
    farmName: 'Punjab Grain House', location: 'Amritsar, Punjab',
    bio: 'Premium Basmati rice and heritage wheat varieties from the fertile plains of Punjab.',
  },
  {
    name: 'Kamla Devi',   email: 'kamla@farm.com',
    password: 'farmer123', role: 'farmer',
    farmName: 'Mathura Dairy Farm', location: 'Mathura, Uttar Pradesh',
    bio: 'Pure A2 cow milk products — paneer, ghee, curd and butter made traditionally.',
  },
]

// ── 75 products ───────────────────────────────────────────────
// farmerKey maps to the index in USERS array (1–5 are farmers)
const PRODUCTS = [
  // ═══ VEGETABLES (25) ════════════════════════════════════════
  {
    farmerKey: 1, name: 'Fresh Tomatoes',
    description: 'Plump vine-ripened tomatoes bursting with natural sweetness. Perfect for curries, salads and chutneys. Grown with minimal pesticides in the fertile soils of Maharashtra.',
    price: 40, category: 'vegetables', subCategory: 'nightshade',
    stock: 200, unit: 'kg', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Baby Potatoes',
    description: 'Tender small potatoes with thin skin — ideal for roasting, dum aloo, or curries. Harvested fresh from our farm in Satara district.',
    price: 35, category: 'vegetables', subCategory: 'root',
    stock: 300, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Red Onions',
    description: 'Pungent red onions with deep colour, perfect for everyday Indian cooking. Sourced directly from Lasalgaon — Asia\'s largest onion market.',
    price: 30, category: 'vegetables', subCategory: 'bulb',
    stock: 500, unit: 'kg', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Fresh Spinach',
    description: 'Tender dark-green spinach leaves rich in iron and vitamins. Harvested every morning and delivered within hours. Great for palak paneer and smoothies.',
    price: 25, category: 'vegetables', subCategory: 'leafy',
    stock: 150, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Organic Carrots',
    description: 'Sweet crunchy orange carrots grown without synthetic fertilisers. High in beta-carotene. Great raw, juiced, or in carrot halwa.',
    price: 45, category: 'vegetables', subCategory: 'root',
    stock: 180, unit: 'kg', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'White Cauliflower',
    description: 'Large firm cauliflower heads with tight white curds. Freshly harvested from our winter crop. Perfect for gobi masala and soups.',
    price: 55, category: 'vegetables', subCategory: 'brassica',
    stock: 120, unit: 'piece', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Brinjal / Eggplant',
    description: 'Glossy purple brinjals with firm flesh. Ideal for baingan bharta, stuffed brinjal curry, and grilling. Medium-sized variety.',
    price: 30, category: 'vegetables', subCategory: 'nightshade',
    stock: 200, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca98f9843?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Mixed Capsicum',
    description: 'Vibrant red and yellow capsicums — sweet, crunchy and colourful. Ideal for stir-fries, salads, and pizza toppings. Grown in polyhouses.',
    price: 80, category: 'vegetables', subCategory: 'nightshade',
    stock: 100, unit: 'kg', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'English Cucumber',
    description: 'Long thin-skinned cucumbers with mild flavour. Refreshing and hydrating — perfect raw, in raita, or as a snack with chaat masala.',
    price: 20, category: 'vegetables', subCategory: 'gourd',
    stock: 250, unit: 'piece', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Bitter Gourd (Karela)',
    description: 'Fresh green karela with characteristic bitter flavour. Known for its anti-diabetic properties. Grown using traditional farming methods.',
    price: 35, category: 'vegetables', subCategory: 'gourd',
    stock: 150, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Lady Finger (Okra)',
    description: 'Tender fresh bhindi harvested young for the best texture. Quick-cooking and versatile — great for bhindi masala, stir-fry, or sambar.',
    price: 40, category: 'vegetables', subCategory: 'pod',
    stock: 180, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c18106?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Green Cabbage',
    description: 'Dense heavy heads of green cabbage from our winter harvest. Mild and crisp. Use in coleslaw, sabzi, or fermented preparations.',
    price: 25, category: 'vegetables', subCategory: 'brassica',
    stock: 200, unit: 'piece', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Orange Pumpkin',
    description: 'Large sweet orange pumpkin with dense flesh. Great for soups, curries, halwa, and roasting. Grown on the vine to full sweetness.',
    price: 40, category: 'vegetables', subCategory: 'gourd',
    stock: 100, unit: 'piece', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Button Mushrooms',
    description: 'Fresh creamy-white button mushrooms. Earthy umami-rich flavour. Grown in controlled humidity. Ready for pasta, pizza, or kadai mushroom.',
    price: 120, category: 'vegetables', subCategory: 'fungi',
    stock: 80, unit: 'packet', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1552825897-bb93b16f5b75?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Fresh Green Peas',
    description: 'Sweet tender green peas freshly shelled and packed. Bursting with natural sweetness. Perfect for matar paneer, pulao, and salads.',
    price: 60, category: 'vegetables', subCategory: 'pod',
    stock: 130, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1587402092301-725e37c364f9?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Sweet Corn',
    description: 'Golden sweet corn on the cob, freshly harvested. Naturally sweet — great grilled with butter and chaat masala, or made into bhutta curry.',
    price: 15, category: 'vegetables', subCategory: 'grain-veg',
    stock: 300, unit: 'piece', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Beetroot',
    description: 'Deep crimson beetroots with earthy sweetness. Rich in antioxidants and nitrates. Ideal for salads, juice blending, and beetroot halwa.',
    price: 30, category: 'vegetables', subCategory: 'root',
    stock: 200, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'White Radish (Mooli)',
    description: 'Long crisp white radish with mild peppery bite. Excellent for mooli paratha, salads, and daikon-style preparations.',
    price: 20, category: 'vegetables', subCategory: 'root',
    stock: 250, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1591922781063-a16553bb9c14?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Drumstick (Moringa)',
    description: 'Long fibrous drumsticks fresh from moringa trees. Packed with nutrients — use in sambar, dal, and curries. Authentic South Indian favourite.',
    price: 35, category: 'vegetables', subCategory: 'pod',
    stock: 150, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1602193606873-6e1e85c9ee36?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Bottle Gourd (Lauki)',
    description: 'Fresh tender bottle gourd — light, digestible and cooling. Perfect for lauki kofta, halwa, dal, and diabetic-friendly cooking.',
    price: 25, category: 'vegetables', subCategory: 'gourd',
    stock: 200, unit: 'piece', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1615485291234-9d694219dac6?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Spring Onions',
    description: 'Crispy spring onions with white bulb and fresh green tops. Adds freshness to stir-fries, soups, spring rolls, and chaats.',
    price: 30, category: 'vegetables', subCategory: 'bulb',
    stock: 160, unit: 'bunch', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1587049693812-baa4c6dba16e?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Raw Banana (Plantain)',
    description: 'Green raw bananas used in South Indian and Maharashtrian cooking. Great for kele chi bhaji, banana chips, and thalipeeth.',
    price: 25, category: 'vegetables', subCategory: 'grain-veg',
    stock: 200, unit: 'dozen', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'French Beans',
    description: 'Tender slender French beans — crisp and quick-cooking. Great for thoran, stir-fry, and South Indian mixed vegetable rice.',
    price: 55, category: 'vegetables', subCategory: 'pod',
    stock: 140, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Flat Beans (Pavta)',
    description: 'Fresh flat beans with meaty texture. Popular in Maharashtra as pavta bhaji or usal. Rich in plant protein and dietary fibre.',
    price: 50, category: 'vegetables', subCategory: 'pod',
    stock: 120, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1587402092301-725e37c364f9?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Zucchini',
    description: 'Tender green zucchini grown in polyhouses. Mild and quick-cooking. Great for stir-fries, pasta, ratatouille, and stuffed dishes.',
    price: 70, category: 'vegetables', subCategory: 'gourd',
    stock: 100, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80',
  },

  // ═══ FRUITS (20) ════════════════════════════════════════════
  {
    farmerKey: 2, name: 'Alphonso Mangoes',
    description: 'The king of mangoes — premium Alphonso (Hapus) from Ratnagiri with intense aroma, rich golden flesh, and natural sweetness. GI-tagged variety.',
    price: 350, category: 'fruits', subCategory: 'tropical',
    stock: 80, unit: 'dozen', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Cavendish Bananas',
    description: 'Fresh ripe yellow bananas — naturally sweet and energy-rich. No added chemicals. Ideal for breakfast, smoothies, or simply as a snack.',
    price: 30, category: 'fruits', subCategory: 'tropical',
    stock: 400, unit: 'dozen', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Kashmir Red Apples',
    description: 'Crisp sweet-tart apples from high-altitude orchards of Himachal Pradesh. Hand-picked at peak ripeness. No wax coating.',
    price: 180, category: 'fruits', subCategory: 'temperate',
    stock: 150, unit: 'kg', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Black Seedless Grapes',
    description: 'Juicy seedless dark-purple grapes with naturally sweet flavour. Grown in the vineyards of Nashik — India\'s wine country.',
    price: 120, category: 'fruits', subCategory: 'vine',
    stock: 100, unit: 'kg', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Bhagwa Pomegranate',
    description: 'Ruby-red Bhagwa pomegranates with soft juicy arils and a perfect sweet-tart balance. Rich in antioxidants. Solapur grown.',
    price: 180, category: 'fruits', subCategory: 'tropical',
    stock: 120, unit: 'kg', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Watermelon',
    description: 'Giant sweet watermelons with deep red flesh and high water content. Perfect for summer — cooling, refreshing, and hydrating.',
    price: 25, category: 'fruits', subCategory: 'melon',
    stock: 60, unit: 'piece', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Ripe Papaya',
    description: 'Ripe orange papaya with sweet buttery flesh. Rich in papain enzyme for digestion. Grown year-round in tropical Maharashtra.',
    price: 45, category: 'fruits', subCategory: 'tropical',
    stock: 100, unit: 'piece', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Tender Coconut',
    description: 'Fresh green tender coconuts with sweet electrolyte-rich water inside. Perfect for hydration. Harvested to order from coastal Maharashtra.',
    price: 35, category: 'fruits', subCategory: 'tropical',
    stock: 200, unit: 'piece', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Fresh Pineapple',
    description: 'Golden fragrant pineapples with intensely sweet flesh. Grown in the lush Western Ghats. Excellent fresh, juiced, or in desserts.',
    price: 60, category: 'fruits', subCategory: 'tropical',
    stock: 90, unit: 'piece', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Nagpur Oranges',
    description: 'The famous Nagpur mandarin oranges with a distinctive flavour and easy-peel skin. GI-tagged, high vitamin C content.',
    price: 90, category: 'fruits', subCategory: 'citrus',
    stock: 180, unit: 'dozen', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Fresh Lemons',
    description: 'Thin-skinned highly juicy lemons bursting with vitamin C. Excellent for lemonade, pickling, cooking, and as a natural preservative.',
    price: 60, category: 'fruits', subCategory: 'citrus',
    stock: 300, unit: 'dozen', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Mahabaleshwar Strawberries',
    description: 'Sweet plump red strawberries freshly picked from Mahabaleshwar\'s cool highland farms. Eat fresh, make jam, or top your desserts.',
    price: 180, category: 'fruits', subCategory: 'berry',
    stock: 60, unit: 'packet', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'White Guava',
    description: 'Crunchy fragrant white-flesh guavas with a distinctive tropical taste. High in vitamin C. Perfect fresh with salt and chilli.',
    price: 50, category: 'fruits', subCategory: 'tropical',
    stock: 200, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1536147116438-62986c88f28c?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Chikoo (Sapota)',
    description: 'Sweet brown sapota with a malty caramel-like flavour. Soft and delicious eaten fresh or blended into milkshakes.',
    price: 60, category: 'fruits', subCategory: 'tropical',
    stock: 150, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1579722820903-af0d3ef9c5e6?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Dragon Fruit',
    description: 'Exotic vibrant pink dragon fruit with white flesh speckled with tiny black seeds. Mild and refreshing — a great superfruit.',
    price: 200, category: 'fruits', subCategory: 'exotic',
    stock: 70, unit: 'piece', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Himachal Plums',
    description: 'Deep purple-red plums with juicy tangy flesh. Short season fruit from Himachal Pradesh. Eat fresh or make jam.',
    price: 150, category: 'fruits', subCategory: 'temperate',
    stock: 80, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Bihar Sweet Lychee',
    description: 'Delicate lychees with translucent white flesh and a sweet floral fragrance. Seasonal summer fruit from Bihar\'s famous lychee belt.',
    price: 250, category: 'fruits', subCategory: 'tropical',
    stock: 60, unit: 'kg', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Kiwi Fruit',
    description: 'Vibrant green flesh kiwis with a perfect sweet-tart flavour. Rich in vitamin C, fibre, and potassium.',
    price: 250, category: 'fruits', subCategory: 'vine',
    stock: 80, unit: 'dozen', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Raw Jackfruit',
    description: 'Massive fragrant raw jackfruit — the ultimate meat substitute. Also sold ripe for its sweet yellow pods. Tropical Maharashtra crop.',
    price: 80, category: 'fruits', subCategory: 'tropical',
    stock: 50, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1520459130620-e8de41f43173?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Amla (Indian Gooseberry)',
    description: 'Fresh tart amla — one of nature\'s richest vitamin C sources. Use in chutneys, murabba, juice, or eat raw with salt and turmeric.',
    price: 60, category: 'fruits', subCategory: 'medicinal',
    stock: 200, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1604242692760-2f7b0c26856d?auto=format&fit=crop&w=600&q=80',
  },

  // ═══ GRAINS & PULSES (10) ════════════════════════════════════
  {
    farmerKey: 4, name: 'Basmati Rice (1 kg)',
    description: 'Premium long-grain aromatic Basmati from the Himalayan foothills of Punjab. Each grain elongates beautifully on cooking. No additives.',
    price: 120, category: 'grains', subCategory: 'rice',
    stock: 500, unit: 'packet', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Chakki Wheat Atta (2 kg)',
    description: 'Stone-ground chakki-fresh atta from desi wheat varieties. High fibre, earthy flavour. Makes soft nutritious chapatis and rotis.',
    price: 90, category: 'grains', subCategory: 'wheat',
    stock: 300, unit: 'packet', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6962b3?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Organic Jowar (Sorghum)',
    description: 'Gluten-free sorghum grains — a nutritional powerhouse staple of Maharashtra. Make bhakri, dalia, or pop like popcorn.',
    price: 70, category: 'grains', subCategory: 'millets',
    stock: 400, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1567564297249-8a9579e5b8f1?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Bajra (Pearl Millet)',
    description: 'Nutrient-dense pearl millet — the drought-hardy supergrain of Rajasthan and Gujarat. Perfect for bajra rotis and khichdi.',
    price: 65, category: 'grains', subCategory: 'millets',
    stock: 350, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Ragi (Finger Millet)',
    description: 'Calcium-rich red ragi from Karnataka\'s red-soil farms. Excellent for ragi mudde, dosa, porridge, and ladoos. Naturally gluten-free.',
    price: 80, category: 'grains', subCategory: 'millets',
    stock: 280, unit: 'kg', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1567564297249-8a9579e5b8f1?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Masoor Dal (Red Lentils)',
    description: 'Split red lentils that cook quickly into creamy silky dal. High protein and easy to digest. A pantry essential across Indian kitchens.',
    price: 110, category: 'grains', subCategory: 'pulses',
    stock: 400, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Chana Dal (Split Chickpeas)',
    description: 'Earthy nutty-flavoured split chickpeas. Makes excellent dal tadka, chana masala, and is the base of besan flour.',
    price: 100, category: 'grains', subCategory: 'pulses',
    stock: 500, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1612257416648-4a26a6f2685b?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Toor Dal (Pigeon Pea)',
    description: 'Classic toor dal for sambar, dal tadka, and amti. Freshly processed with no oil coating. A staple of Indian households.',
    price: 130, category: 'grains', subCategory: 'pulses',
    stock: 450, unit: 'kg', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1603548765019-0cb7c8dc3e30?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Moong Dal (Green Gram)',
    description: 'Whole green mung beans and split moong dal. Light, easy to digest, and protein-rich. Great for sprouting, khichdi, and cheelas.',
    price: 120, category: 'grains', subCategory: 'pulses',
    stock: 350, unit: 'kg', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1612257416648-4a26a6f2685b?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 4, name: 'Whole Black Urad Dal',
    description: 'Whole black urad for dal makhani, dosas, and idlis. Slow-cook overnight for a rich velvety consistency. Premium Madhya Pradesh origin.',
    price: 140, category: 'grains', subCategory: 'pulses',
    stock: 300, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1603548765019-0cb7c8dc3e30?auto=format&fit=crop&w=600&q=80',
  },

  // ═══ DAIRY (8) ════════════════════════════════════════════════
  {
    farmerKey: 5, name: 'Fresh A2 Cow Milk (1 L)',
    description: 'Pure fresh cow milk from free-range desi cows. Non-homogenised, minimally processed. Collected twice daily. Rich in A2 protein.',
    price: 60, category: 'dairy', subCategory: 'milk',
    stock: 200, unit: 'litre', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 5, name: 'Homemade Paneer (250g)',
    description: 'Soft fresh paneer made from pure cow milk. Milky white with smooth crumbly texture. Made fresh daily — no preservatives.',
    price: 180, category: 'dairy', subCategory: 'cheese',
    stock: 80, unit: 'packet', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 5, name: 'Thick Cultured Curd',
    description: 'Thick set curd from full-fat cow milk with a natural culture starter. Mild and creamy — perfect as is, for raita, or lassi.',
    price: 50, category: 'dairy', subCategory: 'fermented',
    stock: 100, unit: 'packet', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 5, name: 'Bilona Cow Ghee (250ml)',
    description: 'Traditionally bilona-churned cow ghee with golden colour and rich nutty aroma. Made from cultured butter of A2 milk.',
    price: 800, category: 'dairy', subCategory: 'fat',
    stock: 50, unit: 'packet', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 5, name: 'Fresh White Butter (Makhan)',
    description: 'Freshly churned white butter from cultured cream. Unsalted, pure, and incredibly flavourful on hot parathas.',
    price: 300, category: 'dairy', subCategory: 'fat',
    stock: 60, unit: 'packet', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 5, name: 'Buffalo Milk Khoya (200g)',
    description: 'Rich dense khoya made by slow-reducing buffalo milk. The base of gulab jamun, barfi, and halwa. Fresh and vacuum-packed.',
    price: 250, category: 'dairy', subCategory: 'condensed',
    stock: 70, unit: 'packet', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 5, name: 'Desi Eggs (Country)',
    description: 'Free-range desi eggs from native country chickens. Smaller, richer yolk and higher nutrition than commercial eggs.',
    price: 90, category: 'dairy', subCategory: 'eggs',
    stock: 150, unit: 'dozen', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1518569656558-1f25e69d2fd4?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 5, name: 'Fresh Buttermilk (Chaas)',
    description: 'Probiotic-rich buttermilk blended with rock salt, cumin, and curry leaves. Freshly churned every morning. Cooling and digestive.',
    price: 20, category: 'dairy', subCategory: 'fermented',
    stock: 120, unit: 'litre', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
  },

  // ═══ SPICES (8) ════════════════════════════════════════════════
  {
    farmerKey: 3, name: 'Organic Turmeric Powder (200g)',
    description: 'Bright yellow turmeric powder with high curcumin content. Stone-ground from whole dried rhizomes. Aromatic and potent. No fillers.',
    price: 95, category: 'spices', subCategory: 'powder',
    stock: 200, unit: 'packet', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e3b5905f027?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 3, name: 'Kashmiri Chilli Powder (200g)',
    description: 'Vibrant deep-red Kashmiri mirch powder. Imparts brilliant colour with moderate heat — the secret behind restaurant-style curries.',
    price: 150, category: 'spices', subCategory: 'powder',
    stock: 150, unit: 'packet', isOrganic: false, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 3, name: 'Whole Cumin Seeds (Jeera)',
    description: 'Aromatic whole cumin seeds with earthy warm flavour. Essential for tempering dals, biryanis, and marinades.',
    price: 120, category: 'spices', subCategory: 'whole',
    stock: 180, unit: 'packet', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 3, name: 'Malabar Black Pepper (Whole)',
    description: 'Premium Malabar black pepper — the king of spices. Hand-picked at the right ripeness and sun-dried to preserve essential oils.',
    price: 250, category: 'spices', subCategory: 'whole',
    stock: 100, unit: 'packet', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 3, name: 'Green Cardamom (Elaichi)',
    description: 'Fragrant green cardamom pods from the Western Ghats. Intensely aromatic. Use whole in biryanis or crushed in chai and sweets.',
    price: 600, category: 'spices', subCategory: 'whole',
    stock: 80, unit: 'packet', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 3, name: 'Fresh Ginger (Adrak)',
    description: 'Plump fibrous rhizomes of fresh ginger — pungent, warming, and versatile. Essential for chai, curries, and Ayurvedic remedies.',
    price: 50, category: 'spices', subCategory: 'fresh',
    stock: 250, unit: 'kg', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-0b5bd8de9df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 3, name: 'Desi Garlic (Lehsun)',
    description: 'Small-clove desi garlic with intensely pungent flavour. Far more aromatic than hybrid varieties. Perfect for garlic butter, dal, and curries.',
    price: 80, category: 'spices', subCategory: 'fresh',
    stock: 300, unit: 'kg', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 3, name: 'Coriander Powder (Dhania)',
    description: 'Freshly ground coriander with citrusy nutty notes. Roasted before grinding for maximum flavour. No additives or colourings.',
    price: 80, category: 'spices', subCategory: 'powder',
    stock: 200, unit: 'packet', isOrganic: false, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=600&q=80',
  },

  // ═══ OTHER FARM PRODUCTS (4) ══════════════════════════════════
  {
    farmerKey: 2, name: 'Wildflower Raw Honey (500g)',
    description: 'Unprocessed unheated wildflower honey harvested from multi-flora hives in the Sahyadri hills. Rich in enzymes and antioxidants.',
    price: 350, category: 'other', subCategory: 'honey',
    stock: 60, unit: 'packet', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 2, name: 'Cold-Pressed Coconut Oil (500ml)',
    description: 'Virgin coconut oil cold-pressed from fresh coconuts within hours of harvest. Pure white, delicately fragrant. No heat, no chemicals.',
    price: 380, category: 'other', subCategory: 'oil',
    stock: 70, unit: 'bottle', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1526976668951-1c01c9a8e1b5?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Organic Jaggery (Gur) 1 kg',
    description: 'Dark mineral-rich organic jaggery made by open-pan slow cooking of fresh sugarcane juice. No chemicals or bleaching agents.',
    price: 120, category: 'other', subCategory: 'sweetener',
    stock: 150, unit: 'kg', isOrganic: true, isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
  },
  {
    farmerKey: 1, name: 'Cold-Pressed Groundnut Oil (1L)',
    description: 'Traditional wooden-pressed peanut oil with rich nutty aroma. Non-refined — retains all natural nutrients and flavour.',
    price: 280, category: 'other', subCategory: 'oil',
    stock: 90, unit: 'bottle', isOrganic: true, isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  },
]

// ── Seed function ──────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('✅ Connected to MongoDB')

  // Clear existing data
  await User.deleteMany({})
  await Product.deleteMany({})
  console.log('🗑  Cleared existing users and products')

  // Create users
  const createdUsers = []
  for (const u of USERS) {
    const user = new User({ ...u })
    await user.save()
    createdUsers.push(user)
    console.log(`👤 Created ${u.role}: ${u.email}`)
  }

  // Create products — attach farmerId from createdUsers
  let count = 0
  for (const p of PRODUCTS) {
    const farmer = createdUsers[p.farmerKey]  // index 1–5 in createdUsers
    await Product.create({
      farmerId:     farmer._id,
      farmerName:   farmer.name,
      farmLocation: farmer.location,
      name:         p.name,
      description:  p.description,
      price:        p.price,
      category:     p.category,
      subCategory:  p.subCategory,
      stock:        p.stock,
      unit:         p.unit,
      imageUrl:     p.imageUrl,
      isOrganic:    p.isOrganic,
      isFeatured:   p.isFeatured,
    })
    count++
  }
  console.log(`🌾 Created ${count} products`)

  console.log('\n🎉 Seed complete!')
  console.log('─────────────────────────────────────────')
  console.log('Admin:   admin@agrozon.com   / admin123')
  console.log('Farmer:  raju@farm.com       / farmer123')
  console.log('Farmer:  suresh@farm.com     / farmer123')
  console.log('Farmer:  anita@farm.com      / farmer123')
  console.log('Farmer:  harvinder@farm.com  / farmer123')
  console.log('Farmer:  kamla@farm.com      / farmer123')
  console.log('─────────────────────────────────────────')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
