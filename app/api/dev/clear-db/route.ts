import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import prisma from '../../../../lib/prisma'

// Dev-only utility: backup SQLite file (if DATABASE_URL points to a file)
async function tryBackupSqlite() {
  try {
    const dbUrl = process.env.DATABASE_URL || ''
    if (!dbUrl.startsWith('file:')) return null
    const dbPath = dbUrl.replace('file:', '')
    const absPath = path.resolve(process.cwd(), dbPath)
    if (!fs.existsSync(absPath)) return null
    const backupsDir = path.resolve(process.cwd(), 'prisma', 'backups')
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true })
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const dest = path.join(backupsDir, `dev.db.bak.${ts}.sqlite`)
    fs.copyFileSync(absPath, dest)
    return dest
  } catch (e) {
    return null
  }
}

export async function POST(req: NextRequest) {
  // simple safety: require ?confirm=true
  const url = new URL(req.url)
  if (url.searchParams.get('confirm') !== 'true') {
    return new Response(JSON.stringify({ error: 'Missing confirm=true query param' }), { status: 400 })
  }

  // only allow in non-production by default
  if (process.env.NODE_ENV === 'production') {
    return new Response(JSON.stringify({ error: 'Not allowed in production' }), { status: 403 })
  }

  const backupPath = await tryBackupSqlite()

  try {
    // delete all Spo records but keep User table intact
    await prisma.spo.deleteMany({})
    return new Response(JSON.stringify({ ok: true, backup: backupPath }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return new Response(JSON.stringify({ error: 'Use POST with ?confirm=true to clear DB' }), { status: 405 })
}
