import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING
  const client = new PrismaClient(url ? { datasources: { db: { url } } } : undefined)

  return new Proxy(client, {
    get(target, prop) {
      if (typeof prop === 'string' && prop.startsWith('$')) {
        return (target as any)[prop]
      }

      const value = (target as any)[prop]

      if (typeof value === 'object' && value !== null) {
        return new Proxy(value, {
          get(modelTarget, methodProp) {
            const method = (modelTarget as any)[methodProp]
            if (typeof method === 'function') {
              return async (...args: any[]) => {
                try {
                  return await method(...args)
                } catch (e: any) {
                  if (e?.name === 'PrismaClientInitializationError') {
                    if (methodProp === 'findMany') return []
                    if (methodProp === 'count') return 0
                    return null
                  }
                  throw e
                }
              }
            }
            return method
          },
        })
      }

      return value
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
