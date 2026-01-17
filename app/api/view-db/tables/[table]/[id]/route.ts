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

export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    await checkConnection()
    
    const tableName = params.table
    const id = params.id
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

    // Удаляем пустые поля и id
    const { id: _, ...cleanData } = Object.fromEntries(
      Object.entries(body).filter(([k, v]) => k !== 'id' && v !== '' && v !== null && v !== undefined)
    )

    const updated = await model.update({
      where: { id },
      data: cleanData,
    })

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    console.error('Error updating record:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при обновлении записи' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string; id: string } }
) {
  try {
    await checkConnection()
    
    const tableName = params.table
    const id = params.id
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

    await model.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting record:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при удалении записи' },
      { status: 500 }
    )
  }
}
