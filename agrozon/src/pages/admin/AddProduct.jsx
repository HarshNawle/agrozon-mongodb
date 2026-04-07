import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { Upload, Leaf, Loader2, AlertCircle } from 'lucide-react'

import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const CATEGORIES = ['fruits', 'vegetables', 'grains', 'dairy']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function AddProduct() {
  const navigate = useNavigate()
  const { token, role, refreshFromStorage } = useAuthStore()

  const schema = useMemo(() => z.object({
    name: z.string().trim().min(1, 'Product name is required'),
    price: z.coerce.number().refine(n => Number.isFinite(n), 'Price is required').nonnegative('Price must be >= 0'),
    description: z.string().trim().optional().default(''),
    category: z.enum(CATEGORIES, { required_error: 'Category is required' }),
    stock: z.coerce.number().refine(n => Number.isFinite(n), 'Stock is required').int().nonnegative('Stock must be >= 0'),
    image: z.instanceof(File, { message: 'Image is required' })
      .refine(f => f.size <= MAX_IMAGE_BYTES, 'Image must be under 5 MB')
      .refine(f => ALLOWED_IMAGE_MIME.includes(f.type), 'Only JPG, PNG, WebP and GIF images are allowed'),
  }), [])

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'vegetables',
    stock: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imgPreviewUrl, setImgPreviewUrl] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    refreshFromStorage()
  }, [refreshFromStorage])

  useEffect(() => {
    if (token && role && role !== 'admin') navigate('/', { replace: true })
  }, [role, token, navigate])

  useEffect(() => {
    return () => {
      if (imgPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imgPreviewUrl)
    }
  }, [imgPreviewUrl])

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setErrors(prev => ({ ...prev, image: undefined }))
    setImgPreviewUrl(URL.createObjectURL(file))
  }

  function resetForm() {
    setForm({ name: '', price: '', description: '', category: 'vegetables', stock: '' })
    setImageFile(null)
    setErrors({})
    if (imgPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(imgPreviewUrl)
    setImgPreviewUrl('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})

    try {
      const valuesToValidate = {
        ...form,
        image: imageFile,
      }

      const parsed = schema.safeParse(valuesToValidate)
      if (!parsed.success) {
        const fieldErrors = {}
        parsed.error.issues.forEach(issue => {
          const key = issue.path[0]
          fieldErrors[key] = issue.message
        })
        setErrors(fieldErrors)
        return
      }

      const fd = new FormData()
      fd.append('name', parsed.data.name)
      fd.append('price', String(parsed.data.price))
      fd.append('description', parsed.data.description || '')
      fd.append('category', parsed.data.category)
      fd.append('stock', String(parsed.data.stock))
      fd.append('image', parsed.data.image)

      const headers = { 'Content-Type': 'multipart/form-data' }
      if (token) headers.Authorization = `Bearer ${token}`

      await api.post('/products', fd, { headers })

      toast.success('Product added successfully ✅')
      resetForm()
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-800">Add Product</h1>
        <p className="font-body text-sm text-gray-400 mt-0.5">Create a new agricultural listing.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
            {imgPreviewUrl ? (
              <img
                src={imgPreviewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="flex justify-center">
                  <Leaf className="w-6 h-6 text-forest-700" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Preview</p>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm font-body font-semibold text-gray-700">
              <Upload className="w-4 h-4 text-forest-700" />
              Image upload
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                         file:rounded-xl file:border-0
                         file:text-sm file:font-body
                         file:bg-forest-600 file:text-white
                         hover:file:bg-forest-700"
            />
            {errors.image && (
              <div className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.image}
              </div>
            )}
            <p className="text-xs text-gray-400">JPG/PNG/WebP/GIF · Max 5 MB</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-body font-semibold text-gray-700">Product Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Organic Alphonso Mangoes"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-body font-semibold text-gray-700">Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="input-field"
              min="0"
              step="0.01"
              placeholder="0"
            />
            {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-body font-semibold text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            className="input-field resize-none"
            placeholder="Tell buyers about the product…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-body font-semibold text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-field"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-body font-semibold text-gray-700">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              className="input-field"
              min="0"
              placeholder="0"
            />
            {errors.stock && <p className="text-xs text-red-600">{errors.stock}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>💾 Save</span>
            )}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

