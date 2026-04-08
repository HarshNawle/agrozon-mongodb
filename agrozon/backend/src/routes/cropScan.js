// backend/src/routes/cropScan.js
// POST /api/crop-scan — Analyse a crop image for diseases using Claude vision.
// Accepts: multipart/form-data with field `image` (JPG/PNG/WebP, max 5 MB)
// Returns: { disease, severity, description, treatment, prevention, isHealthy }

const router = require('express').Router()
const multer = require('multer')
const Anthropic = require('@anthropic-ai/sdk')

const { protect } = require('../middleware/auth')

// ── Multer: memory storage (we don't save the file, just forward it) ────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (ok.includes(file.mimetype)) return cb(null, true)
    cb(new Error('Only JPG, PNG, WebP or GIF images are allowed'))
  },
})

// ── Anthropic client ─────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── POST /api/crop-scan ──────────────────────────────────────────────────────
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' })
  }

  const base64Image = req.file.buffer.toString('base64')
  const mediaType   = req.file.mimetype // e.g. 'image/jpeg'

  const SYSTEM_PROMPT = `You are an expert agricultural scientist and plant pathologist specializing in Indian crops.
Analyse the provided crop/plant image and return ONLY a valid JSON object — no markdown, no extra text.

JSON schema:
{
  "isHealthy": boolean,
  "plantIdentified": string,          // e.g. "Tomato", "Wheat", "Unknown"
  "disease": string | null,           // null when healthy
  "severity": "none" | "mild" | "moderate" | "severe",
  "confidence": "low" | "medium" | "high",
  "description": string,              // 2-3 sentences explaining what you see
  "symptoms": string[],               // bullet-point list of visible symptoms (empty if healthy)
  "treatment": string[],              // actionable treatment steps (empty if healthy)
  "prevention": string[],             // preventive tips going forward
  "organicRemedies": string[],        // organic / home remedies if applicable
  "urgency": "none" | "monitor" | "act_soon" | "urgent"
}

Be concise, practical, and specific to Indian farming conditions. If the image is not a plant or crop, set isHealthy to false, disease to "Not a plant image", and explain in description.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
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
              text: 'Analyse this crop/plant image and return the JSON report.',
            },
          ],
        },
      ],
    })

    const raw = response.content[0]?.text ?? ''
    // Strip possible markdown fences
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

// ── Multer error handler ─────────────────────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image must be under 5 MB' })
  }
  res.status(400).json({ message: err.message })
})

module.exports = router
