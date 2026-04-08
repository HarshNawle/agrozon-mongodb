// src/pages/CropScanner.jsx
// AI-powered crop disease detection page.
// Upload a photo of your crop — Claude vision analyses it and returns a diagnosis.

import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'

const SEVERITY_CONFIG = {
  none:     { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'None',     dot: 'bg-green-500'  },
  mild:     { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Mild',     dot: 'bg-yellow-400' },
  moderate: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Moderate', dot: 'bg-orange-500' },
  severe:   { color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'Severe',   dot: 'bg-red-500'    },
}

const URGENCY_CONFIG = {
  none:      { label: 'No Action Needed', icon: '✅' },
  monitor:   { label: 'Keep Monitoring',  icon: '👀' },
  act_soon:  { label: 'Act Soon',         icon: '⚠️' },
  urgent:    { label: 'Urgent Action!',   icon: '🚨' },
}

const CONFIDENCE_LABEL = { low: '~50%', medium: '~75%', high: '~95%' }

export default function CropScanner() {
  const [preview,  setPreview]  = useState(null)
  const [file,     setFile]     = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result,   setResult]   = useState(null)
  const [drag,     setDrag]     = useState(false)
  const fileRef = useRef()

  function handleFile(f) {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    const ok = ['image/jpeg','image/png','image/webp','image/gif']
    if (!ok.includes(f.type)) { toast.error('Only JPG, PNG or WebP images are allowed'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }, [])

  async function handleScan() {
    if (!file) { toast.error('Please select a crop image first'); return }
    setScanning(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/crop-scan', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Scan failed. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  function resetAll() {
    setFile(null)
    setPreview(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const sev  = result ? (SEVERITY_CONFIG[result.severity] ?? SEVERITY_CONFIG.none) : null
  const urg  = result ? (URGENCY_CONFIG[result.urgency]   ?? URGENCY_CONFIG.none)  : null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-body text-gray-400 mb-3">
            <Link to="/" className="hover:text-forest-600">Home</Link>
            <span>/</span>
            <span className="text-gray-600">Crop Disease Scanner</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-forest-100 flex items-center justify-center text-3xl shrink-0">
              🔬
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-gray-800 leading-tight">
                AI Crop Disease Scanner
              </h1>
              <p className="font-body text-gray-500 mt-1 max-w-xl">
                Upload a photo of your crop and our AI will instantly identify diseases,
                suggest treatments, and provide organic remedies.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── Upload Panel ──────────────────────────────────── */}
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => !preview && fileRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all overflow-hidden
                ${drag ? 'border-forest-500 bg-forest-50 scale-[1.01]' : 'border-gray-200 bg-white hover:border-forest-300'}
                ${!preview ? 'cursor-pointer' : ''}`}
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Crop preview"
                    className="w-full h-72 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <button onClick={(e) => { e.stopPropagation(); resetAll() }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center
                               justify-center text-gray-600 hover:bg-white shadow text-sm font-bold">
                    ×
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white
                                  text-xs font-body px-2.5 py-1 rounded-full">
                    {file?.name}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-72 gap-3 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-forest-50 flex items-center justify-center text-3xl">
                    🌿
                  </div>
                  <div>
                    <p className="font-display font-semibold text-gray-700">Drop your crop photo here</p>
                    <p className="font-body text-sm text-gray-400 mt-1">or click to browse · JPG, PNG, WebP · Max 5 MB</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs font-body bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">🍅 Tomato</span>
                    <span className="text-xs font-body bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">🌾 Wheat</span>
                    <span className="text-xs font-body bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">🥦 Any Crop</span>
                  </div>
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={e => handleFile(e.target.files?.[0])} />

            <div className="flex gap-3">
              <button onClick={() => fileRef.current?.click()}
                className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm">
                📁 Choose File
              </button>
              <button onClick={handleScan} disabled={!file || scanning}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                {scanning
                  ? <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analysing…
                    </>
                  : '🔬 Scan Crop'}
              </button>
            </div>

            {/* Tips */}
            <div className="card bg-harvest-50 border border-harvest-100 p-4">
              <p className="font-body font-semibold text-harvest-800 text-sm mb-2">📸 Tips for better results</p>
              <ul className="space-y-1 text-xs font-body text-harvest-700">
                <li>• Take a close-up of the affected leaf or stem</li>
                <li>• Use natural daylight — avoid flash</li>
                <li>• Include both healthy and affected parts in frame</li>
                <li>• Keep the image in focus and well-lit</li>
              </ul>
            </div>
          </div>

          {/* ── Results Panel ─────────────────────────────────── */}
          <div>
            {/* Loading skeleton */}
            {scanning && (
              <div className="card animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <p className="text-center text-sm font-body text-forest-600 animate-pulse mt-2">
                  🤖 AI is analysing your crop…
                </p>
              </div>
            )}

            {/* Empty state */}
            {!scanning && !result && (
              <div className="card flex flex-col items-center justify-center text-center py-20 gap-4 border-dashed">
                <span className="text-6xl">🌱</span>
                <p className="font-display font-semibold text-gray-400 text-lg">
                  Awaiting your crop photo
                </p>
                <p className="font-body text-sm text-gray-400 max-w-xs">
                  Upload an image and tap "Scan Crop" to get an instant AI diagnosis.
                </p>
              </div>
            )}

            {/* Result card */}
            {result && !scanning && (
              <div className="space-y-4 animate-fade-in">
                {/* Status banner */}
                <div className={`rounded-2xl border p-5 ${sev.bg} ${sev.border}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{result.isHealthy ? '✅' : '🦠'}</span>
                        <h2 className={`font-display font-bold text-xl ${sev.color}`}>
                          {result.isHealthy ? 'Healthy Plant' : (result.disease ?? 'Disease Detected')}
                        </h2>
                      </div>
                      <p className="font-body text-sm text-gray-600 leading-relaxed">{result.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`badge border ${sev.border} ${sev.color} ${sev.bg} flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
                      Severity: {sev.label}
                    </span>
                    <span className="badge border border-gray-200 bg-white text-gray-600">
                      🌿 {result.plantIdentified ?? 'Unknown plant'}
                    </span>
                    <span className="badge border border-gray-200 bg-white text-gray-600">
                      🎯 Confidence: {CONFIDENCE_LABEL[result.confidence] ?? result.confidence}
                    </span>
                    {urg && (
                      <span className="badge border border-gray-200 bg-white text-gray-700">
                        {urg.icon} {urg.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Symptoms */}
                {result.symptoms?.length > 0 && (
                  <div className="card">
                    <h3 className="font-display font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-sm">⚠️</span>
                      Visible Symptoms
                    </h3>
                    <ul className="space-y-1.5">
                      {result.symptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-body text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatment */}
                {result.treatment?.length > 0 && (
                  <div className="card">
                    <h3 className="font-display font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-sm">💊</span>
                      Recommended Treatment
                    </h3>
                    <ol className="space-y-2">
                      {result.treatment.map((t, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm font-body text-gray-700">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center
                                           text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Organic Remedies */}
                {result.organicRemedies?.length > 0 && (
                  <div className="card border border-green-100 bg-green-50">
                    <h3 className="font-display font-bold text-green-800 mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 bg-green-200 rounded-lg flex items-center justify-center text-sm">🌱</span>
                      Organic Remedies
                    </h3>
                    <ul className="space-y-1.5">
                      {result.organicRemedies.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-body text-green-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prevention */}
                {result.prevention?.length > 0 && (
                  <div className="card">
                    <h3 className="font-display font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 bg-harvest-100 rounded-lg flex items-center justify-center text-sm">🛡️</span>
                      Prevention Tips
                    </h3>
                    <ul className="space-y-1.5">
                      {result.prevention.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm font-body text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-harvest-400 mt-2 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button onClick={resetAll} className="btn-ghost w-full text-sm">
                  🔄 Scan Another Crop
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
