import * as signalR from '@microsoft/signalr'

export const BASE_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = sessionStorage.getItem('ads2026_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

let connection = null

export const getSignalRConnection = () => {
  if (!connection) {
    const token = sessionStorage.getItem('ads2026_token')
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/mediaHub`, {
        withCredentials: true,
        accessTokenFactory: () => token || '',
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

export const getMediaList = async () => {
  const response = await fetch(`${BASE_URL}/api/Media`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

export const getMediaByType = async (fileType) => {
  const response = await fetch(`${BASE_URL}/api/Media/type/${fileType}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${fileType} media: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

export const pushToTV = async (id, { screens = [], all = true } = {}) => {
  const response = await fetch(`${BASE_URL}/api/Media/${id}/push`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ screens, all }),
  })

  if (!response.ok) {
    throw new Error(`Failed to push media #${id} to TV: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

export const uploadMedia = async (file, title = '', duration = 10, screen = 'all', description = '') => {
  const formData = new FormData()
  formData.append('file', file)

  if (title) formData.append('title', title)
  if (description) formData.append('description', description)
  if (duration) formData.append('duration', duration)
  if (screen) formData.append('screen', screen)

  const response = await fetch(`${BASE_URL}/api/Media/upload`, {
    method: 'POST',
    body: formData,
    headers: authHeaders(),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Upload failed: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}
