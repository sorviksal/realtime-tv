import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Components/sidebar'
import UploadImage from './Pages/uploardMedia'
import TVScreen from './Pages/TvScreen'
import TVScreenById from './Pages/TVDisplay'
import Login from './Pages/login'
import './index.css'

function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <Routes>
      {/* Full screen routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/tv/:id" element={<TVScreen />} />

      {/* Dashboard Layout */}
      <Route
        path="/*"
        element={
          <div className="flex h-screen overflow-hidden">
            <Sidebar
              isMobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 overflow-y-auto bg-slate-50">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="fixed top-4 left-4 z-30 lg:hidden bg-white border border-slate-200 rounded-xl p-2 shadow-sm cursor-pointer"
              >
                <Menu size={20} className="text-slate-600" />
              </button>

              <Routes>
                <Route path="/" element={<TVScreenById />} />
                <Route path="/display" element={<UploadImage />} />
                <Route path="/screens" element={<TVScreen />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App