import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Примечание: process.on убран, так как:
// 1. Edge Runtime не поддерживает process.on
// 2. В serverless окружениях (Vercel) соединения закрываются автоматически
// 3. Prisma Client управляет соединениями автоматически

// Проверка и переподключение к базе данных
export async function ensureConnection(): Promise<boolean> {
  try {
    // Проверяем, доступен ли DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL не установлен')
      return false
    }

    // Пробуем выполнить простой запрос для проверки подключения
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error: any) {
    console.error('Error checking database connection:', error)
    
    // Если соединение закрыто, пытаемся переподключиться
    if (error?.code === 'P1001' || error?.message?.includes('Closed')) {
      try {
        await prisma.$connect()
        await prisma.$queryRaw`SELECT 1`
        return true
      } catch (reconnectError) {
        console.error('Failed to reconnect:', reconnectError)
        return false
      }
    }
    
    return false
  }
}
