'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const setSessionCache = (user: { username: string; role: string; unit?: string }) => {
    const userData = { username: user.username, role: user.role, unit: user.unit || '' }
    localStorage.setItem('user', JSON.stringify(userData))
    document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=Lax`
  }

  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if(res.ok) {
      setSessionCache(data)
      if(data.role === 'ADMIN') router.push('/admin');
      else router.push('/dashboard');
    } else {
      alert(data.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">IHC</div>
          <h1 className="text- font-bold text-slate-900 leading-none">Login</h1>
          <p className="text-slate-500 mt-2 mb-8">RS Pertamina Jaya - Sistem Manajemen Dokumen</p>

          <label className="text- font-semibold text-slate-700">Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="admin / mcu" className="w-full mt-1 mb-4 border border-slate-200 bg-slate-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />

          <label className="text- font-semibold text-slate-700">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full mt-1 mb-6 border border-slate-200 bg-slate-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />

          <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">
            {loading? 'Memproses...' : 'Masuk Dashboard'}
          </button>

          <div className="mt-6 p-3 bg-slate-100 rounded-lg text- text-slate-600">
            <b>Demo Akun:</b><br/>admin / 123456 (Admin)<br/>mcu / 123456 (Unit MCU)
          </div>
        </div>
      </div>
      <div className="hidden md:flex w-[55%] bg-blue-600 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
        <div className="relative text-white max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Kelola SPO, PROGRAM, & PANDUAN lebih cepat, rapi & sesuai standar.</h2>
          <p className="mt-4 text-blue-100">Template otomatis mengikuti format resmi RS Pertamina Jaya dengan penomoran dokumen otomatis.</p>
        </div>
      </div>
    </div>
  )
}