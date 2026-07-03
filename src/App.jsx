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
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto bg-slate-50">
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
