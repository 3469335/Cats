import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET
  const hasAuthSecret = !!process.env.AUTH_SECRET
  const hasDatabaseUrl = !!process.env.DATABASE_URL
  const hasNextAuthUrl = !!process.env.NEXTAUTH_URL

  const clientIdValue = process.env.GOOGLE_CLIENT_ID || ''
  const clientIdLength = clientIdValue.length
  const clientIdPrefix = clientIdValue.substring(0, 10) + '...'

  const callbackUrl = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    : `http://localhost:3000/api/auth/callback/google`

  const allSet = hasClientId && hasClientSecret && hasAuthSecret && hasDatabaseUrl

  const issues: string[] = []
  const warnings: string[] = []
  
  if (!hasClientId) issues.push('GOOGLE_CLIENT_ID не установлен')
  if (!hasClientSecret) issues.push('GOOGLE_CLIENT_SECRET не установлен')
  if (!hasAuthSecret) issues.push('AUTH_SECRET не установлен')
  if (!hasDatabaseUrl) issues.push('DATABASE_URL не установлен')
  
  // NEXTAUTH_URL не обязателен для локальной разработки, но полезен для production
  if (!hasNextAuthUrl) {
    warnings.push('NEXTAUTH_URL не установлен (не обязательно для localhost, но рекомендуется для production)')
  }
  
  if (hasClientId && clientIdLength < 20) {
    issues.push('GOOGLE_CLIENT_ID кажется слишком коротким (должно быть ~50+ символов)')
  }
  if (hasClientSecret && process.env.GOOGLE_CLIENT_SECRET!.length < 20) {
    issues.push('GOOGLE_CLIENT_SECRET кажется слишком коротким (должно быть ~50+ символов)')
  }

  return NextResponse.json({
    status: allSet && issues.length === 0 ? 'ok' : 'error',
    config: {
      hasClientId,
      hasClientSecret,
      hasAuthSecret,
      hasDatabaseUrl,
      hasNextAuthUrl,
      allSet,
    },
    details: {
      clientIdLength: hasClientId ? clientIdLength : 0,
      clientIdPreview: hasClientId ? clientIdPrefix : 'не установлен',
      authSecretLength: hasAuthSecret ? process.env.AUTH_SECRET!.length : 0,
      databaseUrlSet: hasDatabaseUrl,
    },
    callbackUrl,
    redirectUri: 'Добавьте в Google Console: ' + callbackUrl,
    issues,
    warnings,
    recommendations: allSet && issues.length === 0 
      ? [
          'Все настройки выглядят правильно!',
          'Проверьте redirect URI в Google Console.',
          ...(warnings.length > 0 ? ['Для production рекомендуется добавить NEXTAUTH_URL в .env'] : [])
        ]
      : [
          'Добавьте недостающие переменные в .env файл',
          'Перезапустите dev-сервер после изменения .env',
          'Убедитесь, что redirect URI в Google Console точно совпадает с callbackUrl выше',
        ],
  })
}
