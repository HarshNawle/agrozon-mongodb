// src/pages/farmer/FarmerProducts.jsx
// Full CRUD for farmer's own products — all categories + image upload.

import { useEffect, useState, useRef } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value:'vegetables', label:'🥦 Vegetables', sub:[
    {value:'leafy',label:'Leafy Greens (spinach, methi, palak, lettuce)'},
    {value:'root',label:'Root Vegetables (potato, carrot, radish, beetroot)'},
    {value:'gourd',label:'Gourds (lauki, karela, turai, pumpkin, zucchini)'},
    {value:'pod',label:'Pods & Beans (okra, beans, peas, drumstick)'},
    {value:'nightshade',label:'Nightshades (tomato, brinjal, capsicum, chilli)'},
    {value:'brassica',label:'Brassicas (cauliflower, cabbage, broccoli, kale)'},
    {value:'bulb',label:'Bulbs & Alliums (onion, garlic, spring onion)'},
    {value:'fungi',label:'Mushrooms & Fungi'},
    {value:'grain-veg',label:'Grain Vegetables (sweet corn, raw banana, plantain)'},
    {value:'exotic',label:'Exotic Vegetables (asparagus, cherry tomato, pak choy)'},
  ]},
  { value:'fruits', label:'🍎 Fruits', sub:[
    {value:'tropical',label:'Tropical (mango, papaya, banana, coconut, jackfruit)'},
    {value:'citrus',label:'Citrus (orange, lemon, lime, grapefruit, mosambi)'},
    {value:'temperate',label:'Temperate (apple, pear, plum, peach, cherry)'},
    {value:'vine',label:'Vine Fruits (grapes, kiwi, passion fruit)'},
    {value:'berry',label:'Berries (strawberry, blueberry, raspberry, jamun)'},
    {value:'melon',label:'Melons (watermelon, muskmelon, honeydew)'},
    {value:'exotic',label:'Exotic (dragon fruit, rambutan, mangosteen, avocado)'},
    {value:'medicinal',label:'Medicinal Fruits (amla, karonda, wood apple, bael)'},
    {value:'dried',label:'Dried Fruits (raisins, dates, anjeer, prunes)'},
  ]},
  { value:'grains', label:'🌾 Grains & Pulses', sub:[
    {value:'rice',label:'Rice varieties (basmati, sona masoori, red rice, brown)'},
    {value:'wheat',label:'Wheat & Atta (chakki atta, semolina, maida, daliya)'},
    {value:'millets',label:'Millets (jowar, bajra, ragi, foxtail, kodo, barnyard)'},
    {value:'pulses',label:'Pulses & Dal (toor, masoor, chana, moong, urad, rajma)'},
    {value:'oilseeds',label:'Oilseeds (groundnut, sesame, flaxseed, mustard seed)'},
    {value:'maize',label:'Maize & Corn'},
  ]},
  { value:'dairy', label:'🥛 Dairy & Eggs', sub:[
    {value:'milk',label:'Milk (cow A2, buffalo, goat, camel)'},
    {value:'cheese',label:'Paneer & Cheese'},
    {value:'fermented',label:'Fermented (curd, chaas, lassi, kefir)'},
    {value:'fat',label:'Butter & Ghee (bilona, clarified, white makhan)'},
    {value:'condensed',label:'Condensed & Khoya (mawa, condensed milk, cream)'},
    {value:'eggs',label:'Eggs (desi, free-range, quail, duck)'},
  ]},
  { value:'spices', label:'🌶️ Spices & Herbs', sub:[
    {value:'whole',label:'Whole Spices (pepper, cardamom, clove, cinnamon, star anise)'},
    {value:'powder',label:'Ground Spices (turmeric, chilli, cumin, coriander powder)'},
    {value:'fresh',label:'Fresh (ginger, garlic, green chilli, lemongrass)'},
    {value:'herbs',label:'Dried Herbs (curry leaves, bay leaf, fenugreek, mint)'},
    {value:'blend',label:'Spice Blends (garam masala, sambar powder, biryani masala)'},
    {value:'aromatic',label:'Aromatics (saffron, vanilla, nutmeg, mace)'},
  ]},
  { value:'other', label:'🍯 Other Farm Products', sub:[
    {value:'honey',label:'Honey & Bee Products (raw honey, beeswax, pollen)'},
    {value:'oil',label:'Cold-Pressed Oils (coconut, groundnut, mustard, sesame)'},
    {value:'sweetener',label:'Natural Sweeteners (jaggery, mishri, palm sugar, stevia)'},
    {value:'seeds',label:'Seeds & Microgreens (chia, sunflower, pumpkin seeds)'},
    {value:'dried',label:'Dried & Preserved (pickles, papad, dried veg, sun-dried)'},
    {value:'medicinal',label:'Medicinal & Herbal (aloe vera, tulsi, neem, ashwagandha)'},
    {value:'flowers',label:'Flowers & Petals (marigold, rose, jasmine, hibiscus)'},
    {value:'mushroom',label:"Specialty Mushrooms (oyster, shiitake, reishi, lion's mane)"},
  ]},
]

const UNITS = ['kg','gram (100g)','litre','ml (200ml)','piece','dozen','bunch','packet','bag (5kg)','box','bottle','crate']

const IMG_SUGGESTIONS = {
  vegetables:[
    {label:'Tomato',url:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=80'},
    {label:'Potato',url:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'},
    {label:'Onion',url:'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80'},
    {label:'Spinach',url:'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80'},
    {label:'Carrot',url:'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'},
    {label:'Mushroom',url:'https://images.unsplash.com/photo-1552825897-bb93b16f5b75?auto=format&fit=crop&w=600&q=80'},
    {label:'Capsicum',url:'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'},
    {label:'Brinjal',url:'https://images.unsplash.com/photo-1603048588665-791ca98f9843?auto=format&fit=crop&w=600&q=80'},
  ],
  fruits:[
    {label:'Mango',url:'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80'},
    {label:'Apple',url:'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80'},
    {label:'Grapes',url:'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80'},
    {label:'Pomegranate',url:'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80'},
    {label:'Banana',url:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80'},
    {label:'Strawberry',url:'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80'},
    {label:'Watermelon',url:'https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=600&q=80'},
    {label:'Dragon Fruit',url:'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80'},
  ],
  grains:[
    {label:'Rice',url:'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'},
    {label:'Wheat',url:'https://images.unsplash.com/photo-1574323347407-f5e1ad6962b3?auto=format&fit=crop&w=600&q=80'},
    {label:'Millet',url:'https://images.unsplash.com/photo-1567564297249-8a9579e5b8f1?auto=format&fit=crop&w=600&q=80'},
    {label:'Dal',url:'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=600&q=80'},
  ],
  dairy:[
    {label:'Milk',url:'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80'},
    {label:'Ghee',url:'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80'},
    {label:'Curd',url:'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80'},
    {label:'Eggs',url:'https://images.unsplash.com/photo-1518569656558-1f25e69d2fd4?auto=format&fit=crop&w=600&q=80'},
  ],
  spices:[
    {label:'Turmeric',url:'https://images.unsplash.com/photo-1615485500704-8e3b5905f027?auto=format&fit=crop&w=600&q=80'},
    {label:'Chilli',url:'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=600&q=80'},
    {label:'Ginger',url:'https://images.unsplash.com/photo-1615485290382-0b5bd8de9df2?auto=format&fit=crop&w=600&q=80'},
    {label:'Garlic',url:'https://images.unsplash.com/photo-1515586000433-45406d8e6662?auto=format&fit=crop&w=600&q=80'},
  ],
  other:[
    {label:'Honey',url:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80'},
    {label:'Coconut Oil',url:'https://images.unsplash.com/photo-1526976668951-1c01c9a8e1b5?auto=format&fit=crop&w=600&q=80'},
    {label:'Jaggery',url:'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80'},
  ],
}

const EMPTY = { name:'', description:'', price:'', category:'vegetables', subCategory:'',
                stock:'', unit:'kg', imageUrl:'', farmLocation:'', isOrganic:false, isFeatured:false }
const PLACEHOLDER = 'https://placehold.co/80x80/e8f5e9/1a5c38?text=🌿'

export default function FarmerProducts() {
  const { user } = useAuth()
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(false)
  const [form,      setForm]      = useState(EMPTY)
  const [editing,   setEditing]   = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [imgFile,   setImgFile]   = useState(null)
  const [imgPrev,   setImgPrev]   = useState('')
  const [search,    setSearch]    = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [deleteId,  setDeleteId]  = useState(null)
  const [tab,       setTab]       = useState('details')
  const fileRef = useRef()

  const currentSubs    = CATEGORIES.find(c => c.value === form.category)?.sub ?? []
  const imgSuggestions = IMG_SUGGESTIONS[form.category] ?? []

  async function load() {
    setLoading(true)
    try { const { data } = await api.get('/products/my'); setProducts(data) }
    catch { setProducts([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ ...EMPTY, farmLocation: user?.location || '' })
    setEditing(null); setImgFile(null); setImgPrev(''); setTab('details'); setModal(true)
  }
  function openEdit(p) {
    setForm({ name:p.name, description:p.description, price:String(p.price),
              category:p.category, subCategory:p.subCategory||'', stock:String(p.stock),
              unit:p.unit||'kg', imageUrl:p.imageUrl||'', farmLocation:p.farmLocation||'',
              isOrganic:p.isOrganic||false, isFeatured:p.isFeatured||false })
    setEditing(p._id); setImgFile(null); setImgPrev(p.imageUrl||''); setTab('details'); setModal(true)
  }

  function handleImgChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5*1024*1024) { toast.error('Image must be under 5 MB'); return }
    setImgFile(file); setImgPrev(URL.createObjectURL(file))
    setForm(f => ({ ...f, imageUrl:'' }))
  }

  async function uploadImg(file) {
    const fd = new FormData(); fd.append('image', file)
    const { data } = await api.post('/upload/product-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.url
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    setSaving(true)
    try {
      let imageUrl = form.imageUrl
      if (imgFile) imageUrl = await uploadImg(imgFile)
      const payload = { ...form, price:parseFloat(form.price), stock:parseInt(form.stock,10), imageUrl }
      if (editing) { await api.put(`/products/${editing}`, payload); toast.success('Product updated! ✅') }
      else         { await api.post('/products/farmer', payload);   toast.success('Product listed! 🌾') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    try { await api.delete(`/products/${id}`); toast.success('Product removed'); setDeleteId(null); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  const filtered = products.filter(p => {
    const matchCat    = catFilter === 'all' || p.category === catFilter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-800">My Products</h1>
          <p className="font-body text-sm text-gray-400 mt-0.5">{products.length} products listed</p>
        </div>
        <button onClick={openAdd} className="btn-secondary flex items-center gap-2">+ List New Product</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products…" className="input-field max-w-xs" />
        <div className="flex gap-1.5 flex-wrap">
          {['all', ...CATEGORIES.map(c => c.value)].map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold capitalize transition-all
                ${catFilter===cat ? 'bg-harvest-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat==='all' ? 'All' : CATEGORIES.find(c=>c.value===cat)?.label ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-harvest-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-5xl mb-4">🌱</p>
          <p className="font-display font-semibold text-gray-500 text-lg">
            {products.length === 0 ? 'You have no products yet' : 'No products match your filters'}
          </p>
          {products.length === 0 && <button onClick={openAdd} className="btn-secondary mt-4">List Your First Product</button>}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Product</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Stock</th>
                  <th className="text-center px-4 py-3 hidden lg:table-cell">Organic</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl||PLACEHOLDER} alt={p.name}
                          onError={e=>{e.target.src=PLACEHOLDER}}
                          className="w-11 h-11 rounded-lg object-cover border border-gray-100 shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 truncate max-w-[160px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.unit} · {p.subCategory||p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell capitalize text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-harvest-700">₹{p.price}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className={`font-semibold ${p.stock===0?'text-red-500':p.stock<10?'text-orange-500':'text-gray-700'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      {p.isOrganic
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Yes</span>
                        : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs btn-ghost !py-1 !px-3">✏️ Edit</button>
                        <button onClick={() => setDeleteId(p._id)}
                          className="px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-semibold">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <div>
                <h2 className="font-display font-bold text-xl text-gray-800">
                  {editing ? 'Edit Product' : 'List a New Product'}
                </h2>
                <p className="font-body text-xs text-gray-400 mt-0.5">
                  {editing ? 'Update the details below' : 'Fill in your product details to start selling'}
                </p>
              </div>
              <button onClick={() => setModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">×</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              {[{key:'details',label:'📋 Details'},{key:'image',label:'🖼️ Image'}].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-4 py-3 text-sm font-body font-semibold border-b-2 transition-colors
                    ${tab===t.key ? 'border-harvest-500 text-harvest-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className="px-6 py-5">
              {tab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Category *</label>
                      <select value={form.category}
                        onChange={e => setForm(f => ({...f, category:e.target.value, subCategory:''}))}
                        className="input-field">
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Sub-category</label>
                      <select value={form.subCategory}
                        onChange={e => setForm(f => ({...f, subCategory:e.target.value}))}
                        className="input-field">
                        <option value="">— Select —</option>
                        {currentSubs.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Product Name *</label>
                    <input type="text" value={form.name}
                      onChange={e => setForm(f => ({...f, name:e.target.value}))}
                      className="input-field" placeholder="e.g. Organic Alphonso Mangoes" required />
                  </div>
                  <div>
                    <label className="block text-sm font-body font-semibold text-gray-700 mb-1">
                      Description <span className="text-gray-400 font-normal ml-1">(tell buyers about your product)</span>
                    </label>
                    <textarea value={form.description}
                      onChange={e => setForm(f => ({...f, description:e.target.value}))}
                      rows={4} className="input-field resize-none"
                      placeholder="Freshly harvested from my farm, hand-picked and packed…" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Price (₹) *</label>
                      <input type="number" value={form.price}
                        onChange={e => setForm(f => ({...f, price:e.target.value}))}
                        className="input-field" min="0" step="0.5" required placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Stock *</label>
                      <input type="number" value={form.stock}
                        onChange={e => setForm(f => ({...f, stock:e.target.value}))}
                        className="input-field" min="0" required placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Unit</label>
                      <select value={form.unit}
                        onChange={e => setForm(f => ({...f, unit:e.target.value}))}
                        className="input-field">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Farm Location</label>
                    <input type="text" value={form.farmLocation}
                      onChange={e => setForm(f => ({...f, farmLocation:e.target.value}))}
                      className="input-field" placeholder="e.g. Nashik, Maharashtra" />
                  </div>
                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={form.isOrganic}
                        onChange={e => setForm(f => ({...f, isOrganic:e.target.checked}))}
                        className="w-4 h-4 accent-forest-600 rounded cursor-pointer" />
                      <div>
                        <p className="text-sm font-body font-semibold text-gray-700">🌱 Organic</p>
                        <p className="text-xs font-body text-gray-400">Grown without synthetic chemicals</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={form.isFeatured}
                        onChange={e => setForm(f => ({...f, isFeatured:e.target.checked}))}
                        className="w-4 h-4 accent-harvest-500 rounded cursor-pointer" />
                      <div>
                        <p className="text-sm font-body font-semibold text-gray-700">⭐ Featured</p>
                        <p className="text-xs font-body text-gray-400">Highlight in featured section</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {tab === 'image' && (
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl overflow-hidden border-2 border-dashed border-gray-200
                                    bg-gray-50 w-32 h-32 flex items-center justify-center shrink-0">
                      {(imgPrev || form.imageUrl) ? (
                        <img src={imgPrev || form.imageUrl} alt="Preview"
                          onError={e=>{e.target.src=PLACEHOLDER}}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2"><p className="text-3xl">🖼️</p><p className="text-xs text-gray-400 mt-1">No image</p></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-body font-semibold text-sm text-gray-700 mb-2">Upload from your device</p>
                      <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost text-sm">📁 Choose Image</button>
                      <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or WebP · Max 5 MB</p>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
                      {imgFile && <p className="text-xs text-forest-600 mt-1.5 font-body">✓ {imgFile.name}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Or paste an image URL</label>
                    <input type="url" value={form.imageUrl}
                      onChange={e => { setForm(f=>({...f,imageUrl:e.target.value})); setImgPrev(e.target.value); setImgFile(null) }}
                      placeholder="https://…" className="input-field" />
                  </div>
                  {imgSuggestions.length > 0 && (
                    <div>
                      <p className="text-xs font-body font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Quick pick for {form.category}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {imgSuggestions.map(s => (
                          <button key={s.label} type="button"
                            onClick={() => { setForm(f=>({...f,imageUrl:s.url})); setImgPrev(s.url); setImgFile(null) }}
                            className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all
                              ${form.imageUrl===s.url ? 'border-harvest-500 shadow-md' : 'border-transparent hover:border-harvest-300'}`}>
                            <img src={s.url} alt={s.label} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="submit" disabled={saving}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  {saving
                    ? <span className="w-4 h-4 border-2 border-forest-800 border-t-transparent rounded-full animate-spin" />
                    : editing ? '💾 Update Product' : '🌾 List Product'}
                </button>
                <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up text-center">
            <p className="text-4xl mb-3">🗑️</p>
            <h3 className="font-display font-bold text-lg text-gray-800 mb-2">Delete Product?</h3>
            <p className="font-body text-sm text-gray-500 mb-5">This will permanently remove the product from the marketplace.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1">Delete</button>
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
