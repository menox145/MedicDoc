import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  if (!prisma) {
    return NextResponse.json({ error: 'Database tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { username, password, role, unit } = body
    if(!username || !password || !role) return NextResponse.json({ error: 'username, password, role diperlukan' }, { status: 400 })

    const user = await prisma.user.create({ data: { username, password, role, unit: unit||'' } })
    return NextResponse.json(user)
  } catch (e:any) {
    console.error('create-user error', e)
    if(e.code === 'P2002') return NextResponse.json({ error: `User '${e.meta?.target}' sudah ada` }, { status: 400 })
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
