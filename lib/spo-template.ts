export function renderSpoHtml(d: any, logoDataUrl: string, pageInfo?: { current: number, total: number }) {
  const escape = (s: string) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const units = d.unitTerkait? d.unitTerkait.split(',').map((u:string,i:number)=>`<div>${i+1}. ${escape(u.trim())}</div>`).join('') : '-'
  const halamanText = pageInfo? `${pageInfo.current} / ${pageInfo.total}` : escape(d.halaman || '1/1')

  return `
  <table>
    <thead>
      <tr>
        <th rowspan="2" style="width:22%; text-align:center;">
          ${logoDataUrl? `<img src="${logoDataUrl}" style="width:75px"/>` : `<div style="font-weight:900; color:#0ea5e9;">IHC</div><div style="font-size:8px">Rumah Sakit Pertamina Jaya</div>`}
        </th>
        <th colspan="3" style="text-align:center; font-size:13px; text-transform:uppercase;">${escape(d.judul)}</th>
      </tr>
      <tr>
        <th style="text-align:center; font-size:10px; width:26%;">No. Dokumen<br/><span style="font-family:monospace; font-size:9px">${escape(d.noDokumen)}</span></th>
        <th style="text-align:center; font-size:10px; width:18%;">No. Revisi<br/>${escape(d.noRevisi)}</th>
        <th style="text-align:center; font-size:10px; width:18%; background:#fef9c3;">Halaman<br/><b>${halamanText}</b></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="font-weight:800; text-align:center;">${escape(d.jenis)}</td>
        <td style="text-align:center; font-size:10px;">Tanggal Terbit :<br/><b>${new Date(d.tglTerbit).toLocaleDateString('id-ID')}</b></td>
        <td colspan="2" style="text-align:center; font-size:10px;">Ditetapkan oleh :<br/>Direktur<br/><div style="margin-top:18px; font-weight:700">dr. Dedy Waskita, MHPM</div></td>
      </tr>
      <tr><td class="label">PENGERTIAN</td><td colspan="3"><div class="content">${escape(d.pengertian)}</div></td></tr>
      <tr><td class="label">TUJUAN</td><td colspan="3"><div class="content">${escape(d.tujuan)}</div></td></tr>
      <tr><td class="label">KEBIJAKAN</td><td colspan="3"><div class="content">${escape(d.kebijakan)}</div></td></tr>
      <tr><td class="label">PROSEDUR</td><td colspan="3"><div class="content">${escape(d.prosedur)}</div></td></tr>
      <tr><td class="label">UNIT TERKAIT</td><td colspan="3"><div class="content">${units}</div></td></tr>
    </tbody>
  </table>`
}