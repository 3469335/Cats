import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const catId = params.id

    // Проверяем, что котик существует и публичный
    const cat = await prisma.cat.findUnique({
      where: { id: catId },
      select: { id: true, visibility: true },
    })

    if (!cat) {
      return NextResponse.json({ error: 'Котик не найден' }, { status: 404 })
    }

    if (cat.visibility !== 'PUBLIC') {
      return NextResponse.json(
        { error: 'Можно лайкать только публичные котики' },
        { status: 403 }
      )
    }

    // Проверяем, есть ли уже лайк от этого пользователя
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_catId: {
          userId,
          catId,
        },
      },
    })

    let liked: boolean
    if (existingVote) {
      // Удаляем лайк
      await prisma.vote.delete({
        where: {
          userId_catId: {
            userId,
            catId,
          },
        },
      })
      liked = false
    } else {
      // Создаем лайк
      await prisma.vote.create({
        data: {
          userId,
          catId,
          value: 1,
        },
      })
      liked = true
    }

    // Получаем общее количество лайков
    const likesCount = await prisma.vote.count({
      where: { catId },
    })

    return NextResponse.json({ liked, likesCount })
  } catch (error: any) {
    console.error('[LIKE API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Ошибка при обработке лайка' },
      { status: 500 }
    )
  }
}
