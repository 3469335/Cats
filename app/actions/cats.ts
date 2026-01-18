'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createCat(data: { title: string; content: string; description?: string; categoryId: string }) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('Не авторизован')
    }

    // Получаем первую категорию или создаем дефолтную
    let category = await prisma.category.findFirst()
    if (!category) {
      category = await prisma.category.create({
        data: {
          category: 'Общее',
        },
      })
    }

    const cat = await prisma.cat.create({
      data: {
        title: data.title,
        content: data.content,
        description: data.description,
        ownerId: userId,
        categoryId: data.categoryId || category.id,
        visibility: 'PRIVATE',
        isFavorite: false,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')
    return { success: true, data: cat }
  } catch (error: any) {
    console.error('[CREATE CAT] Error:', error)
    return { success: false, error: error.message || 'Ошибка при создании котика' }
  }
}

export async function updateCat(catId: string, data: { title?: string; content?: string; description?: string }) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('Не авторизован')
    }

    // Проверяем, что котик принадлежит пользователю
    const existing = await prisma.cat.findFirst({
      where: { id: catId, ownerId: userId },
    })

    if (!existing) {
      throw new Error('Котик не найден или нет доступа')
    }

    const cat = await prisma.cat.update({
      where: { id: catId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.description !== undefined && { description: data.description }),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')
    return { success: true, data: cat }
  } catch (error: any) {
    console.error('[UPDATE CAT] Error:', error)
    return { success: false, error: error.message || 'Ошибка при обновлении котика' }
  }
}

export async function deleteCat(catId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('Не авторизован')
    }

    // Проверяем, что котик принадлежит пользователю
    const existing = await prisma.cat.findFirst({
      where: { id: catId, ownerId: userId },
    })

    if (!existing) {
      throw new Error('Котик не найден или нет доступа')
    }

    await prisma.cat.delete({
      where: { id: catId },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')
    return { success: true }
  } catch (error: any) {
    console.error('[DELETE CAT] Error:', error)
    return { success: false, error: error.message || 'Ошибка при удалении котика' }
  }
}

export async function togglePublic(catId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('Не авторизован')
    }

    const existing = await prisma.cat.findFirst({
      where: { id: catId, ownerId: userId },
    })

    if (!existing) {
      throw new Error('Котик не найден или нет доступа')
    }

    const newVisibility = existing.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
    const cat = await prisma.cat.update({
      where: { id: catId },
      data: {
        visibility: newVisibility,
        ...(newVisibility === 'PUBLIC' && !existing.publishedAt ? { publishedAt: new Date() } : {}),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')
    return { success: true, data: cat }
  } catch (error: any) {
    console.error('[TOGGLE PUBLIC] Error:', error)
    return { success: false, error: error.message || 'Ошибка при изменении видимости' }
  }
}

export async function toggleFavorite(catId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('Не авторизован')
    }

    const existing = await prisma.cat.findFirst({
      where: { id: catId, ownerId: userId },
    })

    if (!existing) {
      throw new Error('Котик не найден или нет доступа')
    }

    const cat = await prisma.cat.update({
      where: { id: catId },
      data: {
        isFavorite: !existing.isFavorite,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/public')
    revalidatePath('/dashboard/favorites')
    return { success: true, data: cat }
  } catch (error: any) {
    console.error('[TOGGLE FAVORITE] Error:', error)
    return { success: false, error: error.message || 'Ошибка при изменении избранного' }
  }
}
