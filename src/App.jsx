import { Routes, Route } from 'react-router-dom'
import Sidebar from './Pages/sidebar'
import UploadImage from './Pages/uploard'
import './index.css'

function App() {
  return (
    <div className="flex h-screen  overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <Routes>
          <Route path="/" element={<UploadImage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App