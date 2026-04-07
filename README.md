# 🌿 Agrozon — Farmer's Marketplace

A full-stack, multi-language e-commerce marketplace connecting farmers directly to consumers.
Built with **React (Vite) + Tailwind CSS + Supabase**.

---

## ✨ Feature Overview

| Feature | Details |
|---|---|
| **Auth** | Supabase email/password · Roles: `user`, `farmer`, `admin` |
| **Multi-language** | English 🇬🇧, Hindi 🇮🇳, Marathi 🌾 · Persisted in localStorage |
| **Browsing** | Product grid, category/subcategory filters, search, product detail |
| **Cart** | Add/remove/qty · Synced to Supabase per user |
| **Checkout** | Delivery address → order + order_items persisted |
| **Orders** | User order history with expandable items + status badges |
| **Farmer Portal** | Dashboard with stats, full product CRUD, image upload |
| **Admin Portal** | Dashboard stats, manage all products, update order statuses |
| **Images** | Supabase Storage upload OR paste any URL |
| **Dummy Data** | 75 seed products across all categories with Unsplash photos |
| **RLS** | Full Row Level Security on all tables + storage |

---

## 🗂 Project Structure

```
agrozon/
├── supabase/
│   └── schema.sql              ← Full DB + RLS + 75 seed products
├── src/
│   ├── supabase/client.js      ← Supabase JS client
│   ├── i18n/
│   │   ├── index.js
│   │   └── locales/            ← en.json  hi.json  mr.json
│   ├── context/
│   │   ├── AuthContext.jsx     ← user, profile, isAdmin, isFarmer
│   │   └── CartContext.jsx     ← cart state + Supabase sync
│   ├── components/
│   │   ├── Navbar.jsx          ← search, cart badge, user/farmer/admin menus
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   └── ProtectedRoute.jsx  ← adminOnly / farmerOnly guards
│   ├── pages/
│   │   ├── Home.jsx            ← Storefront + hero + category tabs
│   │   ├── Login.jsx
│   │   ├── Register.jsx        ← Buyer or Farmer registration toggle
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Orders.jsx
│   │   ├── farmer/
│   │   │   ├── FarmerLayout.jsx     ← Warm harvest-coloured sidebar
│   │   │   ├── FarmerDashboard.jsx  ← Stats, category chart, recent listings
│   │   │   └── FarmerProducts.jsx   ← Full CRUD with image upload + suggestions
│   │   └── admin/
│   │       ├── AdminLayout.jsx
│   │       ├── Dashboard.jsx
│   │       ├── ManageProducts.jsx
│   │       └── ManageOrders.jsx
│   ├── App.jsx                 ← All routes
│   ├── main.jsx
│   └── index.css               ← Tailwind + custom utilities
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🚀 Quick Setup (5 minutes)

### 1 · Install dependencies

```bash
npm install
```

### 2 · Create a Supabase project

1. Go to [https://app.supabase.com](https://app.supabase.com) → New Project
2. **Project Settings → API** → copy **URL** and **anon/public key**

### 3 · Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4 · Run the database schema

1. Open **Supabase Dashboard → SQL Editor**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

This creates:
- All 5 tables with RLS policies
- Storage bucket `product-images`
- Auto-create profile trigger
- **75 seed products** with Unsplash images across all categories

### 5 · Start the dev server

```bash
npm run dev
# → http://localhost:5173
```

---

## 👥 User Roles

### 🛒 Buyer (default)
Register at `/register` → select **Buyer**
- Browse, search, filter products
- Add to cart, checkout, view orders

### 🌾 Farmer
Register at `/register` → select **Farmer**
Fill in: Farm Name, Location, Bio

After login, you'll see **Farmer Dashboard** in the navbar.
Farmers can:
- Add products across **all 6 categories + subcategories**
- Upload product images or pick from quick suggestions
- Mark products as **Organic** or **Featured**
- Set price, stock, unit
- Edit/delete their own products

### 🛠 Admin
```sql
-- Run in Supabase SQL Editor after registering:
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';
```
UUID found at: Supabase → Authentication → Users

Admins can:
- View dashboard stats
- Manage ALL products (any farmer's)
- Update order statuses

---

## 📦 Product Categories (75 seed products)

| Category | Sub-categories | Count |
|---|---|---|
| 🥦 Vegetables | Leafy, Root, Gourd, Pod, Nightshade, Brassica, Bulb, Fungi, Grain-veg, Exotic | 25 |
| 🍎 Fruits | Tropical, Citrus, Temperate, Vine, Berry, Melon, Exotic, Medicinal, Dried | 20 |
| 🌾 Grains & Pulses | Rice, Wheat, Millets, Pulses, Oilseeds, Maize | 10 |
| 🥛 Dairy & Eggs | Milk, Paneer, Fermented, Butter/Ghee, Condensed, Eggs | 8 |
| 🌶️ Spices & Herbs | Whole, Powder, Fresh, Dried Herbs, Blends, Aromatics | 8 |
| 🍯 Other Farm | Honey, Oils, Sweeteners, Seeds, Dried, Medicinal, Flowers | 4 |

**All 75 products have:**
- Real Unsplash images
- Detailed descriptions
- Named farmer + farm location
- Organic/featured tags
- Realistic pricing

---

## 🌐 Multi-language

| Code | Language | Flag |
|---|---|---|
| `en` | English | 🇬🇧 |
| `hi` | Hindi (हिन्दी) | 🇮🇳 |
| `mr` | Marathi (मराठी) | 🌾 |

Language is stored in `localStorage` (`i18nextLng` key).
Switch via the navbar dropdown — changes instantly.

**To add a new language:**
1. Copy `src/i18n/locales/en.json` → `src/i18n/locales/XX.json`
2. Translate all values
3. Add to `src/i18n/index.js` resources + `LANGUAGES` array

---

## 🔒 Security (Row Level Security)

| Table | Public read | Write access |
|---|---|---|
| `profiles` | ✅ Anyone | Own row only |
| `products` | ✅ Anyone | Farmers (own), Admins (all) |
| `cart` | Own rows | Own rows |
| `orders` | Own + Admins | Own (insert), Admins (update) |
| `order_items` | Linked order | Linked order |
| `storage/product-images` | ✅ Anyone | Farmers + Admins |

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router v6 |
| Styling | Tailwind CSS 3, Sora + Nunito fonts |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| State | React Context API |
| i18n | react-i18next + i18next-browser-languagedetector |
| Notifications | react-hot-toast |

---

## 📦 Build & Deploy

```bash
npm run build          # output in /dist

# Deploy to Vercel (recommended)
npm i -g vercel
vercel
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel dashboard
```

---

## 🌾 Made for Farmers of India — Agrozon
