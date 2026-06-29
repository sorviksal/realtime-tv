import { useLocation, useNavigate } from 'react-router-dom'
import { Upload, History, Monitor, Settings, ImageIcon, LogOut } from 'lucide-react'

const NAV = [
  { label: 'Upload Image',  icon: Upload,   path: '/' },
  { label: 'Image History', icon: History,  path: '/history' },
  { label: 'TV Screens',    icon: Monitor,  path: '/screens' },
  { label: 'Settings',      icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#f0f0f8] border-r border-slate-200 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
          <ImageIcon size={18} color="#fff" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">Image to TV</p>
          <p className="text-[11px] text-slate-400 leading-tight">Client Upload</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium
                ${active
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-500 hover:bg-white hover:text-slate-700'
                }`}
            >
              <Icon size={18} className={active ? 'text-indigo-600' : 'text-slate-400'} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">Admin User</p>
            <p className="text-[11px] text-slate-400 truncate">admin@example.com</p>
          </div>
          <button
            title="Logout"
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} className="text-slate-400 hover:text-red-500" />
          </button>
        </div>
      </div>

    </aside>
  )
}