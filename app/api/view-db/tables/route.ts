import { NextResponse } from 'next/server'
import { prisma, ensureConnection } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Маппинг имен таблиц на модели Prisma (имя таблицы -> имя модели в Prisma)
const tableToModelMap: { [key: string]: string } = {
  User: 'user',
  Note: 'note',
  Cat: 'cat',
  Category: 'category',
  Tag: 'tag',
  Vote: 'vote',
}

export async function GET() {
  try {
    // Проверяем доступность Prisma
    if (!prisma) {
      return NextResponse.json(
        { error: 'Prisma Client не инициализирован' },
        { status: 500 }
      )
    }

    // Проверяем подключение к БД
    const isConnected = await ensureConnection()
    if (!isConnected) {
      return NextResponse.json(
        { 
          error: 'Не удалось подключиться к базе данных',
          details: 'Проверьте настройку DATABASE_URL в переменных окружения'
        },
        { status: 500 }
      )
    }

    // Проверяем наличие DATABASE_URL
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          error: 'DATABASE_URL не настроен',
          details: 'Добавьте DATABASE_URL в файл .env или переменные окружения'
        },
        { status: 500 }
      )
    }

    // Проверяем доступные модели
    const availableModels = Object.keys(prisma).filter(
      key => !key.startsWith('_') && !key.startsWith('$') && typeof (prisma as any)[key] === 'object'
    )
    console.log('Available Prisma models:', availableModels)

    const tables = await Promise.all(
      Object.entries(tableToModelMap).map(async ([tableName, modelName]) => {
        try {
          // Используем динамический доступ к моделям Prisma
          const model = (prisma as any)[modelName]
          if (!model) {
            console.warn(`Model ${modelName} not found. Available:`, availableModels)
            return { name: tableName, count: 0 }
          }

          // Проверяем наличие метода count
          if (typeof model.count !== 'function') {
            console.warn(`Model ${modelName} does not have count method`)
            return { name: tableName, count: 0 }
          }

          const count = await model.count()
          return { name: tableName, count }
        } catch (error: any) {
          console.error(`Error counting ${tableName}:`, error?.message || error)
          return { name: tableName, count: 0, error: error?.message }
        }
      })
    )

    return NextResponse.json({ tables })
  } catch (error: any) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка при получении списка таблиц',
        details: error?.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
