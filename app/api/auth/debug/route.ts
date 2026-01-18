import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Детальная проверка переменных окружения
  const envDetails = {
    AUTH_SECRET: {
      exists: !!process.env.AUTH_SECRET,
      length: process.env.AUTH_SECRET?.length || 0,
      prefix: process.env.AUTH_SECRET?.substring(0, 10) || 'NOT_SET',
    },
    GOOGLE_CLIENT_ID: {
      exists: !!process.env.GOOGLE_CLIENT_ID,
      length: process.env.GOOGLE_CLIENT_ID?.length || 0,
      prefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || 'NOT_SET',
    },
    GOOGLE_CLIENT_SECRET: {
      exists: !!process.env.GOOGLE_CLIENT_SECRET,
      length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      prefix: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) || 'NOT_SET',
    },
    DATABASE_URL: {
      exists: !!process.env.DATABASE_URL,
      length: process.env.DATABASE_URL?.length || 0,
      prefix: process.env.DATABASE_URL?.substring(0, 30) || 'NOT_SET',
    },
    NEXTAUTH_URL: {
      exists: !!process.env.NEXTAUTH_URL,
      value: process.env.NEXTAUTH_URL || 'NOT_SET',
    },
  }

  const checks = {
    env: {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    },
    envDetails, // Добавляем детальную информацию
    database: {
      connected: false,
      error: null as string | null,
    },
    prismaAdapter: {
      initialized: false,
      error: null as string | null,
    },
  }

  // Проверка подключения к БД
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database.connected = true
  } catch (error: any) {
    checks.database.connected = false
    checks.database.error = error?.message || 'Unknown error'
  }

  // Проверка PrismaAdapter и необходимых таблиц
  try {
    const { PrismaAdapter } = await import('@auth/prisma-adapter')
    const adapter = PrismaAdapter(prisma)
    
    // Проверяем, что необходимые таблицы доступны (User, Account, Session)
    if (checks.database.connected) {
      try {
        // Проверяем наличие таблиц через простые запросы
        await prisma.$queryRaw`SELECT 1 FROM users LIMIT 1`.catch(() => {})
        await prisma.$queryRaw`SELECT 1 FROM accounts LIMIT 1`.catch(() => {})
        await prisma.$queryRaw`SELECT 1 FROM sessions LIMIT 1`.catch(() => {})
      } catch (tableError) {
        // Таблицы могут быть пустыми, это нормально
      }
    }
    
    checks.prismaAdapter.initialized = true
  } catch (error: any) {
    checks.prismaAdapter.initialized = false
    checks.prismaAdapter.error = error?.message || String(error) || 'Unknown error'
  }

  // Обязательные переменные окружения (NEXTAUTH_URL не обязателен для localhost)
  const requiredEnv = {
    AUTH_SECRET: checks.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: checks.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: checks.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: checks.env.DATABASE_URL,
  }
  const allRequiredEnvSet = Object.values(requiredEnv).every(v => v)
  const allChecksPass = allRequiredEnvSet && checks.database.connected && checks.prismaAdapter.initialized

  const recommendations: string[] = []
  
  if (!checks.env.AUTH_SECRET) {
    recommendations.push('❌ Установите AUTH_SECRET в переменных окружения (обязательно)')
  }
  if (!checks.env.GOOGLE_CLIENT_ID) {
    recommendations.push('❌ Установите GOOGLE_CLIENT_ID в переменных окружения (обязательно)')
  }
  if (!checks.env.GOOGLE_CLIENT_SECRET) {
    recommendations.push('❌ Установите GOOGLE_CLIENT_SECRET в переменных окружения (обязательно)')
  }
  if (!checks.env.DATABASE_URL) {
    recommendations.push('❌ Установите DATABASE_URL в переменных окружения (обязательно)')
  }
  if (!checks.env.NEXTAUTH_URL) {
    recommendations.push('⚠️ Для production рекомендуется установить NEXTAUTH_URL (не обязательно для localhost)')
  }
  if (!checks.database.connected) {
    recommendations.push(`❌ Проблема с подключением к БД: ${checks.database.error || 'Неизвестная ошибка'}`)
    recommendations.push('   - Проверьте, что DATABASE_URL правильный')
    recommendations.push('   - Для NeonDB используйте Connection Pooler URL (с -pooler)')
  }
  if (!checks.prismaAdapter.initialized) {
    recommendations.push(`❌ Ошибка PrismaAdapter: ${checks.prismaAdapter.error || 'Неизвестная ошибка'}`)
  }

  if (allChecksPass && checks.env.NEXTAUTH_URL) {
    recommendations.push('✅ Все проверки пройдены успешно!')
  } else if (allChecksPass) {
    recommendations.push('✅ Все обязательные проверки пройдены!')
    recommendations.push('💡 Для production рекомендуется установить NEXTAUTH_URL')
  }

  return NextResponse.json({
    status: allChecksPass ? 'ok' : 'error',
    checks: {
      ...checks,
      requiredEnv,
      allRequiredEnvSet,
      summary: {
        environment: allRequiredEnvSet ? 'ok' : 'error',
        database: checks.database.connected ? 'ok' : 'error',
        prismaAdapter: checks.prismaAdapter.initialized ? 'ok' : 'error',
        overall: allChecksPass ? 'ok' : 'error',
      },
    },
    recommendations,
    nextSteps: allChecksPass ? [
      'Проверьте, что redirect URI в Google Console совпадает с вашим доменом',
      'Для production: убедитесь, что NEXTAUTH_URL установлен',
      'Попробуйте войти через Google',
    ] : [
      'Исправьте указанные проблемы',
      'Перезапустите сервер после изменения переменных окружения',
      'Проверьте этот endpoint снова',
    ],
  })
}
