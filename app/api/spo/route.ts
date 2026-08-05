import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const unit = searchParams.get('unit')
  const role = searchParams.get('role')
  // If the database is not configured (eg. local dev without DATABASE_URL),
  // return an empty array instead of letting Prisma throw and crash the route.
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set — returning empty SPO list for GET /api/spo')
    return NextResponse.json([])
  }
  if (role === 'ADMIN') {
    const data = await prisma.spo.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(data)
  }
  const data = await prisma.spo.findMany({ where: { unit: unit || '' }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: 'Database tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const body = await req.json()
    // biar gak duplikat, cek dulu (findUnique requires a unique field; gunakan findFirst)
    let noDokumen = body.noDokumen
    const exists = await prisma.spo.findFirst({ where: { noDokumen } })
    if (exists) {
      // auto bikin unik pakai timestamp
      const suffix = Date.now().toString().slice(-4)
      noDokumen = noDokumen.replace(/-S0$/, `-${suffix}`)
      if (noDokumen === body.noDokumen) noDokumen = `${body.noDokumen}-${suffix}`
    }

    const spo = await prisma.spo.create({
      data: {
        judul: body.judul,
        jenis: body.jenis || 'SPO',
        noDokumen,
        noRevisi: body.noRevisi || '01',
        halaman: body.halaman || '1/2',
        tglTerbit: body.tglTerbit? new Date(body.tglTerbit) : new Date(),
        pengertian: body.pengertian,
        tujuan: body.tujuan,
        kebijakan: body.kebijakan || '',
        prosedur: body.prosedur,
        unitTerkait: body.unitTerkait || '',
        unit: body.unit,
      }
    })
    return NextResponse.json(spo)
  } catch (e: any) {
    console.error('POST /api/spo error:', e)
    // kalau masih P2002 (unique), kasih pesan jelas
    if (e.code === 'P2002') {
      return NextResponse.json({ error: `No Dokumen '${e.meta?.target}' sudah ada, ganti nomor lain` }, { status: 400 })
    }
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}