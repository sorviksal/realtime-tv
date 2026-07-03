import { useState, useRef } from 'react'
import { Upload, ImageIcon, Clock, Monitor, X, Trash2, CheckCircle2, AlertCircle, Loader2, Pencil, Type, AlignLeft } from 'lucide-react'
import { uploadMedia } from '../Services/mediaService'

export default function UploadImage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(10)
  const [screen, setScreen] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [fileName, setFileName] = useState('')
  const [fileExt, setFileExt] = useState('')
  const inputRef = useRef()

  const MAX_SIZE = 100 * 1024 * 1024 * 1024
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

  const isVideo = (f) => f?.type.startsWith('video/')

  const handleFile = (f) => {
    if (!f) return
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setUploadStatus({ type: 'error', message: 'Unsupported file type.' })
      return
    }
    if (f.size > MAX_SIZE) {
      setUploadStatus({ type: 'error', message: 'File exceeds 100GB limit.' })
      return
    }
    setUploadStatus(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    const lastDot = f.name.lastIndexOf('.')
    const baseName = lastDot > 0 ? f.name.slice(0, lastDot) : f.name
    const ext = lastDot > 0 ? f.name.slice(lastDot) : ''
    setFileName(baseName)
    setFileExt(ext)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleRemove = () => {
    setFile(null)
    setPreview(null)
    setFileName('')
    setFileExt('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleReset = () => {
    handleRemove()
    setUploadStatus(null)
    setTitle('')
    setDescription('')
    setDuration(10)
    setScreen('all')
  }

  const formatSize = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + ' MB'

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setUploadStatus(null)

      const trimmedName = fileName.trim()
      const finalName = trimmedName ? `${trimmedName}${fileExt}` : file.name
      const renamedFile = new File([file], finalName, { type: file.type })

      const result = await uploadMedia(renamedFile, title, duration, screen, description)

      setUploadStatus({ type: 'success', message: `${isVideo(file) ? 'Video' : 'Image'} uploaded successfully!` })
      handleReset()
      setTimeout(() => setUploadStatus(null), 3000)
    } catch (error) {
      setUploadStatus({ type: 'error', message: error.message || 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  const statusIcon = (type) => {
    if (type === 'success') return <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} />
    return <X size={18} className="text-white" strokeWidth={2.5} />
  }

  const statusBg = (type) => type === 'success' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-rose-500'
  const iconBg = (type) => type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
  const statusTitle = (type) => type === 'success' ? 'Success' : type === 'danger' ? 'Deleted' : 'Error'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Upload New Media</h1>
          <p className="text-xs text-slate-400">Upload media to display on TV in real-time.</p>
        </div>
      </header>

      {uploadStatus && (
        <div className={`fixed top-5 right-5 z-50 flex items-stretch bg-white rounded-2xl shadow-xl overflow-hidden min-w-[320px] max-w-sm ${statusBg(uploadStatus.type)}`}>
          <div className="flex items-start gap-3.5 px-5 py-4 flex-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconBg(uploadStatus.type)}`}>
              {statusIcon(uploadStatus.type)}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-bold text-slate-800 mb-0.5">{statusTitle(uploadStatus.type)}</p>
              <p className="text-sm text-slate-500 leading-snug">{uploadStatus.message}</p>
            </div>
            <button onClick={() => setUploadStatus(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"><X size={16} /></button>
          </div>
        </div>
      )}

      <main className="p-8 max-w-3xl mx-auto">
        <div className={`w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-5 mb-8 ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,video/quicktime" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4"><Upload size={28} className="text-indigo-500" /></div>
          <p className="text-base font-bold text-slate-700 mb-1">Drop an image or video here</p>
          <p className="text-sm text-slate-400 mb-5">or</p>
          <button onClick={(e) => { e.stopPropagation(); inputRef.current.click() }} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer">Choose File</button>
          <p className="text-xs text-slate-400 mt-4">JPG, PNG, WEBP, GIF, MP4, WEBM, MOV (Max 100GB)</p>
        </div>

        {file && preview && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-800">{isVideo(file) ? 'Video Preview' : 'Image Preview'}</h2>
            <div className="flex items-start gap-5">
              {isVideo(file)
                ? <video src={preview} controls className="w-48 h-32 object-cover rounded-xl border border-slate-200 shrink-0" />
                : <img src={preview} alt="preview" className="w-48 h-32 object-cover rounded-xl border border-slate-200 shrink-0" />
              }
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-3">{formatSize(file.size)} &middot; {file.type}</p>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">File Name</label>
                <div className="relative mb-4">
                  <Pencil size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Enter file name..." className="w-full pl-8 pr-16 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">{fileExt}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mb-4"><CheckCircle2 size={14} className="text-emerald-500" /> Ready to upload</div>
                <button onClick={handleRemove} className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"><Trash2 size={13} /> Remove</button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"><Type size={13} /> Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Welcome Message" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5"><AlignLeft size={13} /> Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={handleReset} disabled={uploading} className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Reset</button>
          <button onClick={handleUpload} disabled={!file || uploading} className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer">
            {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : <><Upload size={15} /> Upload</>}
          </button>
        </div>
      </main>
    </div>
  )
}
