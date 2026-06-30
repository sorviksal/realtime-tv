import { useLocation, useNavigate } from 'react-router-dom'
import { Upload, History, Monitor, Settings, ImageIcon, LogOut } from 'lucide-react'
import logo from '../assets/aeu.png'

const NAV = [
  { label: 'TV Display',  icon:Monitor ,   path: '/' },
  { label: 'Upload Media ',    icon: Upload,  path: '/display' },
  { label: 'Settings',      icon: Settings, path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#f0f0f8] border-r border-slate-200 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-indigo-200 flex items-center justify-center shrink-0">
          <img src={logo} alt='aeu university'/>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">Image to TV</p>
          <p className="text-[11px] text-slate-400 leading-tight">Real-Time Web Application</p>
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium cursor-pointer
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



    </aside>
  )
}