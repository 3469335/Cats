import { NextResponse } from 'next/server'
import { prisma, ensureConnection } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const isConnected = await ensureConnection()
    
    // Пробуем выполнить простой запрос (используем $queryRaw вместо конкретной модели)
    let canQuery = false
    try {
      await prisma.$queryRaw`SELECT 1`
      canQuery = true
    } catch (error) {
      console.error('Query test failed:', error)
    }

    return NextResponse.json({
      status: isConnected && canQuery ? 'ok' : 'error',
      databaseUrl: hasDatabaseUrl ? 'configured' : 'missing',
      connected: isConnected,
      canQuery,
      message: isConnected && canQuery 
        ? 'База данных доступна' 
        : 'Проблема с подключением к базе данных',
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error?.message || 'Неизвестная ошибка',
    }, { status: 500 })
  }
}
