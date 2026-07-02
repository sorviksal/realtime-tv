import { Routes, Route } from 'react-router-dom'
import { LiveMediaProvider } from './context/LiveMediaContext'
import Sidebar from './Components/sidebar'
import UploadImage from './Pages/uploardMedia'
import TVScreen from './Pages/TvScreen'
import TVScreenById from './Pages/TVDisplay'
import Setting from './Pages/Setting'
import './index.css'

function App() {
  return (
    <LiveMediaProvider>
      <Routes>
        <Route path="/tv/:id" element={<TVScreen />} />
        <Route
          path="/*"
          element={
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 overflow-y-auto bg-slate-50">
                <Routes>
                  <Route path="/" element={<TVScreenById />} />
                  <Route path="/display" element={<UploadImage/>} />
                  <Route path="/screens" element={<TVScreen />} />
                  <Route path="/settings" element={<Setting/>} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </LiveMediaProvider>
  )
}

export default App