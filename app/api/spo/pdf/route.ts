import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import puppeteer from 'puppeteer'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const jenis = searchParams.get('jenis')

    if (!process.env.DATABASE_URL || !prisma) {
      return new Response('Database not configured for PDF generation', { status: 400 })
    }

    let data: any[] = []
    if (id) {
      const single = await prisma.spo.findUnique({ where: { id } })
      if (!single) return new Response('Not found', { status: 404 })
      data = [single]
    } else if (jenis) {
      data = await prisma.spo.findMany({ where: { jenis }, orderBy: { createdAt: 'desc' } })
    } else {
      data = await prisma.spo.findMany({ orderBy: { createdAt: 'desc' } })
    }

    // If DATABASE_URL is not set (local dev), return a clear error instead of
    // letting Prisma throw during initialization.
    if (!process.env.DATABASE_URL) {
      return new Response('Database not configured for PDF generation', { status: 400 })
    }

    const logoPath = path.resolve(process.cwd(), 'public', 'logo.png')
    let logoDataUrl = ''
    try {
      const logoBuffer = await fs.promises.readFile(logoPath)
      logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`
    } catch (err) {
      console.warn('Logo not found at public/logo.png', err)
    }

    const htmlParts = data.map(d => {
      const units = d.unitTerkait? d.unitTerkait.split(', ').map((u:string,i:number)=>`<div>${i+1}. ${u}</div>`).join('') : '-'
      const escapeHtml = (str:string) => (str||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')

      return `
        <div class="doc">
          <table>
            <thead>
              <tr>
                <th rowspan="2" style="width:22%; text-align:center;">
                  ${logoDataUrl ? `<img src="${logoDataUrl}" style="width:60px; height:auto; margin-bottom:6px;" alt="Logo"/>` : `<div style="font-weight:900; color:#0ea5e9; font-size:14px">IHC</div><div style="font-size:9px; line-height:1.1">Rumah Sakit<br/>Pertamina Jaya</div>`}
                </th>
              
                <th colspan="3" style="text-align:center; font-size:20px; text-transform:uppercase;">${escapeHtml(d.judul)}</th>
              </tr>
              <tr>
                <th style="text-align:center; font-size:12px;">No. Dokumen<br/><span style="font-family:monospace; font-size:9px">${escapeHtml(d.noDokumen)}</span></th>
                <th style="text-align:center; font-size:12px;">No. Revisi<br/>${escapeHtml(d.noRevisi)}</th>
                <th style="text-align:center; font-size:12px; ">Halaman</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:800; text-align:center;">${d.jenis}</td>
                <td style="text-align:center; font-size:16px;">Tanggal Terbit :<br/><b>${new Date(d.tglTerbit).toLocaleDateString('id-ID')}</b></td>
                <td colspan="2" style="text-align:center; font-size:14px;">Ditetapkan oleh :<br/>Direktur<br/><br/><br/><div style="margin-top:20px; font-weight:700">dr. Dedy Waskita, MHPM</div></td>
              </tr>
              <tr><td class="label">PENGERTIAN</td><td colspan="3"><div class="content large">${escapeHtml(d.pengertian)}</div></td></tr>
              <tr><td class="label">TUJUAN</td><td colspan="3"><div class="content large">${escapeHtml(d.tujuan)}</div></td></tr>
              <tr><td class="label">KEBIJAKAN</td><td colspan="3"><div class="content large">${escapeHtml(d.kebijakan)}</div></td></tr>
              <tr><td class="label">PROSEDUR</td><td colspan="3"><div class="content long large">${escapeHtml(d.prosedur)}</div></td></tr>
              <tr><td class="label">UNIT TERKAIT</td><td colspan="3"><div class="content large">${units}</div></td></tr>
            </tbody>
          </table>
        </div>
      `
    }).join('')

    const html = `
      <html><head><meta charset="utf-8"/>
      <style>
        @page { size: A4; margin: 14mm 12mm 20mm 12mm; }
        html, body { margin:0; padding:0; font-family: 'Times New Roman', Times, serif; font-size:11px; color:#000; }
       .doc { page-break-after: always; }
       .doc:last-child { page-break-after: auto; }
        table { width:100%; border-collapse:collapse; table-layout:fixed; }
        th, td { border:1.2px solid #000; padding:6px 8px; vertical-align:top; word-wrap:break-word; }
        th { background:#f8fafc; }
        thead { display: table-header-group; } /* header ngulang tiap halaman */
        tbody { display: table-row-group; }
        tr { page-break-inside: auto; } /* INI KUNCINYA: boleh kepotong */
        td { page-break-inside: auto; }
      .label { font-weight:700; background:#f8fafc; width:22%; font-size:16px; }
      .content { white-space: pre-line; line-height:1.4; font-size:11px; }
      .content.long { white-space: pre-line; }
      .content.large { font-size:13px; }
        /* hapus semua avoid-break yang bikin kosong */
      </style></head>
      <body>${htmlParts}</body></html>
    `

    const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `<div style="font-size:9px; width:100%; padding:0 18mm; display:flex; justify-content:space-between; color:#666;"><span>Dicetak dari SPO System - RS Pertamina Jaya</span><span>Halaman <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
      margin: { top: '10mm', bottom: '18mm', left: '10mm', right: '10mm' }
    })
    await browser.close()

    return new Response(pdf as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="SPO-${id||jenis||'all'}.pdf"`
      }
    })
  } catch (e:any) {
    console.error(e)
    return new Response('Gagal generate PDF: '+e.message, { status: 500 })
  }
}