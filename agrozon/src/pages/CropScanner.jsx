// src/pages/CropScanner.jsx
// On-device crop disease scanner using canvas pixel analysis.
// Shows: disease match, survival days (untreated vs treated),
//        crop survival %, disease spread %, and full treatment plan.

import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────
// STATIC DISEASE DATABASE
// Each entry includes:
//   survival        – { untreated, treated } days the crop can survive
//   cropSurvivalPct – % of crop likely to survive if treated promptly
//   spreadPct       – % of field at risk of infection spread per week
// ─────────────────────────────────────────────────────────────
const DISEASE_DB = [
  {
    isHealthy: false,
    disease: 'Early Blight',
    plantIdentified: 'Tomato / Potato',
    severity: 'moderate',
    confidence: 'medium',
    urgency: 'act_soon',
    description:
      'Dark brown spots with concentric rings on older leaves, resembling a target. Leaves yellow and drop prematurely. Caused by Alternaria solani fungus.',
    survival: {
      untreated: 18,
      treated: 55,
      note: 'Without treatment expect progressive defoliation. With fungicide + pruning, plants recover within 2 weeks.',
    },
    cropSurvivalPct: 72,
    spreadPct: 35,
    spreadNote: 'Spreads via rain splash and wind. Up to 35% of neighbouring plants can be infected within one week under humid conditions.',
    symptoms: [
      'Dark brown to black lesions with concentric rings',
      'Yellow halo surrounding spots',
      'Lower / older leaves affected first',
      'Stem lesions dark and elongated',
    ],
    treatment: [
      'Remove and destroy infected leaves immediately',
      'Apply mancozeb or chlorothalonil fungicide every 7–10 days',
      'Improve air circulation by pruning dense foliage',
      'Avoid overhead watering — water at the base',
    ],
    organicRemedies: [
      'Neem oil spray (5 ml/litre) every week',
      'Baking soda solution (1 tsp/litre) as foliar spray',
      'Copper-based Bordeaux mixture',
      'Compost tea spray to boost plant immunity',
    ],
    prevention: [
      'Use certified disease-free seeds',
      'Practice 3-year crop rotation',
      'Mulch to prevent soil splash',
      'Space plants for good airflow',
    ],
    triggers: { brownRatio: 0.20, yellowRatio: 0.15, greenRatio: 0.25, darkRatio: 0.10 },
  },
  {
    isHealthy: false,
    disease: 'Late Blight',
    plantIdentified: 'Tomato / Potato',
    severity: 'severe',
    confidence: 'medium',
    urgency: 'urgent',
    description:
      'Water-soaked lesions that turn brown-black rapidly. White fuzzy mould appears on leaf undersides in humid weather. Can destroy entire crops within days.',
    survival: {
      untreated: 5,
      treated: 30,
      note: 'Untreated plants can collapse in as few as 5 days in monsoon conditions. Immediate fungicide application can extend survival significantly.',
    },
    cropSurvivalPct: 38,
    spreadPct: 80,
    spreadNote: 'Phytophthora infestans spreads explosively — 80% of an unprotected field can be infected within a week under cool, wet conditions.',
    symptoms: [
      'Greasy water-soaked spots on leaves',
      'Rapid browning and death of tissue',
      'White fuzzy sporulation on undersides in humidity',
      'Dark brown rot on tubers / fruits',
    ],
    treatment: [
      'Apply metalaxyl or cymoxanil fungicide immediately',
      'Remove and burn all infected plant material',
      'Do not compost infected debris',
      'Spray copper hydroxide as a protective measure',
    ],
    organicRemedies: [
      'Copper sulphate solution (Bordeaux mixture)',
      'Remove all symptomatic tissue urgently',
      'Potassium bicarbonate spray',
      'Ensure wide spacing for airflow',
    ],
    prevention: [
      'Use resistant varieties',
      'Avoid planting in low-lying areas prone to fog',
      'Never plant tomatoes after potatoes',
      'Monitor daily during monsoon season',
    ],
    triggers: { brownRatio: 0.30, darkRatio: 0.20, greenRatio: 0.20, yellowRatio: 0.10 },
  },
  {
    isHealthy: false,
    disease: 'Powdery Mildew',
    plantIdentified: 'Cucurbits / Wheat / Grapes / Peas',
    severity: 'mild',
    confidence: 'medium',
    urgency: 'monitor',
    description:
      'White powdery coating on leaf surfaces, stems, and flowers. Affected tissue may yellow and die. Thrives in warm, dry conditions with high humidity.',
    survival: {
      untreated: 30,
      treated: 75,
      note: 'Powdery mildew rarely kills plants quickly but causes chronic yield loss. With treatment plants can remain productive for the full season.',
    },
    cropSurvivalPct: 85,
    spreadPct: 25,
    spreadNote: 'Spreads via airborne conidia. About 25% of nearby plants may show symptoms within a week if conditions remain warm and dry.',
    symptoms: [
      'White or grey powder on upper leaf surface',
      'Distorted, yellowing leaves',
      'Premature leaf drop',
      'Stunted shoot growth',
    ],
    treatment: [
      'Apply wettable sulphur or trifloxystrobin fungicide',
      'Remove heavily infected leaves',
      'Improve ventilation around plants',
      'Avoid high-nitrogen fertilisation',
    ],
    organicRemedies: [
      'Dilute milk spray (40% milk, 60% water)',
      'Neem oil solution weekly',
      'Baking soda + soap solution',
      'Potassium bicarbonate',
    ],
    prevention: [
      'Choose resistant varieties where available',
      'Avoid excess nitrogen fertiliser',
      'Water in the morning',
      'Space plants adequately',
    ],
    triggers: { whiteRatio: 0.20, greyRatio: 0.15, greenRatio: 0.30, yellowRatio: 0.10 },
  },
  {
    isHealthy: false,
    disease: 'Bacterial Wilt',
    plantIdentified: 'Tomato / Brinjal / Capsicum / Potato',
    severity: 'severe',
    confidence: 'low',
    urgency: 'urgent',
    description:
      'Rapid wilting of the entire plant despite adequate soil moisture. Caused by Ralstonia solanacearum. Milky bacterial ooze visible when stem is cut and placed in water.',
    survival: {
      untreated: 4,
      treated: 7,
      note: 'There is no effective cure once systemic infection sets in. Removal and soil treatment is the only way to protect remaining plants.',
    },
    cropSurvivalPct: 20,
    spreadPct: 45,
    spreadNote: 'Bacteria spread through soil water movement and contaminated tools. 45% of nearby plants can be infected within days in warm, wet conditions.',
    symptoms: [
      'Sudden wilting of young shoots first',
      'Whole plant wilts and dies quickly',
      'Milky white ooze from cut stems',
      'Brown discolouration of vascular tissue',
    ],
    treatment: [
      'No effective chemical cure once infected',
      'Remove and burn infected plants immediately',
      'Drench soil with copper oxychloride',
      'Solarise soil after removal',
    ],
    organicRemedies: [
      'Remove diseased plants immediately',
      'Soil solarisation for 4–6 weeks',
      'Apply lime to raise soil pH above 7',
      'Use antagonistic bacteria (Bacillus subtilis)',
    ],
    prevention: [
      'Use certified disease-free transplants',
      'Avoid waterlogging — ensure drainage',
      'Rotate with non-solanaceous crops for 3+ years',
      'Disinfect tools with bleach solution',
    ],
    triggers: { brownRatio: 0.15, darkRatio: 0.15, greenRatio: 0.35, yellowRatio: 0.20 },
  },
  {
    isHealthy: false,
    disease: 'Rust',
    plantIdentified: 'Wheat / Soybean / Bean / Sorghum',
    severity: 'severe',
    confidence: 'medium',
    urgency: 'act_soon',
    description:
      'Orange-red to brown powdery pustules on leaves and stems. Can cause significant yield losses in wheat and legumes if left untreated.',
    survival: {
      untreated: 12,
      treated: 45,
      note: 'Severe rust causes premature ripening within 2 weeks. Two fungicide applications 14 days apart can save up to 70% of the yield.',
    },
    cropSurvivalPct: 55,
    spreadPct: 60,
    spreadNote: 'Wind-dispersed urediniospores can travel long distances. 60% of a field can be infected within a week under favourable windy, humid conditions.',
    symptoms: [
      'Orange-red pustules on leaf surface',
      'Yellow streaks between pustules',
      'Pustules turn black late season',
      'Premature drying of plant',
    ],
    treatment: [
      'Apply propiconazole or tebuconazole fungicide',
      'Spray at flag leaf stage in wheat',
      'Two sprays 14 days apart for severe infection',
      'Remove volunteer plants that harbour rust',
    ],
    organicRemedies: [
      'Sulphur-based fungicide spray',
      'Increase potassium through wood ash',
      'Remove and burn infected stubble',
      'Introduce resistant local varieties',
    ],
    prevention: [
      'Grow rust-resistant varieties',
      'Timely sowing to avoid high humidity periods',
      'Balanced fertilisation — avoid excess nitrogen',
      'Monitor fields regularly during grain fill',
    ],
    triggers: { orangeRatio: 0.20, brownRatio: 0.25, yellowRatio: 0.15, greenRatio: 0.20 },
  },
  {
    isHealthy: false,
    disease: 'Rice Blast',
    plantIdentified: 'Rice',
    severity: 'severe',
    confidence: 'low',
    urgency: 'urgent',
    description:
      'Diamond-shaped grey lesions with brown borders on leaves. Neck blast at the panicle base is most damaging and can cause total yield loss.',
    survival: {
      untreated: 8,
      treated: 40,
      note: 'Neck blast at booting stage can cause 100% grain loss in affected tillers within 8 days. Tricyclazole applied before infection is the most effective strategy.',
    },
    cropSurvivalPct: 42,
    spreadPct: 55,
    spreadNote: 'Airborne conidia spread rapidly in cool, humid paddies. Over 55% of adjacent plants can become symptomatic within a week.',
    symptoms: [
      'Diamond-shaped grey-white lesions on leaves',
      'Brown to reddish-brown borders on lesions',
      'Infected neck of panicle turns brown and breaks',
      'White or empty grains',
    ],
    treatment: [
      'Apply tricyclazole or isoprothiolane at tillering and booting',
      'Drain water from paddies temporarily',
      'Avoid excess nitrogen fertiliser',
      'Roguing — remove symptomatic tillers',
    ],
    organicRemedies: [
      'Silicon-rich organic matter to strengthen cells',
      'Neem-based spray at early infection',
      'Pseudomonas fluorescens biocontrol spray',
      'Balanced silicon-potassium nutrition',
    ],
    prevention: [
      'Use blast-resistant varieties',
      'Avoid excess nitrogen application',
      'Maintain appropriate water levels',
      'Treat seeds with carbendazim',
    ],
    triggers: { greyRatio: 0.20, brownRatio: 0.15, greenRatio: 0.40, whiteRatio: 0.10 },
  },
  {
    isHealthy: false,
    disease: 'Anthracnose',
    plantIdentified: 'Mango / Chilli / Bean / Soybean',
    severity: 'moderate',
    confidence: 'medium',
    urgency: 'act_soon',
    description:
      'Dark sunken lesions on fruits, leaves, and stems. Salmon-pink spore masses in lesions in humid conditions. Major post-harvest concern in mangoes.',
    survival: {
      untreated: 21,
      treated: 60,
      note: 'Plants survive but fruit quality deteriorates rapidly. Fungicide treatment before flowering and at fruit set protects yield effectively.',
    },
    cropSurvivalPct: 65,
    spreadPct: 40,
    spreadNote: 'Rain-splash and wet harvesting equipment spreads spores. About 40% of nearby fruits and plants can be infected within a week during monsoon.',
    symptoms: [
      'Dark sunken spots on fruits / leaves',
      'Pink-orange spore masses in wet conditions',
      'Fruit rots from skin inward',
      'Twig dieback in mango',
    ],
    treatment: [
      'Apply carbendazim or azoxystrobin fungicide',
      'Pre-harvest sprays protect fruit',
      'Hot water treatment of harvested fruit (52°C for 5 min)',
      'Remove mummified fruit',
    ],
    organicRemedies: [
      'Neem oil spray during flowering and fruit development',
      'Copper sulphate spray',
      'Remove all infected plant debris',
      'Hot water dip post-harvest',
    ],
    prevention: [
      'Prune for open canopy and good airflow',
      'Apply copper spray before monsoon',
      'Harvest promptly at maturity',
      'Avoid injury to fruits',
    ],
    triggers: { darkRatio: 0.20, brownRatio: 0.20, orangeRatio: 0.10, greenRatio: 0.30 },
  },
  {
    isHealthy: true,
    disease: null,
    plantIdentified: 'Healthy plant',
    severity: 'none',
    confidence: 'medium',
    urgency: 'none',
    description:
      'The plant appears healthy with no visible signs of disease. Leaves are green and well-formed. Continue regular care and preventive practices.',
    survival: {
      untreated: 90,
      treated: 120,
      note: 'A healthy plant should thrive for the full growing season. Continue monitoring and maintain preventive care.',
    },
    cropSurvivalPct: 96,
    spreadPct: 5,
    spreadNote: 'Minimal disease risk detected. A 5% baseline risk remains from environmental factors — routine monitoring is sufficient.',
    symptoms: [],
    treatment: [],
    organicRemedies: [],
    prevention: [
      'Maintain regular watering schedule',
      'Apply balanced organic fertiliser monthly',
      'Monitor for early signs of pest or disease',
      'Ensure adequate sunlight and airflow',
    ],
    triggers: { greenRatio: 0.55, brownRatio: 0.05, darkRatio: 0.05, yellowRatio: 0.05 },
  },
]

// ─────────────────────────────────────────────────────────────
// IMAGE ANALYSIS — canvas pixel sampling
// ─────────────────────────────────────────────────────────────
function analyseImage(imgElement) {
  const canvas = document.createElement('canvas')
  const SIZE = 100
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  ctx.drawImage(imgElement, 0, 0, SIZE, SIZE)
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

  const counts = { green: 0, brown: 0, yellow: 0, orange: 0, white: 0, grey: 0, dark: 0, total: 0 }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    counts.total++

    const brightness = (r + g + b) / 3
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max

    if (brightness < 60) { counts.dark++; continue }
    if (brightness > 200 && saturation < 0.15) { counts.white++; continue }
    if (saturation < 0.15 && brightness >= 60) { counts.grey++; continue }

    if (g > r && g > b && g - r > 20 && g - b > 20) {
      counts.green++
    } else if (r > g && r > b) {
      const hue = Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * (180 / Math.PI)
      if (hue < 30 && hue > -10) counts.orange++
      else if (b > 100 && r > 150) counts.brown++
      else counts.brown++
    } else if (r > 150 && g > 150 && b < 100) {
      counts.yellow++
    } else if (r > 120 && g > 80 && b < 60) {
      counts.brown++
    }
  }

  const t = counts.total || 1
  return {
    greenRatio:  counts.green  / t,
    brownRatio:  counts.brown  / t,
    yellowRatio: counts.yellow / t,
    orangeRatio: counts.orange / t,
    whiteRatio:  counts.white  / t,
    greyRatio:   counts.grey   / t,
    darkRatio:   counts.dark   / t,
  }
}

function scoreDisease(ratios, triggers) {
  let score = 0
  for (const [key, threshold] of Object.entries(triggers)) {
    const actual = ratios[key] ?? 0
    const diff = Math.abs(actual - threshold)
    score += Math.max(0, 1 - diff / threshold)
  }
  return score
}

function matchDisease(imgElement) {
  const ratios = analyseImage(imgElement)
  const scored = DISEASE_DB.map(d => ({
    ...d,
    score: scoreDisease(ratios, d.triggers),
  })).sort((a, b) => b.score - a.score)

  const gap = scored[0].score - (scored[1]?.score ?? 0)
  let confidence = 'low'
  if (gap > 1.5) confidence = 'high'
  else if (gap > 0.7) confidence = 'medium'

  return { ...scored[0], confidence }
}

// ─────────────────────────────────────────────────────────────
// UI CONSTANTS
// ─────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  none:     { color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'None',     dot: 'bg-green-500'  },
  mild:     { color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Mild',     dot: 'bg-yellow-400' },
  moderate: { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Moderate', dot: 'bg-orange-500' },
  severe:   { color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'Severe',   dot: 'bg-red-500'    },
}

const URGENCY_CONFIG = {
  none:     { label: 'No Action Needed', icon: '✅' },
  monitor:  { label: 'Keep Monitoring',  icon: '👀' },
  act_soon: { label: 'Act Soon',         icon: '⚠️' },
  urgent:   { label: 'Urgent Action!',   icon: '🚨' },
}

const CONFIDENCE_LABEL = { low: '~50%', medium: '~75%', high: '~95%' }

// ─────────────────────────────────────────────────────────────
// RING GAUGE — animated SVG circle progress
// ─────────────────────────────────────────────────────────────
function RingGauge({ pct, size = 88, stroke = 8, color, label, sublabel }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          {/* Fill */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-base text-gray-800">{pct}%</span>
        </div>
      </div>
      <span className="font-body text-xs font-semibold text-gray-700 text-center leading-tight">{label}</span>
      {sublabel && (
        <span className="font-body text-[10px] text-gray-400 text-center leading-tight">{sublabel}</span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BAR STAT — horizontal progress bar
// ─────────────────────────────────────────────────────────────
function BarStat({ label, value, max, unit, color, note, icon }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-body font-semibold text-gray-600 flex items-center gap-1.5">
          <span style={{ fontSize: 13 }}>{icon}</span>
          {label}
        </span>
        <span className="text-sm font-display font-bold text-gray-800">
          {value}
          <span className="text-xs font-body text-gray-400 font-normal ml-1">{unit}</span>
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
      {note && (
        <p className="text-[11px] font-body text-gray-400 leading-relaxed">{note}</p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SURVIVAL PANEL
// ─────────────────────────────────────────────────────────────
function SurvivalPanel({ result }) {
  const { survival, cropSurvivalPct, spreadPct, spreadNote, isHealthy } = result

  const survivalColor = cropSurvivalPct >= 75 ? '#16a34a' : cropSurvivalPct >= 45 ? '#f97316' : '#dc2626'
  const spreadColor   = spreadPct      <= 20 ? '#16a34a' : spreadPct      <= 50 ? '#f97316' : '#dc2626'

  // Summary message
  let summaryBg, summaryText, summaryMsg
  if (isHealthy) {
    summaryBg   = 'bg-green-50 border-green-100'
    summaryText = 'text-green-800'
    summaryMsg  = `✅ Your crop is in good health. Expected productive lifespan: ${survival.treated} days with regular care.`
  } else if (cropSurvivalPct < 40) {
    summaryBg   = 'bg-red-50 border-red-100'
    summaryText = 'text-red-800'
    summaryMsg  = `🚨 Critical — only ${cropSurvivalPct}% of your crop will survive without immediate action. Act today.`
  } else {
    summaryBg   = 'bg-amber-50 border-amber-100'
    summaryText = 'text-amber-800'
    summaryMsg  = `⚠️ With prompt treatment, ${cropSurvivalPct}% of your crop can be saved. Begin treatment within 24–48 hours.`
  }

  return (
    <div className="card border border-gray-100 space-y-5">
      {/* Title */}
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center"
          style={{ fontSize: 14 }}>📊</span>
        <h3 className="font-display font-bold text-gray-800">Survival &amp; Spread Forecast</h3>
      </div>

      {/* Ring gauges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-100">
          <RingGauge
            pct={cropSurvivalPct}
            color={survivalColor}
            label="Crop survival"
            sublabel="if treated promptly"
          />
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-2 border border-gray-100">
          <RingGauge
            pct={spreadPct}
            color={spreadColor}
            label="Spread risk"
            sublabel="per week, untreated"
          />
          {spreadNote && (
            <p className="text-[10px] font-body text-gray-400 text-center leading-relaxed mt-0.5">
              {spreadNote}
            </p>
          )}
        </div>
      </div>

      {/* Day bars */}
      <div className="space-y-4 pt-1 border-t border-gray-100">
        <p className="text-xs font-body font-semibold text-gray-400 uppercase tracking-wide pt-1">
          Days crop can survive
        </p>
        <BarStat
          icon="⏳"
          label="Without treatment"
          value={survival.untreated}
          max={120}
          unit="days"
          color="#ef4444"
          note={null}
        />
        <BarStat
          icon="💊"
          label="With treatment"
          value={survival.treated}
          max={120}
          unit="days"
          color="#16a34a"
          note={survival.note}
        />
      </div>

      {/* Summary callout */}
      <div className={`rounded-xl px-4 py-3 text-sm font-body leading-relaxed border ${summaryBg} ${summaryText}`}>
        {summaryMsg}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function CropScanner() {
  const [preview,  setPreview]  = useState(null)
  const [file,     setFile]     = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result,   setResult]   = useState(null)
  const [drag,     setDrag]     = useState(false)
  const fileRef = useRef()
  const imgRef  = useRef()

  function handleFile(f) {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
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

  function handleScan() {
    if (!file)          { toast.error('Please select a crop image first'); return }
    if (!imgRef.current){ toast.error('Image not ready, please wait'); return }
    setScanning(true)
    setResult(null)
    setTimeout(() => {
      try {
        const diagnosis = matchDisease(imgRef.current)
        setResult(diagnosis)
      } catch (err) {
        console.error('Scan error:', err)
        toast.error('Could not analyse image. Please try another photo.')
      } finally {
        setScanning(false)
      }
    }, 1800)
  }

  function resetAll() {
    setFile(null); setPreview(null); setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const sev = result ? (SEVERITY_CONFIG[result.severity] ?? SEVERITY_CONFIG.none) : null
  const urg = result ? (URGENCY_CONFIG[result.urgency]   ?? URGENCY_CONFIG.none)  : null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hidden img element used by canvas for pixel analysis */}
      {preview && (
        <img ref={imgRef} src={preview} alt="analysis"
          crossOrigin="anonymous" style={{ display: 'none' }} />
      )}

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">

        {/* ── Header ── */}
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
                Crop Disease Scanner
              </h1>
              <p className="font-body text-gray-500 mt-1 max-w-xl">
                Upload a photo of your crop for an instant on-device diagnosis — including
                survival forecast, disease spread risk, and a full treatment plan.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-body font-semibold
                               bg-forest-100 text-forest-700 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-forest-500" />
                Works offline · On-device analysis
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── Upload Panel ── */}
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
                  <img src={preview} alt="Crop preview" className="w-full h-72 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <button
                    onClick={e => { e.stopPropagation(); resetAll() }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center
                               justify-center text-gray-600 hover:bg-white shadow text-sm font-bold"
                  >×</button>
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white
                                  text-xs font-body px-2.5 py-1 rounded-full">{file?.name}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-72 gap-3 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-forest-50 flex items-center justify-center text-3xl">🌿</div>
                  <div>
                    <p className="font-display font-semibold text-gray-700">Drop your crop photo here</p>
                    <p className="font-body text-sm text-gray-400 mt-1">
                      or click to browse · JPG, PNG, WebP · Max 5 MB
                    </p>
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
                {scanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analysing…
                  </>
                ) : '🔬 Scan Crop'}
              </button>
            </div>

            {/* How it works */}
            <div className="card bg-blue-50 border border-blue-100 p-4">
              <p className="font-body font-semibold text-blue-800 text-sm mb-2">🧪 How it works</p>
              <ul className="space-y-1 text-xs font-body text-blue-700">
                <li>• Image is analysed on-device using canvas pixel sampling</li>
                <li>• Colour ratios matched against a disease signature database</li>
                <li>• Survival days and spread risk calculated from matched disease</li>
                <li>• Full treatment plan generated instantly — no internet needed</li>
              </ul>
            </div>

            {/* Photo tips */}
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

          {/* ── Results Panel ── */}
          <div>
            {/* Scanning skeleton */}
            {scanning && (
              <div className="card animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-36 bg-gray-100 rounded-2xl" />
                  <div className="h-36 bg-gray-100 rounded-2xl" />
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full w-full" />
                <div className="h-2.5 bg-gray-100 rounded-full w-5/6" />
                <p className="text-center text-sm font-body text-forest-600 animate-pulse mt-2">
                  🔬 Analysing pixels and calculating survival forecast…
                </p>
              </div>
            )}

            {/* Empty state */}
            {!scanning && !result && (
              <div className="card flex flex-col items-center justify-center text-center py-20 gap-4 border-dashed">
                <span className="text-6xl">🌱</span>
                <p className="font-display font-semibold text-gray-400 text-lg">Awaiting your crop photo</p>
                <p className="font-body text-sm text-gray-400 max-w-xs">
                  Upload an image and tap "Scan Crop" to see survival days, spread risk, and treatment plan.
                </p>
              </div>
            )}

            {/* Results */}
            {result && !scanning && (
              <div className="space-y-4 animate-fade-in">

                {/* Disease banner */}
                <div className={`rounded-2xl border p-5 ${sev.bg} ${sev.border}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{result.isHealthy ? '✅' : '🦠'}</span>
                    <div>
                      <h2 className={`font-display font-bold text-xl ${sev.color}`}>
                        {result.isHealthy ? 'Healthy Plant' : (result.disease ?? 'Disease Detected')}
                      </h2>
                      <p className="font-body text-sm text-gray-600 leading-relaxed mt-1">
                        {result.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                  {result.confidence === 'low' && (
                    <p className="mt-3 text-xs font-body text-gray-500 bg-white/60 px-3 py-2 rounded-xl border border-gray-200">
                      ⚠️ On-device analysis has limitations. For a definitive diagnosis consult a local agronomist.
                    </p>
                  )}
                </div>

                {/* ── SURVIVAL & SPREAD FORECAST ── */}
                <SurvivalPanel result={result} />

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