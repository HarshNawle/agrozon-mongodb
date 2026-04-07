// src/i18n/index.js
// Configures react-i18next with English, Hindi, and Marathi.
// The selected language is persisted to localStorage.

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import hi from './locales/hi.json'
import mr from './locales/mr.json'

i18n
  .use(LanguageDetector)        // auto-detect browser language
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    fallbackLng: 'en',
    // LanguageDetector will read from localStorage key 'i18nextLng'
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,   // React already handles XSS
    },
  })

export default i18n

// Supported language list used by the LanguageSwitcher component
export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी',  flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी',  flag: '🌾' },
]
