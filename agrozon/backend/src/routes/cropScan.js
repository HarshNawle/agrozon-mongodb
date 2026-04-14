// backend/src/routes/cropScan.js
// POST /api/crop-scan — Analyse a crop/soil image for diseases using Claude vision.
// Accepts: multipart/form-data with field `image` (JPG/PNG/WebP, max 5 MB)

const router = require('express').Router()
const multer = require('multer')
const Anthropic = require('@anthropic-ai/sdk')
const { protect } = require('../middleware/auth')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (ok.includes(file.mimetype)) return cb(null, true)
    cb(new Error('Only JPG, PNG, WebP or GIF images are allowed'))
  },
})

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' })
  }

  const base64Image = req.file.buffer.toString('base64')
  const mediaType   = req.file.mimetype

  const SYSTEM_PROMPT = `You are an expert agricultural scientist, plant pathologist, and soil health specialist with deep knowledge of Indian farming conditions.

Analyse the provided image — it may show a crop/plant, soil, or both. Return ONLY a valid JSON object with NO markdown, NO extra text, NO explanation outside the JSON.

JSON schema (use exactly these keys):
{
  "scanType": "crop" | "soil" | "both",

  "crop": {
    "detected": boolean,
    "plantIdentified": string,
    "isHealthy": boolean,
    "disease": string | null,
    "diseasePercentage": number,        // 0-100: % of plant visibly affected
    "healthScore": number,              // 0-100: overall plant health (100 = perfect)
    "severity": "none" | "mild" | "moderate" | "severe",
    "confidence": "low" | "medium" | "high",
    "description": string,
    "symptoms": string[],
    "treatment": string[],
    "prevention": string[],
    "organicRemedies": string[],
    "urgency": "none" | "monitor" | "act_soon" | "urgent"
  } | null,

  "soil": {
    "detected": boolean,
    "soilType": string,                 // e.g. "Black cotton soil", "Red laterite", "Sandy loam"
    "isHealthy": boolean,
    "issue": string | null,             // e.g. "Nitrogen deficiency", "Waterlogging", "Saline soil"
    "issuePercentage": number,          // 0-100: how severely affected (0 = healthy)
    "healthScore": number,              // 0-100: soil health (100 = ideal)
    "phEstimate": string,               // e.g. "6.5–7.0 (neutral)" or "Unknown"
    "severity": "none" | "mild" | "moderate" | "severe",
    "confidence": "low" | "medium" | "high",
    "description": string,
    "symptoms": string[],
    "amendments": string[],             // corrective soil treatments
    "prevention": string[],
    "organicRemedies": string[],
    "urgency": "none" | "monitor" | "act_soon" | "urgent"
  } | null,

  "overallHealthScore": number,         // 0-100 composite score
  "summary": string                     // 1-2 sentence plain-English summary
}

Rules:
- diseasePercentage / issuePercentage: 0 means no problem, 100 means completely destroyed/failed.
- healthScore: inverse — 100 means perfect health, 0 means critical.
- If neither crop nor soil is detectable, set scanType to "crop", set crop.detected = false, soil = null, and explain in crop.description.
- Be specific to Indian agro-climatic zones where possible.
- All arrays must have at least one entry if the condition is non-healthy, otherwise empty array [].`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text: 'Analyse this image for crop health and soil health. Return the JSON report.',
            },
          ],
        },
      ],
    })

    const raw   = response.content[0]?.text ?? ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    res.json(result)
  } catch (err) {
    console.error('Crop scan error:', err.message)
    if (err instanceof SyntaxError) {
      return res.status(500).json({ message: 'Failed to parse AI response. Please try again.' })
    }
    res.status(500).json({ message: err.message || 'Crop scan failed' })
  }
})

router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image must be under 5 MB' })
  }
  res.status(400).json({ message: err.message })
})

module.exports = router