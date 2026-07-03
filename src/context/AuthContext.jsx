import { createContext, useContext, useState, useEffect } from 'react'
import { BASE_URL } from '../Services/mediaService'

const AuthContext = createContext(null)

const TOKEN_KEY = 'ads2026_token'
const USER_KEY = 'ads2026_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem(TOKEN_KEY)
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token)
    } else {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(USER_KEY)
    }
  }, [user])

  const login = async (username, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Login failed')
      }

      const data = await res.json()
      setToken(data.token)
      setUser({ username: data.username, role: data.role })
      return data
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Registration failed')
      }

      return await res.json()
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
