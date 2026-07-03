import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { BASE_URL } from '../Services/mediaService'
import { UserPlus, CheckCircle2, X, Eye, EyeOff, Trash2, Users, AlertTriangle, KeyRound } from 'lucide-react'

function authHeaders() {
  const token = sessionStorage.getItem('ads2026_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export default function RegisterPage() {
  const { register, token } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [changePwTarget, setChangePwTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const res = await fetch(`${BASE_URL}/api/Auth/users`, { headers: { ...authHeaders() } })
      if (res.ok) setUsers(await res.json())
    } catch {
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const showToast = (type, message) => {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)

    if (!username.trim() || !password.trim()) {
      return showToast('error', 'Username and password are required.')
    }
    if (password !== confirm) {
      return showToast('error', 'Passwords do not match.')
    }
    if (password.length < 6) {
      return showToast('error', 'Password must be at least 6 characters.')
    }

    setLoading(true)
    try {
      await register(username.trim(), password)
      showToast('success', `User "${username.trim()}" created.`)
      setUsername(''); setPassword(''); setConfirm('')
      loadUsers()
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!changePwTarget || !newPassword.trim()) return
    if (newPassword.length < 6) return showToast('error', 'Password must be at least 6 characters.')
    setChangingPw(true)
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/${changePwTarget.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      showToast('success', data.message)
      setChangePwTarget(null)
      setNewPassword('')
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setChangingPw(false)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      const res = await fetch(`${BASE_URL}/api/Auth/${id}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      showToast('success', data.message)
      setConfirmDelete(null)
      loadUsers()
    } catch (err) {
      showToast('error', err.message)
    } finally {
      setDeleting(false)
    }
  }

  const toggleBody = document.body

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
        <div>
          <h1 className="text-lg font-bold text-slate-800">User Management</h1>
          <p className="text-xs text-slate-400">Create and manage system users.</p>
        </div>
      </header>

      {status && (
        <div className={`fixed top-5 right-5 z-50 flex items-stretch bg-white rounded-2xl shadow-xl overflow-hidden min-w-[320px] max-w-sm ${status.type === 'success' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-rose-500'}`}>
          <div className="flex items-start gap-3.5 px-5 py-4 flex-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${status.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              {status.type === 'success' ? <CheckCircle2 size={18} className="text-white" strokeWidth={2.5} /> : <X size={18} className="text-white" strokeWidth={2.5} />}
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-bold text-slate-800 mb-0.5">{status.type === 'success' ? 'Success' : 'Error'}</p>
              <p className="text-sm text-slate-500 leading-snug">{status.message}</p>
            </div>
            <button onClick={() => setStatus(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"><X size={16} /></button>
          </div>
        </div>
      )}

      <main className="p-8 max-w-3xl mx-auto space-y-8">
        {/* Create User */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><UserPlus size={20} className="text-indigo-600" /></div>
            <div><h2 className="text-sm font-bold text-slate-800">New User</h2><p className="text-xs text-slate-400">The user will be able to sign in immediately.</p></div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" required />
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
              <UserPlus size={16} />{loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Users size={20} className="text-slate-600" /></div>
            <div><h2 className="text-sm font-bold text-slate-800">Existing Users</h2><p className="text-xs text-slate-400">{usersLoading ? 'Loading...' : `${users.length} user${users.length !== 1 ? 's' : ''} registered.`}</p></div>
          </div>
          {usersLoading ? (
            <p className="text-sm text-slate-400 text-center py-8">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No users found.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">{u.username[0].toUpperCase()}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{u.username}</p>
                      <p className="text-[11px] text-slate-400">{u.role}{u.role === 'admin' ? '' : ' · ' + new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setChangePwTarget(u); setNewPassword(''); setShowNewPw(false) }} className="text-slate-300 hover:text-indigo-500 transition-colors cursor-pointer p-1" title="Change password"><KeyRound size={15} /></button>
                    <button onClick={() => setConfirmDelete(u)} className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer p-1"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Change Password Modal */}
      {changePwTarget && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-6" onClick={() => !changingPw && (setChangePwTarget(null), setNewPassword(''))}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative px-8 py-9" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setChangePwTarget(null); setNewPassword('') }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center"><KeyRound size={28} className="text-indigo-600" strokeWidth={2.2} /></div>
            </div>
            <p className="text-center text-slate-700 font-semibold text-base mb-1">Change Password</p>
            <p className="text-center text-slate-400 text-sm mb-6">for <span className="font-semibold">{changePwTarget.username}</span></p>
            <div className="relative">
              <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">{showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={handleChangePassword} disabled={changingPw || !newPassword.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer">{changingPw ? 'Saving...' : 'Save'}</button>
              <button onClick={() => { setChangePwTarget(null); setNewPassword('') }} disabled={changingPw} className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-6" onClick={() => !deleting && setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative px-8 py-9" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setConfirmDelete(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full border-[3px] border-rose-500 flex items-center justify-center"><AlertTriangle size={28} className="text-rose-500" strokeWidth={2.2} /></div>
            </div>
            <p className="text-center text-slate-500 text-base leading-snub mb-7">
              Delete user <span className="font-semibold text-slate-700">"{confirmDelete.username}"</span>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => handleDelete(confirmDelete.id)} disabled={deleting} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer">{deleting ? 'Deleting...' : 'Yes, delete'}</button>
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
