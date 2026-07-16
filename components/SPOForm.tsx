'use client'
import { useState, useEffect } from 'react'

const DAFTAR_UNIT = ["Unit Medical Check Up","Unit Rekam Medik","KSM Telinga Hidung Tenggorokan","Unit Farmasi","Unit IGD","Unit Laboratorium","Unit Radiologi","Manajemen"]

export default function SPOForm({ user, onSaved, editingData }: any) {
  const [form, setForm] = useState<any>({
    judul:'', jenis:'SPO', noDokumen:'', noRevisi:'01', tglTerbit: new Date().toISOString().split('T')[0],
    pengertian:'', tujuan:'', kebijakan:'', prosedur:'', unitTerkait: [] as string[]
  })
  const [customUnit, setCustomUnit] = useState('')
  const [errors, setErrors] = useState<any>({})

 const [sposCount, setSposCount] = useState(0)
useEffect(()=>{
  fetch(`/api/spo?unit=${user?.unit}`).then(r=>r.json()).then(d=>setSposCount(d.length)).catch(()=>{})
},[user])

useEffect(()=>{
  if(editingData){
    setForm({
      judul: editingData.judul || '',
      jenis: editingData.jenis || 'SPO',
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
    setForm((f:any)=>({...f, judul:'', noDokumen:`00${sposCount+1}/${uniq}/B/${user?.unit||'MCU'}/RS-PJ/2026`, pengertian:'', tujuan:'', kebijakan:'', prosedur:'', unitTerkait: [] }))
  }
},[editingData, user, sposCount])

  const totalChars = (form.pengertian.length + form.tujuan.length + form.kebijakan.length + form.prosedur.length)
  const totalPages = Math.max(2, Math.min(10, Math.ceil(totalChars / 700) + 1))

  const validate = () => {
    const e:any={}
    if(!form.judul.trim()) e.judul=true
    if(!form.noDokumen.trim()) e.noDokumen=true
    if(!form.pengertian.trim()) e.pengertian=true
    if(!form.tujuan.trim()) e.tujuan=true
    if(!form.prosedur.trim()) e.prosedur=true
    if(form.unitTerkait.length===0) e.unitTerkait=true
    setErrors(e)
    return Object.keys(e).length===0
  }

  const submit = async () => {
    if(!validate()) return alert('Lengkapi field wajib (*) yang merah!')
    const payload = {...form, unitTerkait: form.unitTerkait.join(', '), halaman:`1/${totalPages}`, tglTerbit: new Date(form.tglTerbit).toISOString(), unit: user.unit }
    const url = editingData? `/api/spo/${editingData.id}` : '/api/spo'
    const method = editingData? 'PUT':'POST'
    const res = await fetch(url,{method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    if(res.ok) onSaved(); else {
      let errMsg = 'Gagal simpan!'
      try { const j = await res.json(); if(j?.error) errMsg = j.error } catch(e){}
      alert(errMsg)
    }
  }

  const inp = (err:boolean) => `w-full border ${err?'border-red-500 bg-red-50':'border-slate-200'} p-3 rounded-xl mt-1 text-sm outline-none focus:ring-2 focus:ring-blue-500`

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['SPO','PROGRAM','PANDUAN'].map((j:string)=><button key={j} onClick={()=>setForm({...form, jenis:j})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${form.jenis===j?'bg-slate-900 text-white':'bg-white'}`}>{j}</button>)}
      </div>
      <div><label className="text- font-bold">JUDUL *</label><input value={form.judul} onChange={(e:any)=>setForm({...form, judul:e.target.value})} className={inp(errors.judul)} /></div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2"><label className="text- font-bold">NO. DOKUMEN *</label><input value={form.noDokumen} onChange={(e:any)=>setForm({...form, noDokumen:e.target.value})} className={`${inp(errors.noDokumen)} font-mono bg-yellow-50 text-xs`} /></div>
        <div><label className="text- font-bold">NO. REVISI</label><input value={form.noRevisi} onChange={(e:any)=>setForm({...form, noRevisi:e.target.value})} className={inp(false)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="text- font-bold">TANGGAL TERBIT</label><input type="date" value={form.tglTerbit} onChange={(e:any)=>setForm({...form, tglTerbit:e.target.value})} className={inp(false)} /></div>
        <div className="bg-slate-100 border border-dashed rounded-xl p-3 text-xs flex flex-col justify-center"><span>Halaman Otomatis:</span><b className="text-sm">1/{totalPages} ({totalChars} char)</b></div>
      </div>
      <div><label className="text- font-bold">PENGERTIAN *</label><textarea value={form.pengertian} onChange={(e:any)=>setForm({...form, pengertian:e.target.value})} className={`${inp(errors.pengertian)} h-20`} /></div>
      <div><label className="text- font-bold">TUJUAN *</label><textarea value={form.tujuan} onChange={(e:any)=>setForm({...form, tujuan:e.target.value})} className={`${inp(errors.tujuan)} h-20`} /></div>
      <div><label className="text- font-bold">KEBIJAKAN</label><textarea value={form.kebijakan} onChange={(e:any)=>setForm({...form, kebijakan:e.target.value})} className={`${inp(false)} h-20`} /></div>
      <div><label className="text- font-bold">PROSEDUR *</label><textarea value={form.prosedur} onChange={(e:any)=>setForm({...form, prosedur:e.target.value})} className={`${inp(errors.prosedur)} h-32`} /></div>
      <div className={`border-2 ${errors.unitTerkait?'border-red-300':'border-slate-200'} p-3 rounded-xl bg-white`}>
        <label className="text- font-bold">UNIT TERKAIT * (PALING BAWAH)</label>
        {DAFTAR_UNIT.map((u:string)=><label key={u} className="flex gap-2 text- p-1"><input type="checkbox" checked={form.unitTerkait.includes(u)} onChange={()=>setForm({...form, unitTerkait: form.unitTerkait.includes(u)? form.unitTerkait.filter((x:string)=>x!==u): [...form.unitTerkait, u]})} />{u}</label>)}
        <div className="flex gap-2 mt-2"><input value={customUnit} onChange={(e:any)=>setCustomUnit(e.target.value)} placeholder="Tambah manual" className="flex-1 border p-2 rounded-lg text-xs" /><button onClick={()=>{ if(customUnit){ setForm({...form, unitTerkait:[...form.unitTerkait, customUnit]}); setCustomUnit('')}}} className="bg-slate-900 text-white px-3 rounded-lg text-xs">Tambah</button></div>
      </div>
      <button onClick={submit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{editingData?'Update Dokumen':'Simpan Dokumen'}</button>
    </div>
  )
}