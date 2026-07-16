// app/api/auth/login/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const users = await prisma.user.findMany();
    console.log('Semua user di DB:', users);

    const user = await prisma.user.findUnique({ where: { username } });
    
    if(!user) {
      return NextResponse.json({ error: `User ${username} tidak ditemukan. User yang ada: ${users.map((u: any)=>u.username).join(', ')}` }, { status: 401 });
    }

    if(user.password !== password) {
      return NextResponse.json({ error: `Password salah` }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}