import { NextRequest, NextResponse } from 'next/server'
import { prisma, ensureConnection } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Проверка подключения перед выполнением запросов
async function checkConnection() {
  const isConnected = await ensureConnection()
  if (!isConnected) {
    throw new Error('Не удалось подключиться к базе данных. Проверьте DATABASE_URL.')
  }
}

// Маппинг имен таблиц на модели Prisma
const modelMap: { [key: string]: string } = {
  User: 'user',
  Note: 'note',
  Cat: 'cat',
  Category: 'category',
  Tag: 'tag',
  Vote: 'vote',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    await checkConnection()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const skip = (page - 1) * pageSize

    const tableName = params.table
    const modelName = modelMap[tableName]

    if (!modelName) {
      return NextResponse.json(
        { error: 'Таблица не найдена' },
        { status: 404 }
      )
    }

    const model = (prisma as any)[modelName]
    if (!model) {
      return NextResponse.json(
        { error: 'Модель не найдена' },
        { status: 404 }
      )
    }

    const [data, totalCount] = await Promise.all([
      model.findMany({
        skip,
        take: pageSize,
        orderBy: { id: 'asc' },
      }),
      model.count(),
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return NextResponse.json({
      data,
      totalCount,
      totalPages,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Error fetching table data:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении данных таблицы' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    await checkConnection()
    
    const tableName = params.table
    const modelName = modelMap[tableName]

    if (!modelName) {
      return NextResponse.json(
        { error: 'Таблица не найдена' },
        { status: 404 }
      )
    }

    const model = (prisma as any)[modelName]
    if (!model) {
      return NextResponse.json(
        { error: 'Модель не найдена' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Удаляем пустые поля
    const cleanData = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    )

    const created = await model.create({
      data: cleanData,
    })

    return NextResponse.json({ data: created })
  } catch (error: any) {
    console.error('Error creating record:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при создании записи' },
      { status: 500 }
    )
  }
}
