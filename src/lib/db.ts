import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma's engine cannot connect when Neon's default `channel_binding=require`
// is present in the URL, so drop that parameter.
const normalizeUrl = (raw?: string) => {
  if (!raw) return raw
  return raw
    .replace(/([?&])channel_binding=[^&]*&?/, '$1')
    .replace(/[?&]$/, '')
}

const createPrismaClient = () => {
  const url = normalizeUrl(
    process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING
  )
  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined)
}

const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
export default prisma
