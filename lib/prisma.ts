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

// Закрываем соединение при завершении процесса (только для Node.js, не для Edge Runtime)
// Обернуто в try-catch для безопасности в Edge Runtime
try {
  if (
    typeof process !== 'undefined' &&
    process.on &&
    typeof window === 'undefined' &&
    // Edge Runtime не имеет process.versions.node
    typeof (process as any).versions?.node !== 'undefined'
  ) {
    process.on('beforeExit', async () => {
      await prisma.$disconnect()
    })
  }
} catch (error) {
  // Игнорируем ошибки в Edge Runtime
  // В serverless окружениях соединения закрываются автоматически
}

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
