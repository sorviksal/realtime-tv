// src/Pages/TVDisplay.jsx
import { useEffect, useState } from 'react'
import { startSignalR, getMediaList } from '../Services/mediaService'

const BASE_URL = 'https://localhost:7084'

export default function TVDisplay() {
  const [currentMedia, setCurrentMedia] = useState(null)
  const [connected, setConnected] = useState(false)

  // Load latest media on mount
  useEffect(() => {
    const loadLatest = async () => {
      try {
        const list = await getMediaList()
        if (list && list.length > 0) {
          setCurrentMedia(list[0]) // API returns OrderByDescending so [0] is latest
        }
      } catch (err) {
        console.error('Failed to load media list:', err)
      }
    }
    loadLatest()
  }, [])

  // Connect SignalR and listen for new media
  useEffect(() => {
    let conn

    const connect = async () => {
      try {
        conn = await startSignalR()

        conn.on('ReceiveMedia', (media) => {
          console.log('New media received:', media)
          setCurrentMedia(media)
        })

        setConnected(true)
      } catch (err) {
        console.error('SignalR connection failed:', err)
        setConnected(false)
      }
    }

    connect()

    return () => {
      if (conn) conn.off('ReceiveMedia')
    }
  }, [])

  const mediaUrl = currentMedia ? `${BASE_URL}${currentMedia.fileUrl}` : null
  const isVideo = currentMedia?.fileType === 'video'

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden' }}>

      {/* ── Media Display ── */}
      {mediaUrl ? (
        isVideo ? (
          <video
            key={mediaUrl}         // key forces re-render when new video arrives
            src={mediaUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <img
            key={mediaUrl}
            src={mediaUrl}
            alt="TV Display"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', height: '100%', color: '#444', fontSize: '1.2rem',
          fontFamily: 'sans-serif', letterSpacing: '0.05em'
        }}>
          Waiting for content...
        </div>
      )}

      {/* ── File name label (optional) ── */}
      {currentMedia?.fileName && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(0,0,0,0.55)', color: '#fff',
          padding: '0.75rem 2rem', fontSize: '1rem',
          textAlign: 'center', fontFamily: 'sans-serif'
        }}>
          {currentMedia.fileName}
        </div>
      )}

      {/* ── Live indicator ── */}
      <div style={{
        position: 'absolute', top: 12, right: 16,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: '0.7rem', color: connected ? '#4ade80' : '#f87171',
        fontFamily: 'sans-serif'
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? '#4ade80' : '#f87171',
          display: 'inline-block'
        }} />
        {connected ? 'Live' : 'Disconnected'}
      </div>

    </div>
  )
}