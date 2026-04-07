// src/pages/Home.jsx
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import Navbar      from '../components/Navbar'
import Footer      from '../components/Footer'
import ProductCard from '../components/ProductCard'

const CATEGORIES = ['all','vegetables','fruits','grains','dairy','spices','other']

const HERO_SLIDES = [
  { emoji: '🥦', bg: 'from-forest-700 to-forest-500', label: 'Fresh Vegetables' },
  { emoji: '🍎', bg: 'from-red-600 to-orange-400',    label: 'Juicy Fruits'     },
  { emoji: '🌾', bg: 'from-harvest-700 to-harvest-500', label: 'Quality Grains' },
]

export default function Home() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [slide,    setSlide]    = useState(0)

  const query    = searchParams.get('q')   ?? ''
  const category = searchParams.get('cat') ?? 'all'

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (query)                 params.q        = query
      if (category !== 'all')   params.category  = category
      const { data } = await api.get('/products', { params })
      setProducts(data.products ?? [])
    } catch { setProducts([]) }
    finally  { setLoading(false) }
  }, [query, category])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 4000)
    return () => clearInterval(id)
  }, [])

  const hero = HERO_SLIDES[slide]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={q => setSearchParams(q ? { q } : {})} />

      {/* Hero */}
      {!query && category === 'all' && (
        <section className={`bg-gradient-to-r ${hero.bg} text-white transition-all duration-700`}>
          <div className="max-w-7xl mx-auto px-4 py-14 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 animate-fade-in">
              <p className="text-harvest-200 font-body font-semibold text-sm uppercase tracking-widest mb-2">Agrozon Marketplace</p>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-4">{t('home.hero_title')}</h1>
              <p className="font-body text-white/80 text-lg mb-6 max-w-lg">{t('home.hero_sub')}</p>
              <button
                onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary inline-flex items-center gap-2">
                {t('home.shop_now')} ↓
              </button>
            </div>
            <div className="text-9xl select-none animate-pulse-soft">{hero.emoji}</div>
          </div>
          <div className="flex justify-center gap-2 pb-4">
            {HERO_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all ${i === slide ? 'bg-white w-5' : 'bg-white/40 w-2'}`} />
            ))}
          </div>
        </section>
      )}

      {/* Category tabs */}
      <section className="bg-white border-b border-gray-100 sticky top-[104px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSearchParams(cat !== 'all' ? { cat } : {})}
                className={`px-4 py-1.5 rounded-full text-sm font-body font-semibold whitespace-nowrap transition-all shrink-0
                  ${category === cat ? 'bg-forest-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <main id="products-grid" className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-gray-800">
            {query ? t('home.search_results', { query }) : t('home.featured')}
          </h2>
          {products.length > 0 && (
            <span className="text-sm font-body text-gray-400">{products.length} products</span>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-6xl">🔍</span>
            <p className="font-display text-xl font-semibold text-gray-500">{t('home.no_products')}</p>
            <button onClick={() => setSearchParams({})} className="btn-ghost">Clear filters</button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
