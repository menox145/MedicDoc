export default function SPOPreview({ data }: any) {
  if(!data) return null
  const units = data.unitTerkait? data.unitTerkait.split(', ') : []

  // Render full document and rely on browser pagination. Use table thead so header repeats on each printed page.
  return (
    <div id="print-area" className="mx-auto bg-white p-4" style={{maxWidth:'210mm'}}>
      <style>{`
        #print-area { color: #0f172a; font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; width: 100%; max-width: 210mm; margin: 0 auto; }
        #print-area table { width:100%; border-collapse:collapse; table-layout: fixed; font-size: 12px; }
        #print-area th, #print-area td { border:1px solid #111827; padding:6px; vertical-align:top; box-sizing: border-box; word-break: break-word; overflow-wrap: break-word; }
        #print-area thead { display: table-header-group; }
        #print-area th { background: #f8fafc; }
        #print-area td { white-space: pre-line; }
        @media print {
          html, body { width: 210mm; margin: 0; padding: 0; }
          #print-area { width: 100%; max-width: 210mm; margin: 0; padding: 0; }
          #modal-actions { display:none!important; }
          body * { visibility: visible !important; }
          .print-modal, .print-modal * { visibility: visible !important; }
          .print-modal { overflow: visible !important; }
          .avoid-break { page-break-inside: avoid; }
          tr.prosedur, tbody.prosedur { page-break-inside: avoid; }
          td, th { break-inside: avoid-column; }
          @page { margin: 15mm 12mm; }
        }
      `}</style>

      <table>
        <thead>
          <tr>
            <th rowSpan={2} style={{width:'22%', textAlign:'center'}}>
              <div style={{fontWeight:800, color:'#1e90ff'}}>IHC</div>
              <div>Rumah Sakit<br/>Pertamina Jaya</div>
            </th>
            <th colSpan={3} style={{textAlign:'center', fontWeight:700, textTransform:'uppercase'}}>{data.judul}</th>
          </tr>
          <tr>
            <th style={{textAlign:'center'}}>No. Dokumen<br/><div style={{fontFamily:'monospace'}}>{data.noDokumen}</div></th>
            <th style={{textAlign:'center'}}>No. Revisi<br/>{data.noRevisi}</th>
            <th style={{textAlign:'center', background:'#fef3c7'}}>Halaman<br/>{/* browser will paginate */}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="avoid-break">
            <td style={{fontWeight:800, textAlign:'center'}}>{data.jenis}</td>
            <td style={{textAlign:'center'}}>Tanggal Terbit :<br/><b>{new Date(data.tglTerbit).toLocaleDateString('id-ID')}</b></td>
            <td colSpan={2} style={{textAlign:'center'}}>
              <div style={{textDecoration:'underline'}}>Ditetapkan oleh :</div>
              Direktur
              <div style={{marginTop:20, fontWeight:700}}>dr. Dedy Waskita, MHPM</div>
            </td>
          </tr>

          <tr className="first"><td style={{fontWeight:700, background:'#f8fafc'}}>PENGERTIAN</td><td colSpan={3}>{data.pengertian}</td></tr>
          <tr><td style={{fontWeight:700, background:'#f8fafc'}}>TUJUAN</td><td colSpan={3}>{data.tujuan}</td></tr>
          <tr><td style={{fontWeight:700, background:'#f8fafc'}}>KEBIJAKAN</td><td colSpan={3} style={{whiteSpace:'pre-line'}}>{data.kebijakan}</td></tr>

          <tr className="prosedur"><td style={{fontWeight:700, background:'#f8fafc'}}>PROSEDUR</td><td colSpan={3} style={{whiteSpace:'pre-line'}}>{data.prosedur}</td></tr>

          <tr><td style={{fontWeight:700, background:'#f8fafc'}}>UNIT TERKAIT</td><td colSpan={3}>{units.map((u:string,i:number)=>(<div key={i}>{i+1}. {u}</div>))}</td></tr>
        </tbody>
      </table>
    </div>
  )
}