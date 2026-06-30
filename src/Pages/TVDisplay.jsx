// src/Pages/ImageHistory.jsx
import { useEffect, useState } from 'react'
import { getMediaList, pushToTV, BASE_URL } from '../Services/mediaService'
import { Trash2, ImageIcon, Film, RefreshCw, AlertCircle, CheckCircle2, X, Tv, Eye, FileStack  } from 'lucide-react'

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
  const [viewingId, setViewingId]   = useState(null) // id currently shown in the iframe modal
  const [status, setStatus]         = useState(null) // { type, message }
  const [filter, setFilter]         = useState('all') // 'all' | 'image' | 'video'

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

  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return
    try {
      setDeletingId(id)
      await deleteMedia(id)
      setMediaList(prev => prev.filter(m => m.id !== id))
      setStatus({ type: 'success', message: `"${fileName}" deleted successfully.` })
    } catch {
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
          <h1 className="text-lg font-bold text-slate-800">Media History</h1>
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
            className={`fixed top-5 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold
              transition-all duration-300 min-w-[280px] max-w-sm w-[calc(100%-2rem)] sm:w-auto
              ${status.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'}`}
          >
            {status.type === 'success'
              ? <CheckCircle2 size={15} className="shrink-0" />
              : <AlertCircle size={15} className="shrink-0" />
            }
            <span className="flex-1">{status.message}</span>
            <button
              onClick={() => setStatus(null)}
              className="ml-1 hover:opacity-70 transition-opacity"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total Files',
              value: mediaList.length,
              icon: FileStack ,
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
                      onClick={() => setViewingId(media.id)}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye size={11} />
                      View
                    </button>
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
                      onClick={() => handleDelete(media.id, media.fileName)}
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

      {/* ── TV Preview Modal (iframe) ── */}
      {viewingId !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setViewingId(null)}
        >
          <div
            className="bg-slate-900 rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
                <Tv size={14} />
                TV Preview · #{viewingId}
              </div>
              <button
                onClick={() => setViewingId(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Iframe showing /tv/{id} */}
            <div className="aspect-video bg-black">
              <iframe
                key={viewingId}
                src={`/tv/${viewingId}`}
                title={`TV Screen preview for media ${viewingId}`}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}