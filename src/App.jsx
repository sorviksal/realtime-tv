import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LiveMediaProvider } from './context/LiveMediaContext'
import Sidebar from './Components/sidebar'
import UploadImage from './Pages/uploardMedia'
import TVScreen from './Pages/TvScreen'
import TVScreenById from './Pages/TVDisplay'
import Setting from './Pages/Setting'
import RegisterPage from './Pages/RegisterPage'
import LoginPage from './Pages/LoginPage'
import './index.css'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-3 left-3 z-30 lg:hidden bg-white border border-slate-200 rounded-xl p-2 shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Routes>
            <Route path="/" element={<TVScreenById />} />
            <Route path="/display" element={<UploadImage />} />
            <Route path="/screens" element={<TVScreen />} />
            <Route path="/settings" element={<Setting />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </div>
      </div>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <AuthProvider>
      <LiveMediaProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tv/:id" element={<TVScreen />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </LiveMediaProvider>
    </AuthProvider>
  )
}

export default App
