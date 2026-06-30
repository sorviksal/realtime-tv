import { Routes, Route } from 'react-router-dom'
import Sidebar from './Components/sidebar'
import UploadImage from './Pages/uploardMedia'
import TVScreen from './Pages/TvScreen'
import TVScreenById from './Pages/TVDisplay'
import './index.css'

function App() {
  return (
    <Routes>
      {/* Full-screen TV route — no sidebar, just the display */}
      <Route path="/tv/:id" element={<TVScreen />} />

      {/* Admin/dashboard layout with sidebar */}
      <Route
        path="/*"
        element={
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto bg-slate-50">
              <Routes>
                <Route path="/" element={< TVScreenById />} />
                <Route path="/display" element={<UploadImage/>} />
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