// src/Pages/ImageHistory.jsx
import { useEffect, useState } from 'react'
<<<<<<< HEAD
import { getMediaList, pushToTV, BASE_URL } from '../Services/mediaService'
import { Trash2, ImageIcon, Film, RefreshCw, AlertCircle, CheckCircle2, X, Tv, Eye, FileStack  } from 'lucide-react'
=======
import { getMediaList, pushToTV } from '../Services/mediaService'
import { Trash2, ImageIcon, Film, RefreshCw, AlertCircle, CheckCircle2, X, Tv, Eye, FileStack, AlertTriangle } from 'lucide-react'
>>>>>>> main

const deleteMedia = async (id) => {
  const res = await fetch(`${BASE_URL}/api/Media/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
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
  const [viewingId, setViewingId]   = useState(null)   // id currently shown in the iframe modal
  const [confirmTarget, setConfirmTarget] = useState(null) // { id, fileName } pending delete confirmation
  const [status, setStatus]         = useState(null)   // { type, message }
  const [filter, setFilter]         = useState('all')  // 'all' | 'image' | 'video'

  const loadMedia = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMediaList()
      setMediaList(data)
    } catch {
      setError('Failed to load media history. Make sure the API is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMedia() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  const handlePushToTV = async (id, fileName) => {
    try {
      setPushingId(id)
      await pushToTV(id)
      setStatus({ type: 'success', message: `"${fileName}" is now showing on TV.` })
    } catch {
      setStatus({ type: 'error', message: 'Failed to send to TV. Please try again.' })
    } finally {
      setPushingId(null)
      setTimeout(() => setStatus(null), 3000)
    }
  }

  // Opens the custom confirmation modal instead of window.confirm()
  const requestDelete = (id, fileName) => {
    setConfirmTarget({ id, fileName })
  }

  // Runs only after the user clicks "Yes, I'm sure" in the modal
  const confirmDelete = async () => {
    if (!confirmTarget) return
    const { id, fileName } = confirmTarget
    setConfirmTarget(null)

    try {
      setDeletingId(id)
      await deleteMedia(id)
      setMediaList(prev => prev.filter(m => m.id !== id))
<<<<<<< HEAD
      setStatus({ type: 'success', message: `"${fileName}" deleted successfully.` })
    } catch {
=======
      setStatus({ type: 'danger', message: `"${fileName}" deleted successfully.` })
    } catch (err) {
>>>>>>> main
      setStatus({ type: 'error', message: 'Delete failed. Please try again.' })
    } finally {
      setDeletingId(null)
      setTimeout(() => setStatus(null), 3000)
    }
  }

  const filtered = filter === 'all' ? mediaList : mediaList.filter(m => m.fileType === filter)
  const imageCount = mediaList.filter(m => m.fileType === 'image').length
  const videoCount = mediaList.filter(m => m.fileType === 'video').length

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Topbar ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
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

      <main className="p-4 sm:p-8 max-w-7xl mx-auto">

        {/* ── Toast Notification ── */}
        {status && (
          <div
<<<<<<< HEAD
            className={`fixed top-5 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold
              transition-all duration-300 min-w-[280px] max-w-sm w-[calc(100%-2rem)] sm:w-auto
              ${status.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'}`}
=======
            className={`fixed top-5 right-5 z-50 flex items-stretch bg-white rounded-2xl shadow-xl overflow-hidden
              transition-all duration-300 min-w-[320px] max-w-sm
              ${status.type === 'success' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-rose-500'}`}
>>>>>>> main
          >
            <div className="flex items-start gap-3.5 px-5 py-4 flex-1">
              {/* Circular icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.6
                  ${status.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}
              >
                {status.type === 'success'
                  ? <CheckCircle2 size={19} className="text-white" strokeWidth={2.5} />
                  : <X size={19} className="text-white" strokeWidth={2.5} />
                }
              </div>

              {/* Title + subtitle */}
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-bold text-slate-800 mb-0.5">
                  {status.type === 'success' ? 'Success' : status.type === 'danger' ? 'Deleted' : 'Error'}
                </p>
                <p className="text-sm text-slate-500 leading-snug">
                  {status.message}
                </p>
              </div>

              {/* Close button */}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total Files',
              value: mediaList.length,
              icon: FileStack,
              iconBg: 'bg-indigo-50',
              iconColor: 'text-indigo-600',
              valueColor: 'text-indigo-600',
              ring: 'hover:border-indigo-200',
            },
            {
              label: 'Images',
              value: imageCount,
              icon: ImageIcon,
              iconBg: 'bg-sky-50',
              iconColor: 'text-sky-600',
              valueColor: 'text-sky-600',
              ring: 'hover:border-sky-200',
            },
            {
              label: 'Videos',
              value: videoCount,
              icon: Film,
              iconBg: 'bg-violet-50',
              iconColor: 'text-violet-600',
              valueColor: 'text-violet-600',
              ring: 'hover:border-violet-200',
            },
          ].map(({ label, value, icon: Icon, iconBg, iconColor, valueColor, ring }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 transition-colors ${ring}`}
            >
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
                ${filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {f === 'all' ? 'All Files' : f === 'image' ? 'Images' : 'Videos'}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
            <RefreshCw size={18} className="animate-spin mr-2" /> Loading media...
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl text-sm font-semibold">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ImageIcon size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-semibold">No media found</p>
            <p className="text-xs mt-1">Upload an image or video to see it here.</p>
          </div>
        )}

        {/* ── Media Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((media) => (
              <div
                key={media.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-44 bg-slate-100">
                  {media.fileType === 'video' ? (
                    <video
                      src={`${BASE_URL}${media.fileUrl}`}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={`${BASE_URL}${media.fileUrl}`}
                      alt={media.fileName}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}

                  {/* Type badge */}
                  <span className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg
                    ${media.fileType === 'video'
                      ? 'bg-violet-600 text-white'
                      : 'bg-sky-500 text-white'}`}
                  >
                    {media.fileType === 'video'
                      ? <><Film size={11} /> VIDEO</>
                      : <><ImageIcon size={11} /> IMAGE</>
                    }
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-800 truncate mb-1" title={media.fileName}>
                    {media.fileName}
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    {formatDate(media.createdAt)}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handlePushToTV(media.id, media.fileName)}
                      disabled={pushingId === media.id}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 py-1.5 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {pushingId === media.id
                        ? <RefreshCw size={11} className="animate-spin" />
                        : <Tv size={11} />
                      }
                      {pushingId === media.id ? 'Sending...' : 'Show on TV'}
                    </button>
                    <button
                      onClick={() => requestDelete(media.id, media.fileName)}
                      disabled={deletingId === media.id}
                      className="flex items-center gap-1 text-xs font-semibold text-rose-500 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {deletingId === media.id
                        ? <RefreshCw size={11} className="animate-spin" />
                        : <Trash2 size={11} />
                      }
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main> 

      {/* ── Delete Confirmation Modal ── */}
      {confirmTarget && (
        <div
<<<<<<< HEAD
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setViewingId(null)}
=======
          className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-6"
          onClick={() => setConfirmTarget(null)}
>>>>>>> main
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative px-8 py-9"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X */}
            <button
              onClick={() => setConfirmTarget(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Alert icon */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-[3px] border-rose-500 flex items-center justify-center">
                <AlertTriangle size={28} className="text-rose-500" strokeWidth={2.2} />
              </div>
            </div>

            {/* Message */}
            <p className="text-center text-slate-500 text-base leading-snug mb-7">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-700">"{confirmTarget.fileName}"</span>?
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={confirmDelete}
                className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Yes, I'm sure
              </button>
              <button
                onClick={() => setConfirmTarget(null)}
                className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}