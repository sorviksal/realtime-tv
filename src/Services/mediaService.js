// src/Services/mediaService.js
import * as signalR from '@microsoft/signalr'

const BASE_URL = 'https://localhost:7084'

// ─── SignalR Connection (singleton) ───────────────────────────────────────────
let connection = null

export const getSignalRConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/mediaHub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()
  }
  return connection
}

export const startSignalR = async () => {
  const conn = getSignalRConnection()
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start()
    console.log('SignalR connected.')
  }
  return conn
}

// ─── GET all media ────────────────────────────────────────────────────────────
export const getMediaList = async () => {
  const response = await fetch(`${BASE_URL}/api/Media`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

// ─── GET media filtered by type (image | video) ───────────────────────────────
export const getMediaByType = async (fileType) => {
  const response = await fetch(`${BASE_URL}/api/Media/type/${fileType}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${fileType} media: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

// ─── Push a specific media item to one or more named TVs, or all ──────────────
export const pushToTV = async (id, { screens = [], all = true } = {}) => {
  const response = await fetch(`${BASE_URL}/api/Media/${id}/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ screens, all }),
  })

  if (!response.ok) {
    throw new Error(`Failed to push media #${id} to TV: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}
// ─── POST upload image ──
// Sends the file + optional metadata (caption, duration, screen) to the API.
// The API should handle broadcasting via SignalR on the backend.
export const uploadMedia = async (file, caption = '', duration = 10, screen = 'all') => {
  const formData = new FormData()
  formData.append('file', file)

  // Optional metadata — only append if your API supports these fields
  if (caption) formData.append('caption', caption)
  if (duration) formData.append('duration', duration)
  if (screen) formData.append('screen', screen)

  const response = await fetch(`${BASE_URL}/api/Media/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Upload failed: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}