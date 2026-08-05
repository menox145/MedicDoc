'use client'
import type { Spo } from '@prisma/client'
import { useEffect, useState } from 'react'
import SPOPreview from '@/components/SPOPreview'
import SPOForm from '@/components/SPOForm'

type UserSession = {
  username: string
  role: 'USER' | 'ADMIN'
  unit?: string
}

export default function Admin(){
  const [spos, setSpos]=useState<Spo[]>([]);
  const [user, setUser]=useState<UserSession | null>(null);
  const [filterJenis, setFilterJenis] = useState('SEMUA');
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Spo | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newUser, setNewUser] = useState({ username:'', password:'123456', role:'USER', unit:'' });
  const [showPassword, setShowPassword] = useState(false);

  const getCachedUser = (): UserSession | null => {
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
      if (cached) {
        setUser(cached)
        return
      }
      location.href='/login'
      return
    }
    fetch('/api/spo?role=ADMIN').then(r=>r.json()).then(setSpos)
  },[user]);

  const loadData = () => {
    fetch('/api/spo?role=ADMIN').then(r=>r.json()).then(setSpos)
  }

  const logout = () => {
    localStorage.removeItem('user')
    document.cookie = 'user=; path=/; max-age=0; sameSite=Lax'
    location.href='/login'
  }

  const handleCreateUser = async () => {
    if(!newUser.username.trim() ||!newUser.password.trim()) return alert('Isi username & password')
    const res = await fetch('/api/auth/create-user', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newUser) })
    const j = await res.json()
    if(res.ok) { alert('User dibuat'); setShowAddUser(false); setNewUser({username:'', password:'123456', role:'USER', unit:''}) } else alert(j?.error||'Gagal buat user')
  }

  const filtered = spos.filter(s => {
    const matchJenis = filterJenis === 'SEMUA' || s.jenis === filterJenis;
    const matchSearch = s.judul.toLowerCase().includes(search.toLowerCase());
    return matchJenis && matchSearch;
  });

  return (
    <>
      <style>{`
        @media print {
          body * { display: none!important; }
         .print-modal,.print-modal * { display: block!important; visibility: visible!important; }
         .print-modal { position: static!important; display: block!important; width: auto!important; margin: 0!important; padding: 0!important; }
         .print-modal > div { height: auto!important; max-height: none!important; overflow: visible!important; box-shadow: none!important; border-radius: 0!important; }
         .print-modal.overflow-auto { overflow: visible!important; }
          #modal-actions { display: none!important; }
        }
      `}</style>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">A</div>
            <div><p className="font-bold leading-none">Admin Panel</p><p className="text-xs text-slate-500">Halo, {user?.username}</p></div>
          </div>
          <button onClick={logout} className="text-sm border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50">Logout</button>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 p-5 rounded-xl"><p className="text-xs text-slate-500">Total SPO</p><p className="text-2xl font-bold mt-1">{spos.length}</p></div>
            <div className="bg-white border border-slate-200 p-5 rounded-xl"><p className="text-xs text-slate-500">Total Unit</p><p className="text-2xl font-bold mt-1">12 Unit</p></div>
            <div className="bg-blue-600 p-5 rounded-xl text-white"><p className="text-xs text-blue-100">Status Sistem</p><p className="text-2xl font-bold mt-1">Aktif ●</p></div>
          </div>

          <div className="flex justify-end mb-4 gap-2">
            <button onClick={()=>setShowAddFile(true)} className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-black font-bold">+ Tambah File</button>
            <button onClick={()=>setShowAddUser(true)} className="text-sm border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50">+ Tambah User</button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-wrap gap-3 justify-between items-center">
              <h1 className="font-bold text-lg">Semua Dokumen ({filtered.length})</h1>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex gap-2 mr-2 items-center">
                  {['SEMUA','SPO','PROGRAM','PANDUAN'].map(j=>(
                    <button key={j} onClick={()=>setFilterJenis(j)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${filterJenis===j? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{j}</button>
                  ))}
                </div>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari judul..." className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>              </div>            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr><th className="text-left p-3 font-semibold">Jenis</th><th className="text-left p-3 font-semibold">Judul</th><th className="text-left p-3 font-semibold">No Dokumen</th><th className="text-left p-3 font-semibold">Unit</th><th className="text-left p-3 font-semibold">Tgl</th><th className="text-left p-3 font-semibold">Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400">Tidak ada data</td></tr>}
                {filtered.map((s: Spo)=>(
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${s.jenis==='SPO'?'bg-blue-50 text-blue-700': s.jenis==='PROGRAM'?'bg-green-50 text-green-700':'bg-orange-50 text-orange-700'}`}>{s.jenis}</span></td>
                    <td className="p-3 font-medium">{s.judul}</td>
                    <td className="p-3 text-slate-600 font-mono text-xs">{s.noDokumen}</td>
                    <td className="p-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{s.unit}</span></td>
                    <td className="p-3 text-slate-500">{new Date(s.tglTerbit).toLocaleDateString('id-ID')}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={()=>{ setPreviewData(s); setShowPreview(true); }} className="text-xs border border-slate-200 px-3 py-1 rounded-lg">👁 Preview</button>
                        <button onClick={()=>window.open(`/api/spo/pdf?id=${s.id}`, '_blank')} className="text-xs bg-slate-900 text-white px-3 py-1 rounded-lg">🖨 Cetak</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8 print-modal">
          <div className="bg-[#f1f5f9] w-full max-w-5xl h- rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div id="modal-actions" className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
              <p className="font-bold text-sm">Preview Dokumen</p>
              <div className="flex gap-2">
                <button onClick={()=>window.open(`/api/spo/pdf?id=${previewData?.id}`, '_blank')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold">🖨 Cetak</button>
                <button onClick={()=>{ setShowPreview(false); setPreviewData(null); }} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold">Tutup</button>
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

      {showAddUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold">Tambah User</h3>
              <button onClick={()=>setShowAddUser(false)}>✕</button>
            </div>
            <div className="p-6 bg-slate-50 space-y-3">
              <input value={newUser.username} onChange={(e)=>setNewUser({...newUser, username: e.target.value})} placeholder="Username" className="w-full border p-3 rounded-lg" />
              <div className="flex gap-2">
                <input value={newUser.password} type={showPassword?'text':'password'} onChange={(e)=>setNewUser({...newUser, password: e.target.value})} className="w-full border p-3 rounded-lg flex-1" />
                <button onClick={()=>setShowPassword(s=>!s)} className="text-xs border px-3 rounded-lg bg-white">{showPassword?'Hide':'Show'}</button>
              </div>
              <select value={newUser.role} onChange={(e)=>setNewUser({...newUser, role: e.target.value})} className="w-full border p-3 rounded-lg">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <input value={newUser.unit} onChange={(e)=>setNewUser({...newUser, unit: e.target.value})} placeholder="Unit (MCU, IGD...)" className="w-full border p-3 rounded-lg" />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setShowAddUser(false)} className="px-4 py-2 border rounded-lg bg-white">Batal</button>
                <button onClick={handleCreateUser} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-[#f8fafc] w-full max-w-6xl h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
              <h3 className="font-bold">📄 Tambah Dokumen Baru</h3>
              <button onClick={()=>setShowAddFile(false)} className="bg-white border px-4 py-2 rounded-xl text-sm font-bold">✕ Tutup</button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <SPOForm user={user} onSaved={()=>{ setShowAddFile(false); loadData(); alert('Dokumen berhasil dibuat!'); }} editingData={null} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}