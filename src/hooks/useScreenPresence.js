import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'

const HUB_URL = `${import.meta.env.VITE_API_URL}/mediaHub`

export function useScreenPresence(onScreenOffline) {
  const callbackRef = useRef(onScreenOffline)
  callbackRef.current = onScreenOffline

  useEffect(() => {
    const token = sessionStorage.getItem('ads2026_token')
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        withCredentials: true,
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ScreenOffline', (screenName) => {
      callbackRef.current?.(screenName)
    })

    connection.start().catch((err) => console.error('SignalR presence connection failed:', err))

    return () => { connection.stop() }
  }, [])
}
