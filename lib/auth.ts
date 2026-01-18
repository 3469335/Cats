import { auth } from '@/auth'

/**
 * Получить текущего авторизованного пользователя (server-side)
 */
export async function getCurrentUser() {
  try {
    const session = await auth()
    if (session?.user) {
      console.log('[AUTH] getCurrentUser: User found:', {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      })
      return session.user
    } else {
      console.log('[AUTH] getCurrentUser: No session or user')
      return null
    }
  } catch (error: any) {
    console.error('[AUTH] getCurrentUser error:', {
      message: error?.message,
      stack: error?.stack,
    })
    return null
  }
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
