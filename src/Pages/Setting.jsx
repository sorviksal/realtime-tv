import { useState, useEffect } from 'react'
import { Tv, Plus, Trash2, ToggleLeft, ToggleRight, CheckCircle2, X, Copy, ExternalLink, MapPin, Layers } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL

const api = {
  list: async () => {
    const res = await fetch(`${BASE_URL}/api/TV`)
    if (!res.ok) throw new Error('Failed to load TVs')
    return res.json()
  },
  create: async (body) => {
    const res = await fetch(`${BASE_URL}/api/TV`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to add TV')
    return data
  },
  update: async (id, body) => {
    const res = await fetch(`${BASE_URL}/api/TV/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('Failed to update TV')
    return res.json()
  },
  toggle: async (id) => {
    const res = await fetch(`${BASE_URL}/api/TV/${id}/toggle`, { method: 'PATCH' })
    if (!res.ok) throw new Error('Failed to toggle TV')
    return res.json()
  },
  remove: async (id) => {
    const res = await fetch(`${BASE_URL}/api/TV/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to remove TV')
  },
}

// NOTE: TvKioskController currently reads ?screen={name}. Since names can repeat
// across floors/rooms, this is ambiguous — consider switching the controller to
// accept ?screen={id} instead. Kept as name here to match your current controller.
const tvUrl = (name) => `${BASE_URL}/tv?screen=${encodeURIComponent(name)}`

export default function Setting() {
  const [screens, setScreens] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newRoom, setNewRoom] = useState('')
  const [newFloor, setNewFloor] = useState('')
  const [status, setStatus] = useState(null)
  const [copied, setCopied] = useState(null)

  const showToast = (type, message) => {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 3000)
  }

  const loadScreens = async () => {
    try {
      setLoading(true)
      setScreens(await api.list())
    } catch {
      showToast('error', 'Failed to load TVs. Make sure the API is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadScreens() }, [])

  const handleAdd = async () => {
    const name = newName.trim()
    const room = newRoom.trim()
    const floor = newFloor.trim()
    if (!name) return showToast('error', 'Please enter a TV name.')
    if (!room) return showToast('error', 'Please enter a room.')
    if (!floor) return showToast('error', 'Please enter a floor.')

    try {
      const created = await api.create({ name, room, floor })
      setScreens(prev => [...prev, created])
      setNewName(''); setNewRoom(''); setNewFloor('')
      showToast('success', `"${name}" added to ${room}, Floor ${floor}.`)
    } catch (err) {
      showToast('error', err.message)
    }
  }

  const handleRemove = async (id, name) => {
    try {
      await api.remove(id)
      setScreens(prev => prev.filter(s => s.id !== id))
      showToast('danger', `"${name}" removed.`)
    } catch {
      showToast('error', 'Failed to remove TV.')
    }
  }

  const handleToggle = async (id) => {
    try {
      const updated = await api.toggle(id)
      setScreens(prev => prev.map(s => s.id === id ? updated : s))
    } catch {
      showToast('error', 'Failed to toggle TV.')
    }
  }

  const handleLocalEdit = (id, field, value) => {
    setScreens(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleFieldCommit = async (id, field, value) => {
    try {
      const updated = await api.update(id, { [field]: value })
      setScreens(prev => prev.map(s => s.id === id ? updated : s))
    } catch {
      showToast('error', 'Failed to update TV.')
      loadScreens()
    }
  }

  const handleCopy = (id, name) => {
    navigator.clipboard.writeText(tvUrl(name))
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const grouped = screens.reduce((acc, tv) => {
    acc[tv.floor] ??= {}
    acc[tv.floor][tv.room] ??= []
    acc[tv.floor][tv.room].push(tv)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-800">TV Settings</h1>
          <p className="text-xs text-slate-400">Configure screens by floor and room — each TV gets its own URL.</p>
        </div>
      </header>

      {status && (
        <div className={`fixed top-5 right-5 z-50 flex items-stretch bg-white rounded-2xl shadow-xl overflow-hidden
          transition-all duration-300 min-w-[320px] max-w-sm
          ${status.type === 'success' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-rose-500'}`}
        >
          <div className="flex items-start gap-3.5 px-5 py-4 flex-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5
              ${status.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}
            >
              {status.type === 'success'
                ? <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
                : <X size={18} className="text-white" strokeWidth={2.5} />
              }
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-bold text-slate-800 mb-0.5">
                {status.type === 'success' ? 'Success' : status.type === 'danger' ? 'Removed' : 'Error'}
              </p>
              <p className="text-sm text-slate-500 leading-snug">{status.message}</p>
            </div>
            <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <main className="p-8 max-w-4xl mx-auto">

        {/* ── Add TV ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={15} className="text-indigo-500" />
            Add New TV Screen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Tv size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="TV name (e.g. TV3, Lobby)"
                className="w-full pl-8 pr-4 py-2.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={newRoom} onChange={(e) => setNewRoom(e.target.value)}
                placeholder="Room"
                className="w-full pl-8 pr-4 py-2.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>
            <div className="relative">
              <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" value={newFloor} onChange={(e) => setNewFloor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Floor"
                className="w-full pl-8 pr-4 py-2.5 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add TV
          </button>
        </div>

        {/* ── Grouped TV List ── */}
        {loading ? (
          <p className="text-sm text-slate-400">Loading TVs...</p>
        ) : screens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Tv size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">No TVs configured</p>
            <p className="text-xs mt-1">Add your first TV screen above.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([floor, rooms]) => (
            <div key={floor} className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Layers size={12} /> Floor {floor}
              </h3>
              {Object.entries(rooms).map(([room, tvs]) => (
                <div key={room} className="mb-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={11} /> {room}
                  </p>
                  <div className="space-y-2">
                    {tvs.map(tv => (
                      <div key={tv.id} className={`bg-white rounded-2xl border overflow-hidden transition-all
                        ${tv.enabled ? 'border-slate-200' : 'border-slate-100 opacity-55'}`}
                      >
                        <div className="flex items-center gap-4 px-6 py-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <Tv size={18} className="text-slate-500" />
                          </div>
                          <input
                            type="text"
                            value={tv.name}
                            onChange={(e) => handleLocalEdit(tv.id, 'name', e.target.value)}
                            onBlur={(e) => handleFieldCommit(tv.id, 'name', e.target.value)}
                            className="flex-1 text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none py-0.5 min-w-0"
                          />
                          <button onClick={() => handleToggle(tv.id)} className="shrink-0 cursor-pointer" title={tv.enabled ? 'Disable' : 'Enable'}>
                            {tv.enabled
                              ? <ToggleRight size={28} className="text-indigo-500" />
                              : <ToggleLeft size={28} className="text-slate-300" />}
                          </button>
                          <button onClick={() => handleRemove(tv.id, tv.name)} className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-2.5 bg-slate-50 border-t border-slate-100">
                          <code className="flex-1 text-xs text-slate-400 truncate font-mono">{tvUrl(tv.name)}</code>
                          <button onClick={() => handleCopy(tv.id, tv.name)} className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer shrink-0">
                            {copied === tv.id
                              ? <><CheckCircle2 size={12} className="text-emerald-500" /> Copied!</>
                              : <><Copy size={12} /> Copy URL</>}
                          </button>
                          <a href={tvUrl(tv.name)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors shrink-0">
                            <ExternalLink size={12} /> Open
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </main>
    </div>
  )
}