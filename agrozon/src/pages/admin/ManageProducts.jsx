// src/pages/admin/ManageProducts.jsx — Admin full product CRUD
import { useEffect, useState, useRef } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['vegetables','fruits','grains','dairy','spices','other']
const UNITS = ['kg','gram (100g)','litre','ml (200ml)','piece','dozen','bunch','packet','bag (5kg)','box','bottle','crate']
const PLACEHOLDER = 'https://placehold.co/80x80/e8f5e9/1a5c38?text=🌿'
const EMPTY = { name:'', description:'', price:'', category:'vegetables', subCategory:'', stock:'', unit:'kg', imageUrl:'', farmLocation:'', farmerName:'', isOrganic:false, isFeatured:false }

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(EMPTY)
  const [editing,  setEditing]  = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [imgFile,  setImgFile]  = useState(null)
  const [imgPrev,  setImgPrev]  = useState('')
  const [search,   setSearch]   = useState('')
  const fileRef = useRef()

  async function load() {
    setLoading(true)
    try { const { data } = await api.get('/products', { params:{ limit:200 } }); setProducts(data.products ?? []) }
    catch { setProducts([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function openAdd() { setForm(EMPTY); setEditing(null); setImgFile(null); setImgPrev(''); setModal(true) }
  function openEdit(p) {
    setForm({ name:p.name, description:p.description, price:String(p.price), category:p.category,
              subCategory:p.subCategory||'', stock:String(p.stock), unit:p.unit||'kg',
              imageUrl:p.imageUrl||'', farmLocation:p.farmLocation||'', farmerName:p.farmerName||'',
              isOrganic:p.isOrganic||false, isFeatured:p.isFeatured||false })
    setEditing(p._id); setImgFile(null); setImgPrev(p.imageUrl||''); setModal(true)
  }

  function handleImgChange(e) {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5*1024*1024) { toast.error('Image must be under 5 MB'); return }
    setImgFile(file); setImgPrev(URL.createObjectURL(file)); setForm(f=>({...f,imageUrl:''}))
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true)
    try {
      let imageUrl = form.imageUrl
      if (imgFile) {
        const fd = new FormData(); fd.append('image', imgFile)
        const { data } = await api.post('/upload/product-image', fd, { headers:{'Content-Type':'multipart/form-data'} })
        imageUrl = data.url
      }
      const payload = { ...form, price:parseFloat(form.price), stock:parseInt(form.stock,10), imageUrl }
      if (editing) { await api.put(`/products/${editing}`, payload); toast.success('Updated!') }
      else         { await api.post('/products', payload);           toast.success('Created!') }
      setModal(false); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    try { await api.delete(`/products/${id}`); toast.success('Deleted!'); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-800">Manage Products</h1>
          <p className="font-body text-sm text-gray-400 mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">+ Add Product</button>
      </div>
      <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Search products…" className="input-field max-w-xs" />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-forest-500 border-t-transparent rounded-full animate-spin" />
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
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">No products found.</td></tr>
                )}
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl||PLACEHOLDER} alt={p.name}
                          onError={e=>{e.target.src=PLACEHOLDER}}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.farmerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell capitalize text-gray-600">{p.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-forest-700">₹{p.price}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className={`font-semibold ${p.stock===0?'text-red-500':'text-gray-700'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs btn-ghost !py-1 !px-3">✏️ Edit</button>
                        <button onClick={() => handleDelete(p._id)}
                          className="px-3 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold">
                          🗑️ Delete
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

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-gray-800">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={()=>setModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">×</button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* Image preview + upload */}
              <div className="flex items-center gap-4">
                <img src={imgPrev||form.imageUrl||PLACEHOLDER} onError={e=>{e.target.src=PLACEHOLDER}}
                  alt="Preview" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                <div>
                  <button type="button" onClick={()=>fileRef.current?.click()} className="btn-ghost text-sm">Upload Image</button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
                </div>
              </div>
              <input type="url" value={form.imageUrl}
                onChange={e=>{setForm(f=>({...f,imageUrl:e.target.value}));setImgPrev(e.target.value)}}
                placeholder="Or paste image URL…" className="input-field text-xs" />

              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} className="input-field" min="0" step="0.01" required />
                </div>
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Stock *</label>
                  <input type="number" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} className="input-field" min="0" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="input-field">
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Unit</label>
                  <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} className="input-field">
                    {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-1">Farmer Name</label>
                <input type="text" value={form.farmerName} onChange={e=>setForm(f=>({...f,farmerName:e.target.value}))} className="input-field" placeholder="Raju Patil" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isOrganic} onChange={e=>setForm(f=>({...f,isOrganic:e.target.checked}))} className="w-4 h-4 accent-forest-600" />
                  <span className="text-sm font-body text-gray-700">🌱 Organic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(f=>({...f,isFeatured:e.target.checked}))} className="w-4 h-4 accent-harvest-500" />
                  <span className="text-sm font-body text-gray-700">⭐ Featured</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '💾'}
                  Save
                </button>
                <button type="button" onClick={()=>setModal(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
