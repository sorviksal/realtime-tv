import { useLocation, useNavigate } from 'react-router-dom'
import { Upload, Monitor, Settings, LogOut, User, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/aeu.png'

const NAV = [
  { label: 'TV Display',  icon: Monitor, path: '/' },
  { label: 'Upload Media', icon: Upload, path: '/display' },
  { label: 'Settings',     icon: Settings, path: '/settings' },
  { label: 'Register', icon: UserPlus, path: '/register', admin: true },
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNav = (path) => {
    navigate(path)
    onClose?.()
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#f0f0f8] border-r border-slate-200
        transition-transform duration-300 lg:static lg:translate-x-0 lg:shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-indigo-200 flex items-center justify-center shrink-0">
            <img src={logo} alt='aeu university'/>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 leading-tight truncate">AEU LiveScreen System</p>
            <p className="text-[11px] text-slate-400 leading-tight truncate">Real-Time Web Application</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, icon: Icon, path, admin }) => {
            if (admin && user?.role !== 'admin') return null
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
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

        {/* User info & logout */}
        <div className="border-t border-slate-200 p-3 space-y-1 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
            <User size={16} />
            <span className="truncate">{user?.username || 'Guest'}</span>
            {user?.role === 'admin' && <span className="text-[10px] font-bold uppercase text-indigo-500 ml-auto">Admin</span>}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium text-slate-500 hover:bg-white hover:text-red-600 cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

      </aside>
    </>
  )
}
