import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'

const HUB_URL = 'https://localhost:7084/mediaHub'

// screenName: TV name string (e.g. "STEM TV"), or null to only get "all" broadcasts
export function useMediaHub(screenName, onMediaPushed) {
  const connectionRef = useRef(null)
  const callbackRef = useRef(onMediaPushed)
  const currentGroupRef = useRef(null)
  callbackRef.current = onMediaPushed

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveMedia', (payload) => callbackRef.current?.(payload))

    connection.start().catch((err) => console.error('SignalR connection failed:', err))
    connection.onreconnected(() => {
      if (currentGroupRef.current) {
        connection.invoke('JoinScreen', currentGroupRef.current).catch(() => {})
      }
    })

    connectionRef.current = connection
    return () => { connection.stop() }
  }, [])

  useEffect(() => {
    const connection = connectionRef.current
    if (!connection) return

    const join = async () => {
      if (connection.state !== signalR.HubConnectionState.Connected) {
        await new Promise((resolve) => {
          const check = setInterval(() => {
            if (connection.state === signalR.HubConnectionState.Connected) {
              clearInterval(check)
              resolve()
            }
          }, 100)
        })
      }
      if (currentGroupRef.current && currentGroupRef.current !== screenName) {
        await connection.invoke('LeaveScreen', currentGroupRef.current).catch(() => {})
      }
      if (screenName) {
        await connection.invoke('JoinScreen', screenName).catch(() => {})
      }
      currentGroupRef.current = screenName
    }

    join()
  }, [screenName])

  return connectionRef
}