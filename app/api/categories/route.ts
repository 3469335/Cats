import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        category: 'asc',
      },
    })
    return NextResponse.json(categories)
  } catch (error: any) {
    console.error('[API CATEGORIES] Error:', error)
    return NextResponse.json({ error: 'Ошибка при получении категорий' }, { status: 500 })
  }
}
