import { useEffect, useState } from 'react'
import { getMediaList, pushToTV } from '../Services/mediaService'
import { Trash2, ImageIcon, Film, RefreshCw, AlertCircle, CheckCircle2, X, Tv, FileStack, AlertTriangle, MapPin, Layers, Check } from 'lucide-react'
import { useLiveMedia } from '../context/LiveMediaContext'
import { useScreenPresence } from '../hooks/useScreenPresence'
const BASE_URL = 'https://localhost:7084'

const deleteMedia = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Media/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
}

const getTVs = async () => {
  const res = await fetch(`${BASE_URL}/api/TV`)
  if (!res.ok) throw new Error('Failed to load TVs')
  return res.json()
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}


export default function ImageHistory() {
  const [mediaList, setMediaList]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [pushingId, setPushingId]   = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [status, setStatus]         = useState(null)
  const [filter, setFilter]         = useState('all')

  // ── TV picker modal state ──
  const [pushTarget, setPushTarget] = useState(null)   // { id, fileName } media being pushed
  const [tvs, setTvs]               = useState([])
  const [tvsLoading, setTvsLoading] = useState(false)
  const [tvsError, setTvsError]     = useState(null)
  const [selectedNames, setSelectedNames] = useState([]) // TV names checked
  const [pushAll, setPushAll]       = useState(false)
  const { liveByScreen, setLiveByScreen } = useLiveMedia()
  const isLive = (mediaId) => Object.values(liveByScreen).includes(mediaId)

  // Clear LIVE status the moment a TV's connection drops (tab/kiosk closed)
  useScreenPresence((screenName) => {
    setLiveByScreen(prev => {
      if (!(screenName in prev)) return prev
      const next = { ...prev }
      delete next[screenName]
      return next
    })
  })
  const loadMedia = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMediaList()
      setMediaList(data)
    } catch (err) {
      setError('Failed to load media history. Make sure the API is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMedia() }, [])

  // Opens the TV picker instead of pushing immediately
  const openPushPicker = async (id, fileName) => {
    setPushTarget({ id, fileName })
    setSelectedNames([])
    setPushAll(false)
    try {
      setTvsLoading(true)
      setTvsError(null)
      setTvs(await getTVs())
    } catch (err) {
      setTvsError(err.message)
    } finally {
      setTvsLoading(false)
    }
  }

  const closePushPicker = () => {
    setPushTarget(null)
    setTvs([])
    setSelectedNames([])
    setPushAll(false)
  }

  const toggleTv = (name) => {
    setPushAll(false)
    setSelectedNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const toggleAll = () => {
    setPushAll(prev => {
      const next = !prev
      if (next) setSelectedNames([])
      return next
    })
  }

 const confirmPush = async () => {
  if (!pushTarget) return
  const { id, fileName } = pushTarget

  if (!pushAll && selectedNames.length === 0) {
    setStatus({ type: 'error', message: 'Select at least one TV, or choose "All Screens".' })
    setTimeout(() => setStatus(null), 3000)
    return
  }

  try {
    setPushingId(id)
    closePushPicker()
    await pushToTV(id, { screens: selectedNames, all: pushAll })

    // Update session-only live tracking
    setLiveByScreen(prev => {
      if (pushAll) {
        // Mark this media live on every known TV
        const next = {}
        tvs.forEach(tv => { next[tv.name] = id })
        return next
      }
      // Mark this media live only on the selected TVs (leaves other TVs' state untouched)
      const next = { ...prev }
      selectedNames.forEach(name => { next[name] = id })
      return next
    })

    const target = pushAll ? 'all TVs' : `${selectedNames.length} TV${selectedNames.length > 1 ? 's' : ''}`
    setStatus({ type: 'success', message: `"${fileName}" sent to ${target}.` })
  } catch (err) {
    setStatus({ type: 'error', message: 'Failed to send to TV. Please try again.' })
  } finally {
    setPushingId(null)
    setTimeout(() => setStatus(null), 3000)
  }
}

  const requestDelete = (id, fileName) => {
    setConfirmTarget({ id, fileName })
  }

  const confirmDelete = async () => {
    if (!confirmTarget) return
    const { id, fileName } = confirmTarget
    setConfirmTarget(null)

    try {
      setDeletingId(id)
      await deleteMedia(id)
      setMediaList(prev => prev.filter(m => m.id !== id))
      setStatus({ type: 'danger', message: `"${fileName}" deleted successfully.` })
    } catch (err) {
      setStatus({ type: 'error', message: 'Delete failed. Please try again.' })
    } finally {
      setDeletingId(null)
      setTimeout(() => setStatus(null), 3000)
    }
  }

  const filtered = filter === 'all' ? mediaList : mediaList.filter(m => m.fileType === filter)
  const imageCount = mediaList.filter(m => m.fileType === 'image').length
  const videoCount = mediaList.filter(m => m.fileType === 'video').length

  // Group TVs: Floor -> Room -> [TVs]
  const groupedTvs = tvs.reduce((acc, tv) => {
    acc[tv.floor] ??= {}
    acc[tv.floor][tv.room] ??= []
    acc[tv.floor][tv.room].push(tv)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Topbar ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-800">TV Display</h1>
          <p className="text-xs text-slate-400">All files uploaded and sent to TV screens.</p>
        </div>
        <button
          onClick={loadMedia}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto">

        {/* ── Toast Notification ── */}
        {status && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-stretch bg-white rounded-2xl shadow-xl overflow-hidden
              transition-all duration-300 min-w-[320px] max-w-sm
              ${status.type === 'success' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-rose-500'}`}
          >
            <div className="flex items-start gap-3.5 px-5 py-4 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.6
                  ${status.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}
              >
                {status.type === 'success'
                  ? <CheckCircle2 size={19} className="text-white" strokeWidth={2.5} />
                  : <X size={19} className="text-white" strokeWidth={2.5} />
                }
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-bold text-slate-800 mb-0.5">
                  {status.type === 'success' ? 'Success' : status.type === 'danger' ? 'Deleted' : 'Error'}
                </p>
                <p className="text-sm text-slate-500 leading-snug">
                  {status.message}
                </p>
              </div>
              <button
                onClick={() => setStatus(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Files', value: mediaList.length, icon: FileStack, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', valueColor: 'text-indigo-600', ring: 'hover:border-indigo-200' },
            { label: 'Images', value: imageCount, icon: ImageIcon, iconBg: 'bg-sky-50', iconColor: 'text-sky-600', valueColor: 'text-sky-600', ring: 'hover:border-sky-200' },
            { label: 'Videos', value: videoCount, icon: Film, iconBg: 'bg-violet-50', iconColor: 'text-violet-600', valueColor: 'text-violet-600', ring: 'hover:border-violet-200' },
          ].map(({ label, value, icon: Icon, iconBg, iconColor, valueColor, ring }) => (
            <div key={label} className={`bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 transition-colors ${ring}`}>
              <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={24} className={iconColor} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold mb-0.5">{label}</p>
                <p className={`text-3xl font-bold leading-none ${valueColor}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 mb-6">
          {['all', 'image', 'video'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors cursor-pointer
                ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {f === 'all' ? 'All Files' : f === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
            <RefreshCw size={18} className="animate-spin mr-2" /> Loading media...
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl text-sm font-semibold">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ImageIcon size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">No media found</p>
            <p className="text-xs mt-1">Upload an image or video to see it here.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((media) => (
              <div key={media.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative w-full h-44 bg-slate-100">
              {media.fileType === 'video' ? (
                <video src={`${BASE_URL}${media.fileUrl}`} className="w-full h-full object-cover" muted preload="metadata" />
              ) : (
                <img src={`${BASE_URL}${media.fileUrl}`} alt={media.fileName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
              )}
              <span className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg
                ${media.fileType === 'video' ? 'bg-violet-600 text-white' : 'bg-sky-500 text-white'}`}
              >
                {media.fileType === 'video' ? <><Film size={11} /> VIDEO</> : <><ImageIcon size={11} /> IMAGE</>}
              </span>

              {/* LIVE badge — only rendered when this media is currently showing on a TV */}
              {isLive(media.id) && (
                <span className="absolute top-2 right-2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-rose-600 text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-800 truncate mb-1" title={media.fileName}>
                    {media.fileName}
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    {formatDate(media.createdAt)}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPushPicker(media.id, media.fileName)}
                      disabled={pushingId === media.id}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 py-1.5 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {pushingId === media.id ? <RefreshCw size={11} className="animate-spin" /> : <Tv size={11} />}
                      {pushingId === media.id ? 'Sending...' : 'Show on TV'}
                    </button>
                    <button
                      onClick={() => requestDelete(media.id, media.fileName)}
                      disabled={deletingId === media.id}
                      className="flex items-center gap-1 text-xs font-semibold text-rose-500 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {deletingId === media.id ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── TV Picker Modal ── */}
      {pushTarget && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-6"
          onClick={closePushPicker}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <p className="text-sm font-bold text-slate-800">Send to TV</p>
                <p className="text-xs text-slate-400 truncate max-w-[280px]">"{pushTarget.fileName}"</p>
              </div>
              <button onClick={closePushPicker} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* All Screens option */}
              <button
                onClick={toggleAll}
                className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl border mb-4 text-sm font-semibold transition-colors cursor-pointer
                  ${pushAll ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
                  ${pushAll ? 'bg-white border-white' : 'border-slate-300'}`}>
                  {pushAll && <Check size={13} className="text-indigo-600" strokeWidth={3} />}
                </div>
                All Screens
              </button>

              {tvsLoading ? (
                <p className="text-sm text-slate-400">Loading TVs...</p>
              ) : tvsError ? (
                <p className="text-sm text-rose-500">{tvsError}</p>
              ) : tvs.length === 0 ? (
                <p className="text-sm text-slate-400">No TVs configured. Add some in Settings first.</p>
              ) : (
                Object.entries(groupedTvs).map(([floor, rooms]) => (
                  <div key={floor} className="mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Layers size={12} /> Floor {floor}
                    </h3>
                    {Object.entries(rooms).map(([room, roomTvs]) => (
                      <div key={room} className="mb-2">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                          <MapPin size={11} /> {room}
                        </p>
                        <div className="space-y-1.5">
                          {roomTvs.map(tv => {
                            const checked = pushAll || selectedNames.includes(tv.name)
                            return (
                              <button
                                key={tv.id}
                                onClick={() => toggleTv(tv.name)}
                                disabled={!tv.enabled || pushAll}
                                className={`w-full flex items-center gap-3 text-left px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors cursor-pointer
                                  ${checked
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                    : tv.enabled
                                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                      : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'}
                                  ${pushAll ? 'opacity-50' : ''}`}
                              >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
                                  ${checked ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                  {checked && <Check size={13} className="text-white" strokeWidth={3} />}
                                </div>
                                <Tv size={15} className={checked ? 'text-indigo-500' : 'text-slate-400'} />
                                {tv.name}
                                {!tv.enabled && <span className="ml-auto text-[10px] font-bold uppercase text-slate-300">Disabled</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
              <button
                onClick={closePushPicker}
                className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmPush}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <Tv size={14} /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-6"
          onClick={() => setConfirmTarget(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative px-8 py-9" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setConfirmTarget(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <X size={18} />
            </button>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-[3px] border-rose-500 flex items-center justify-center">
                <AlertTriangle size={28} className="text-rose-500" strokeWidth={2.2} />
              </div>
            </div>
            <p className="text-center text-slate-500 text-base leading-snug mb-7">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-700">"{confirmTarget.fileName}"</span>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={confirmDelete} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer">
                Yes, I'm sure
              </button>
              <button onClick={() => setConfirmTarget(null)} className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer">
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}