import { auth } from '@/auth'

/**
 * Получить текущего авторизованного пользователя (server-side)
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

/**
 * Получить ID текущего пользователя
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * Проверить, авторизован ли пользователь
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Требовать авторизации (бросает ошибку если не авторизован)
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
