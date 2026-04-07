import { create } from 'zustand'

// Minimal auth state access backed by localStorage.
// Main auth flow still lives in `AuthContext`; this store is only used where the
// UI explicitly needs token/role via Zustand.
function getInitialAuth() {
  try {
    const token = localStorage.getItem('agrozon_token') || ''
    const userRaw = localStorage.getItem('agrozon_user')
    const user = userRaw ? JSON.parse(userRaw) : null
    return { token, role: user?.role || 'user' }
  } catch {
    return { token: '', role: 'user' }
  }
}

const initial = getInitialAuth()

const useAuthStore = create((set) => ({
  token: initial.token,
  role: initial.role,
  refreshFromStorage: () => {
    try {
      const token = localStorage.getItem('agrozon_token') || ''
      const userRaw = localStorage.getItem('agrozon_user')
      const user = userRaw ? JSON.parse(userRaw) : null
      set({ token, role: user?.role || 'user' })
    } catch {
      set({ token: '', role: 'user' })
    }
  },
}))

export default useAuthStore

