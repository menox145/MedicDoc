import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json()
  const { id } = await params
  const updated = await prisma.spo.update({ where: { id }, data: {
    judul: body.judul, jenis: body.jenis, noDokumen: body.noDokumen, noRevisi: body.noRevisi,
    halaman: body.halaman, pengertian: body.pengertian, tujuan: body.tujuan,
    kebijakan: body.kebijakan, prosedur: body.prosedur, unitTerkait: body.unitTerkait,
    tglTerbit: new Date(body.tglTerbit)
  }})
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.spo.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}