'use client'
import { useEffect, useState } from 'react'
import type { Spo } from '@prisma/client'
import SPOForm from '@/components/SPOForm'
import SPOPreview from '@/components/SPOPreview'

type UserSession = {
  username: string
  role: 'USER' | 'ADMIN'
  unit?: string
}

export default function Dashboard(){
  const [user, setUser]=useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const u = JSON.parse(localStorage.getItem('user')||'null') as UserSession | null
      return u && u.role !== 'ADMIN' ? u : null
    } catch {
      return null
    }
  });
  const [spos, setSpos]=useState<Spo[]>([]);
  const [editingData, setEditingData]=useState<Spo | null>(null);
  const [previewData, setPreviewData]=useState<Spo | null>(null);
  const [showPreview, setShowPreview]=useState(false);
  const [sidebarOpen, setSidebarOpen]=useState(false); // <--- TAMBAHAN

  const loadData = (unit: string) => {
    fetch(`/api/spo?unit=${unit}`).then(r=>r.json()).then(setSpos);
  }

  const getCachedUser = (): UserSession | null => {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem('user')
    if (raw) {
      try {
        return JSON.parse(raw) as UserSession
      } catch {
        return null
      }
    }
    const match = document.cookie.match(/(?:^|;\s*)user=([^;]+)/)
    if (!match) return null
    try {
      return JSON.parse(decodeURIComponent(match[1])) as UserSession
    } catch {
      return null
    }
  }

  useEffect(()=>{
    if (!user) {
      const cached = getCachedUser()
      if (cached && cached.role !== 'ADMIN') {
        setUser(cached)
        return
      }
      location.href='/login'
      return
    }
    loadData(user.unit || '')
  },[user]);

  const handleSaved = () => {
    setEditingData(null);
    loadData(user?.unit || '');
    setSidebarOpen(false);
    alert('Dokumen berhasil disimpan!');
  }

  const handlePrint = (data: Spo) => {
    window.open(`/api/spo/pdf?id=${data.id}`, '_blank');
  }

  const logout = () => {
    localStorage.removeItem('user')
    document.cookie = 'user=; path=/; max-age=0; sameSite=Lax'
    location.href='/login'
  }
  if(!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* TOMBOL HAMBURGER HP */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white w-10 h-10 rounded-xl font-bold shadow-lg"
      >
        {sidebarOpen? '✕' : '☰'}
      </button>

      {/* OVERLAY HP */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* Sidebar - Daftar Dokumen - FIX RESPONSIVE */}
      <div className={`
        w-full lg:w-80 bg-white border-r border-slate-200 p-5 flex flex-col shrink-0
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex items-center gap-3 mb-6 mt-10 lg:mt-0">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">{user?.unit?.[0] || user?.username?.[0] || 'U'}</div>
          <div><p className="font-bold leading-none">{user?.unit || user?.username}</p><p className="text-xs text-slate-500">{user?.username} - {user?.role}</p></div>
        </div>
        <button onClick={logout} className="mt-4 w-full border border-slate-200 py-2.5 rounded-xl text-sm hover:bg-slate-50">Logout</button>

        <div className="flex-1 overflow-y-auto pr-1 mt-6">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Dokumen Saya ({spos.length})</p>
          <div className="space-y-3">
            {spos.map((s: Spo)=>(
              <div key={s.id} className="p-3 rounded-xl border bg-slate-50 border-slate-200 hover:bg-white transition">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold truncate w-[70%]">{s.judul}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.jenis==='SPO'?'bg-blue-100 text-blue-700':s.jenis==='PROGRAM'?'bg-green-100 text-green-700':'bg-orange-100 text-orange-700'}`}>{s.jenis}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1 truncate">{s.noDokumen}</p>
                <div className="grid grid-cols-3 gap-1 mt-3">
                  <button onClick={()=>{setPreviewData(s); setShowPreview(true)}} className="text-xs bg-white border border-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white">👁 Preview</button>
                  <button onClick={()=>{setEditingData(s); setSidebarOpen(false); window.scrollTo(0,0)}} className="text-xs bg-white border border-slate-200 px-2 py-1.5 rounded-lg hover:bg-slate-900 hover:text-white">✏ Edit</button>
                  <button onClick={()=>handlePrint(s)} className="text-xs bg-slate-900 text-white px-2 py-1.5 rounded-lg">🖨 Cetak</button>
                </div>
              </div>
            ))}
            {spos.length===0 && <p className="text-xs text-slate-400 p-3 text-center border border-dashed rounded-xl">Belum ada dokumen</p>}
          </div>
        </div>
      </div>

      {/* Main - Hanya Form Buat Surat */}
      <div className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto pt-12 lg:pt-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">{editingData? 'Edit Dokumen' : 'Buat Surat Baru'}</h1>
              <p className="text-sm text-slate-500">Isi form dibawah, No Dokumen bisa diedit manual</p>
            </div>
            {editingData && <button onClick={()=>setEditingData(null)} className="text-xs border px-4 py-2 rounded-xl bg-white hover:bg-slate-50">+ Buat Baru</button>}
          </div>
          <SPOForm user={user} onSaved={handleSaved} editingData={editingData} />
        </div>
      </div>

      {/* POPUP PREVIEW */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#f1f5f9] w-full max-w-5xl h- rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate max-w-">{previewData.judul}</p>
                <p className="text-xs text-slate-500 font-mono">{previewData.noDokumen}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>window.open(`/api/spo/pdf?id=${previewData.id}`, '_blank')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold">🖨 Cetak</button>
                <button onClick={()=>setShowPreview(false)} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold">Tutup</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#e2e8f0]">
              <div className="mx-auto shadow-xl" style={{maxWidth:'950px'}}>
                <SPOPreview data={previewData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}