'use client'
import { useEffect, useState } from 'react'
import SPOPreview from '@/components/SPOPreview'

export default function Admin(){
  const [spos, setSpos]=useState<any[]>([]);
  const [user, setUser]=useState<any>(null);
  const [filterJenis, setFilterJenis] = useState('SEMUA');
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null); // can be single object or array
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username:'', password:'123456', role:'USER', unit:'' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(()=>{
    const u = JSON.parse(localStorage.getItem('user')||'null');
    if(!u || u.role !== 'ADMIN') { localStorage.removeItem('user'); location.href='/login'; return; }
    setUser(u);
    fetch('/api/spo?role=ADMIN').then(r=>r.json()).then(setSpos)
  },[]);

  const logout = () => { localStorage.removeItem('user'); location.href='/login' }

  const handleCreateUser = async () => {
    if(!newUser.username.trim() || !newUser.password.trim()) return alert('Isi username & password')
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
        body * { display: none !important; }
        .print-modal, .print-modal * { display: block !important; visibility: visible !important; }
        .print-modal { position: static !important; display: block !important; width: auto !important; margin: 0 !important; padding: 0 !important; }
        .print-modal > div { height: auto !important; max-height: none !important; overflow: visible !important; box-shadow: none !important; border-radius: 0 !important; }
        .print-modal .overflow-auto { overflow: visible !important; }
        #modal-actions { display: none !important; }
      }
    `}</style>
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0">
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

          <div className="flex justify-end mb-4">
            <button onClick={()=>setShowAddUser(true)} className="text-sm border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50">+ Tambah User</button>
          </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-wrap gap-3 justify-between items-center">
            <h1 className="font-bold text-lg">Semua Dokumen ({filtered.length})</h1>
            <div className="flex gap-2 items-center">
              <div className="flex gap-2 mr-2 items-center">
                {['SEMUA','SPO','PROGRAM','PANDUAN'].map(j=>(
                  <div key={j} className="flex items-center gap-2">
                    <button onClick={()=>setFilterJenis(j)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${filterJenis===j ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{j}</button>
                    {(
                      <a href={j==='SEMUA'? `/api/spo/pdf` : `/api/spo/pdf?jenis=${j}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-50">🖨</a>
                    )}
                  </div>
                ))}
              </div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari judul..." className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={()=>window.open(filterJenis==='SEMUA'? '/api/spo/pdf' : `/api/spo/pdf?jenis=${filterJenis}`, '_blank')} className="ml-2 text-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">🖨 Cetak {filterJenis === 'SEMUA' ? 'Semua' : filterJenis}</button>
            </div>
          </div>
          <table className="w-full text-">
            <thead className="bg-slate-50 text-slate-600">
              <tr><th className="text-left p-3 font-semibold">Jenis</th><th className="text-left p-3 font-semibold">Judul</th><th className="text-left p-3 font-semibold">No Dokumen</th><th className="text-left p-3 font-semibold">Unit</th><th className="text-left p-3 font-semibold">Tgl</th><th className="text-left p-3 font-semibold">Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada data</td></tr>}
              {filtered.map(s=>(
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3"><span className={`px-2 py-1 rounded text- font-bold ${s.jenis==='SPO'?'bg-blue-50 text-blue-700': s.jenis==='PROGRAM'?'bg-green-50 text-green-700':'bg-orange-50 text-orange-700'}`}>{s.jenis}</span></td>
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
        <div className="bg-[#f1f5f9] w-full max-w-5xl h-[86vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div id="modal-actions" className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate max-w-[60ch]">Preview Dokumen</p>
              <p className="text-xs text-slate-500">Cetak / Tutup</p>
            </div>
            <div className="flex gap-2">
              <a href={filterJenis==='SEMUA'? '/api/spo/pdf' : `/api/spo/pdf?jenis=${filterJenis}`} target="_blank" rel="noreferrer" className="bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold">⬇ Download PDF</a>
              <button onClick={()=>window.open(filterJenis==='SEMUA'? '/api/spo/pdf' : `/api/spo/pdf?jenis=${filterJenis}`, '_blank')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold">🖨 Cetak</button>
              <button onClick={()=>{ setShowPreview(false); setPreviewData(null); }} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold">Tutup</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-6 bg-[#e2e8f0]">
            <div className="mx-auto shadow-xl" style={{maxWidth:'950px'}}>
              {/* previewData can be single object or array */}
              {Array.isArray(previewData)? previewData.map((d:any,i:number)=>(<div key={i} className="mb-8"><SPOPreview data={d} /></div>)) : <SPOPreview data={previewData} />}
            </div>
          </div>
        </div>
      </div>
    )}
    {showAddUser && (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">U</div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tambah User</h3>
                <p className="text-sm text-slate-600">Buat akun baru untuk mengakses sistem</p>
              </div>
            </div>
            <button onClick={()=>setShowAddUser(false)} className="text-slate-600 hover:text-slate-800">Tutup ✕</button>
          </div>
          <div className="p-6 bg-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Username</label>
                <input value={newUser.username} onChange={(e)=>setNewUser({...newUser, username: e.target.value})} placeholder="e.g. admin" className="w-full border border-slate-200 p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <input value={newUser.password} type={showPassword? 'text':'password'} onChange={(e)=>setNewUser({...newUser, password: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400" style={{color:'#0f172a'}} />
                  <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500">{showPassword? 'Sembunyikan':'Tampilkan'}</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                <select value={newUser.role} onChange={(e)=>setNewUser({...newUser, role: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-900">
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Unit (opsional)</label>
                <input value={newUser.unit} onChange={(e)=>setNewUser({...newUser, unit: e.target.value})} placeholder="e.g. MCU" className="w-full border border-slate-200 p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={()=>setShowAddUser(false)} className="px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleCreateUser} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}