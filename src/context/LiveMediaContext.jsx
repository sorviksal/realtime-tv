import { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'ads2026_live_by_screen'
const LiveMediaContext = createContext(null)

export function LiveMediaProvider({ children }) {
  const [liveByScreen, setLiveByScreen] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(liveByScreen))
  }, [liveByScreen])

  return (
    <LiveMediaContext.Provider value={{ liveByScreen, setLiveByScreen }}>
      {children}
    </LiveMediaContext.Provider>
  )
}

export function useLiveMedia() {
  const ctx = useContext(LiveMediaContext)
  if (!ctx) throw new Error('useLiveMedia must be used inside <LiveMediaProvider>')
  return ctx
}