import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'

import { BASE_URL } from '../Services/mediaService'

const mediaUrl = (fileUrl) => `${BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`

const getMediaById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Media/${id}`, {
    method: 'GET',
    headers: { accept: '*/*' },
  })
  if (!res.ok) throw new Error(`Media #${id} not found (${res.status})`)
  return await res.json()
}

export default function TVScreenById() {
  const { id } = useParams()

  const [media, setMedia]     = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await getMediaById(id)
      setMedia(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  // Initial load
  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  useEffect(() => {
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  const isVideo = media?.fileType === 'video'

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Content ── */}
      {media && !error ? (
        isVideo ? (
          <video
            key={mediaUrl(media.fileUrl)}
            src={mediaUrl(media.fileUrl)}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <img
            key={mediaUrl(media.fileUrl)}
            src={mediaUrl(media.fileUrl)}
            alt={media.fileName}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )
      ) : loading ? (
        <div style={screenStateStyle}>
          <span style={{ fontSize: '0.85rem', letterSpacing: '0.05em', color: '#555' }}>
            LOADING…
          </span>
        </div>
      ) : (
        <div style={screenStateStyle}>
          <span style={{ fontSize: '0.85rem', letterSpacing: '0.05em', color: '#F87171' }}>
            {error || `Media #${id} not found`}
          </span>
        </div>
      )}
    </div>
  )
}

const screenStateStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
}