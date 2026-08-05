'use client'
import { useState, useEffect, type ChangeEvent } from 'react'

type UserSession = {
  username: string
  unit?: string
}

type SpoFormState = {
  judul: string
  jenis: 'SPO' | 'PROGRAM' | 'PANDUAN'
  noDokumen: string
  noRevisi: string
  tglTerbit: string
  pengertian: string
  tujuan: string
  kebijakan: string
  prosedur: string
  unitTerkait: string[]
}

type EditingData = {
  id: string
  judul: string
  jenis: string
  noDokumen: string
  noRevisi: string
  tglTerbit: string
  pengertian: string
  tujuan: string
  kebijakan: string
  prosedur: string
  unitTerkait: string
}

type SpoFormProps = {
  user: UserSession
  onSaved: () => void
  editingData: EditingData | null
}

const DAFTAR_UNIT = ["Unit Medical Check Up","Unit Rekam Medik","KSM Telinga Hidung Tenggorokan","Unit Farmasi","Unit IGD","Unit Laboratorium","Unit Radiologi","Manajemen"]

export default function SPOForm({ user, onSaved, editingData }: SpoFormProps) {
  const [form, setForm] = useState<SpoFormState>({
    judul:'', jenis:'SPO', noDokumen:'', noRevisi:'01', tglTerbit: new Date().toISOString().split('T')[0],
    pengertian:'', tujuan:'', kebijakan:'', prosedur:'', unitTerkait: []
  })
  const [customUnit, setCustomUnit] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof SpoFormState, boolean>>>({})

  const [sposCount, setSposCount] = useState(0)
  useEffect(()=>{
    fetch(`/api/spo?unit=${encodeURIComponent(user?.unit ?? '')}`)
      .then(r => r.json())
      .then((d: unknown) => {
        if (Array.isArray(d)) setSposCount(d.length)
      })
      .catch(() => {})
  },[user])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{
    if(editingData){
      setForm({
        judul: editingData.judul || '',
        jenis: (editingData.jenis as SpoFormState['jenis']) || 'SPO',
        noDokumen: editingData.noDokumen || '',
        noRevisi: editingData.noRevisi || '01',
        tglTerbit: editingData.tglTerbit? new Date(editingData.tglTerbit).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        pengertian: editingData.pengertian || '',
        tujuan: editingData.tujuan || '',
        kebijakan: editingData.kebijakan || '',
        prosedur: editingData.prosedur || '',
        unitTerkait: editingData.unitTerkait? editingData.unitTerkait.split(', ').filter(Boolean) : []
      })
    } else {
      const uniq = Date.now().toString().slice(-4)
      setForm((f)=>({
        ...f,
        judul:'',
        noDokumen:`00${sposCount+1}/${uniq}/B/${user?.unit||'MCU'}/RS-PJ/2026`,
        pengertian:'', tujuan:'', kebijakan:'', prosedur:'', unitTerkait: []
      }))
    }
  },[editingData, user, sposCount])

  const totalChars = (form.pengertian.length + form.tujuan.length + form.kebijakan.length + form.prosedur.length)
  const totalPages = Math.max(2, Math.min(10, Math.ceil(totalChars / 700) + 1))

  const validate = () => {
    const e: Partial<Record<keyof SpoFormState, boolean>> = {}
    if(!form.judul.trim()) e.judul=true
    if(!form.noDokumen.trim()) e.noDokumen=true
    if(!form.pengertian.trim()) e.pengertian=true
    if(!form.tujuan.trim()) e.tujuan=true
    if(!form.prosedur.trim()) e.prosedur=true
    if(form.unitTerkait.length===0) e.unitTerkait=true
    setErrors(e)
    return Object.keys(e).length===0
  }

  const handleChange = (field: keyof SpoFormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const submit = async () => {
    if(!validate()) return alert('Lengkapi field wajib (*) yang merah!')
    const payload = {
      ...form,
      unitTerkait: form.unitTerkait.join(', '),
      halaman:`1/${totalPages}`,
      tglTerbit: new Date(form.tglTerbit).toISOString(),
      unit: user.unit || ''
    }
    const url = editingData? `/api/spo/${editingData.id}` : '/api/spo'
    const method = editingData? 'PUT':'POST'
    const res = await fetch(url,{method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    if(res.ok) onSaved(); else {
      let errMsg = 'Gagal simpan!'
      try { const j = await res.json() as { error?: string }; if(j?.error) errMsg = j.error } catch {
        // ignore invalid JSON
      }
      alert(errMsg)
    }
  }

  const inp = (err:boolean) => `w-full border ${err?'border-red-500 bg-red-50':'border-slate-200'} p-3 rounded-xl mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500`

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['SPO','PROGRAM','PANDUAN'].map((j:string)=><button key={j} onClick={()=>setForm({...form, jenis:j})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${form.jenis===j?'bg-slate-900 text-white':'bg-white'}`}>{j}</button>)}
      </div>
      <div><label className="text- font-bold">JUDUL *</label><input value={form.judul} onChange={handleChange('judul')} className={inp(!!errors.judul)} /></div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2"><label className="text- font-bold">NO. DOKUMEN *</label><input value={form.noDokumen} onChange={handleChange('noDokumen')} className={`${inp(!!errors.noDokumen)} font-mono bg-yellow-50 text-xs`} /></div>
        <div><label className="text- font-bold">NO. REVISI</label><input value={form.noRevisi} onChange={handleChange('noRevisi')} className={inp(false)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="text- font-bold">TANGGAL TERBIT</label><input type="date" value={form.tglTerbit} onChange={handleChange('tglTerbit')} className={inp(false)} /></div>
        <div className="bg-slate-100 border border-dashed rounded-xl p-3 text-xs flex flex-col justify-center"><span>Halaman Otomatis:</span><b className="text-sm">1/{totalPages} ({totalChars} char)</b></div>
      </div>
      <div><label className="text- font-bold">PENGERTIAN *</label><textarea value={form.pengertian} onChange={handleChange('pengertian')} className={`${inp(!!errors.pengertian)} h-20`} /></div>
      <div><label className="text- font-bold">TUJUAN *</label><textarea value={form.tujuan} onChange={handleChange('tujuan')} className={`${inp(!!errors.tujuan)} h-20`} /></div>
      <div><label className="text- font-bold">KEBIJAKAN</label><textarea value={form.kebijakan} onChange={handleChange('kebijakan')} className={`${inp(false)} h-20`} /></div>
      <div><label className="text- font-bold">PROSEDUR *</label><textarea value={form.prosedur} onChange={handleChange('prosedur')} className={`${inp(!!errors.prosedur)} h-32`} /></div>
      <div className={`border-2 ${errors.unitTerkait?'border-red-300':'border-slate-200'} p-3 rounded-xl bg-white`}>
        <label className="text- font-bold">UNIT TERKAIT * (PALING BAWAH)</label>
        {DAFTAR_UNIT.map((u)=> <label key={u} className="flex gap-2 text- p-1"><input type="checkbox" checked={form.unitTerkait.includes(u)} onChange={()=>setForm(prev => ({ ...prev, unitTerkait: prev.unitTerkait.includes(u) ? prev.unitTerkait.filter(x=>x!==u) : [...prev.unitTerkait, u] }))} />{u}</label>)}
        <div className="flex gap-2 mt-2"><input value={customUnit} onChange={(e)=>setCustomUnit(e.target.value)} placeholder="Tambah manual" className="flex-1 border p-2 rounded-lg text-xs" /><button onClick={()=>{ if(customUnit){ setForm(prev => ({ ...prev, unitTerkait:[...prev.unitTerkait, customUnit] })); setCustomUnit('')}}} className="bg-slate-900 text-white px-3 rounded-lg text-xs">Tambah</button></div>
      </div>
      <button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{editingData?'Update Dokumen':'Simpan Dokumen'}</button>
    </div>
  )
}