// src/Pages/UploadImage.jsx
import { useState, useRef } from 'react'
import { Upload, X, Trash2, CheckCircle2, AlertCircle, Loader2, Pencil } from 'lucide-react'
import { uploadMedia } from '../Services/mediaService'

export default function UploadImage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [caption, setCaption] = useState('')
  const [duration, setDuration] = useState(10)
  const [screen, setScreen] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // { type: 'success' | 'error', message: string }
  const [fileName, setFileName] = useState('')       // editable name (without extension)
  const [fileExt, setFileExt] = useState('')          // locked extension, e.g. ".png"
  const inputRef = useRef()

  const MAX_SIZE = 100 * 1024 * 1024 * 1024 // 100GB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']

  const isVideo = (f) => f?.type.startsWith('video/')

  const handleFile = (f) => {
    if (!f) return
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setUploadStatus({ type: 'error', message: 'Unsupported file type. Please upload JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV.' })
      return
    }
    if (f.size > MAX_SIZE) {
      setUploadStatus({ type: 'error', message: 'File size exceeds 100GB limit.' })
      return
    }
    setUploadStatus(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))

    // Split name and extension so the extension can't be edited away
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
    handleRemove() // clears file, preview, fileName, fileExt
    setUploadStatus(null)
    setCaption('')
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

      const result = await uploadMedia(renamedFile, caption, duration, screen)

      setUploadStatus({ type: 'success', message: `${isVideo(file) ? 'Video' : 'Image'} uploaded and sent to TV successfully!` })
      handleReset()
      console.log('Upload result:', result)
      setTimeout(() => setUploadStatus(null), 3000)
    } catch (error) {
      setUploadStatus({ type: 'error', message: error.message || 'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Topbar ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-8 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Upload New Media</h1>
          <p className="text-xs text-slate-400">Upload a Media to display on TV in real-time.</p>
        </div>
      </header>

<<<<<<< HEAD
      <main className="p-4 sm:p-8 max-w-7xl mx-auto">

        {/* ── Status Banner ── */}
        {uploadStatus && (
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl mb-6 text-sm font-semibold
              ${uploadStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
          >
            {uploadStatus.type === 'success'
              ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              : <AlertCircle size={16} className="text-rose-500 shrink-0" />
            }
            {uploadStatus.message}
            <button
              onClick={() => setUploadStatus(null)}
              className="ml-auto text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

=======
      <main className="p-8 max-w-7xl mx-auto">
>>>>>>> main
        {/* ── Drop Zone ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          className={`w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center py-10 sm:py-16 px-4 mb-8
            ${dragging
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-300'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
            <Upload size={28} className="text-indigo-500" />
          </div>
          <p className="text-base font-bold text-slate-700 mb-1">Drop an image or video here</p>
          <p className="text-sm text-slate-400 mb-5">or</p>
          <button
            onClick={(e) => { e.stopPropagation(); inputRef.current.click() }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Choose File
          </button>
          <p className="text-xs text-slate-400 mt-4">JPG, PNG, WEBP, GIF, MP4, WEBM, MOV (Max 100GB)</p>
        </div>

        {/* ── Preview ── */}
        {file && preview && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4">
              {isVideo(file) ? 'Video Preview' : 'Image Preview'}
            </h2>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {isVideo(file) ? (
                <video
                  src={preview}
                  controls
                  className="w-full sm:w-48 h-48 sm:h-32 object-cover rounded-xl border border-slate-200 shrink-0"
                />
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full sm:w-48 h-48 sm:h-32 object-cover rounded-xl border border-slate-200 shrink-0"
                />
              )}
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">{formatSize(file.size)}</p>
                <p className="text-xs text-slate-400 mb-3">{file.type}</p>

                {/* Rename field */}
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  File Name
                </label>
                <div className="relative mb-4">
                  <Pencil size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter a file name..."
                    className="w-full pl-8 pr-16 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                    {fileExt}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mb-4">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  Ready to upload
                </div>
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={handleReset}
            disabled={uploading}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
          >
            {uploading
              ? <><Loader2 size={15} className="animate-spin" /> Uploading...</>
              : <><Upload size={15} /> Upload</>
            }
          </button>
        </div>

      </main>
    </div>
  )
}