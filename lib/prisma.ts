// lib/prisma.ts
import path from 'path'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveSqliteUrl(url: string) {
  if (!url.startsWith('file:')) return url
  const sqlitePath = url.slice('file:'.length)
  const resolvedPath = path.isAbsolute(sqlitePath)
    ? sqlitePath
    : path.resolve(process.cwd(), sqlitePath)
  return `file:${resolvedPath}`
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolveSqliteUrl(process.env.DATABASE_URL)
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma