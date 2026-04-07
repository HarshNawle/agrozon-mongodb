// src/components/LanguageSwitcher.jsx
// Dropdown that changes the active i18next language.
// The selection is saved to localStorage automatically by i18next-browser-languagedetector.

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                   text-white text-sm font-body font-medium transition-colors"
        aria-label="Change language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:block">{current.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
             fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-forest-100
                        z-50 overflow-hidden animate-slide-up">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-body
                          hover:bg-forest-50 transition-colors text-left
                          ${i18n.language === lang.code ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-gray-700'}`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
