import { handlers } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Обертка для обработки ошибок в handlers
async function handleRequest(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
) {
  try {
    const url = new URL(req.url)
    
    // Логируем callback от OAuth провайдера
    if (url.pathname.includes('/callback/google')) {
      console.log('[AUTH API] ========== Google OAuth callback START ==========')
      console.log('[AUTH API] URL:', req.url)
      console.log('[AUTH API] Query params:', {
        hasCode: !!url.searchParams.get('code'),
        hasState: !!url.searchParams.get('state'),
        hasError: !!url.searchParams.get('error'),
        error: url.searchParams.get('error'),
        code: url.searchParams.get('code')?.substring(0, 20) + '...',
        state: url.searchParams.get('state')?.substring(0, 20) + '...',
      })
      
      // Проверяем конфигурацию при callback
      const config = {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
        authSecretLength: process.env.AUTH_SECRET?.length || 0,
        clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || 'NOT_SET',
        clientSecretPrefix: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) || 'NOT_SET',
      }
      console.log('[AUTH API] Configuration check at callback:', config)
      
      if (!config.hasClientId || !config.hasClientSecret || !config.hasAuthSecret) {
        console.error('[AUTH API] ❌ CRITICAL: Missing required credentials:', {
          hasClientId: config.hasClientId,
          hasClientSecret: config.hasClientSecret,
          hasAuthSecret: config.hasAuthSecret,
        })
      } else {
        console.log('[AUTH API] ✅ All credentials are present')
      }
    }
    
    console.log('[AUTH API] Calling NextAuth handler for:', url.pathname)
    const response = await handler(req)
    
    // Логируем детали ответа, особенно для callback
    const responseHeaders = Object.fromEntries(response.headers.entries())
    console.log('[AUTH API] Handler response:', {
      status: response.status,
      statusText: response.statusText,
      redirectLocation: responseHeaders.location || responseHeaders.Location || 'none',
      hasSetCookie: !!responseHeaders['set-cookie'] || !!responseHeaders['Set-Cookie'],
    })
    
    // Логируем все ответы для callback
    if (url.pathname.includes('/callback/google')) {
      console.log('[AUTH API] ========== Callback response details ==========')
      console.log('[AUTH API] Status:', response.status)
      console.log('[AUTH API] Headers:', {
        location: responseHeaders.location || responseHeaders.Location || 'none',
        'set-cookie': responseHeaders['set-cookie'] ? 'present' : 'none',
        'Set-Cookie': responseHeaders['Set-Cookie'] ? 'present' : 'none',
      })
      
      if (response.status >= 300 && response.status < 400) {
        const redirectTo = responseHeaders.location || responseHeaders.Location
        console.log('[AUTH API] ✅ OAuth callback successful! Redirecting to:', redirectTo)
      } else if (response.status === 200) {
        console.log('[AUTH API] ⚠️ Callback returned 200 instead of redirect - this might be a problem')
        console.log('[AUTH API] Response body preview:', response.body ? 'has body' : 'no body')
      }
      console.log('[AUTH API] ========== End callback response ==========')
    }
    
    // Логируем ошибки в ответе (редирект на /api/auth/error)
    if (response.status >= 400 || url.pathname.includes('/auth/error')) {
      console.error('[AUTH API] ❌ Error response:', {
        status: response.status,
        url: url.pathname,
        searchParams: Object.fromEntries(url.searchParams.entries()),
      })
      
      // Клонируем response для чтения body, если это возможно
      try {
        const clonedResponse = response.clone()
        const text = await clonedResponse.text()
        console.error('[AUTH API] Error response body:', text.substring(0, 500))
      } catch (e) {
        console.error('[AUTH API] Could not read error response body')
      }
    }
    
    if (url.pathname.includes('/callback/google')) {
      console.log('[AUTH API] ========== Google OAuth callback END ==========')
    }
    
    return response
  } catch (error: any) {
    console.error('[AUTH API] ❌❌❌ UNHANDLED ERROR in handleRequest:', error)
    console.error('[AUTH API] Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      name: error?.name,
      cause: error?.cause,
      url: req.url,
      method: req.method,
    })

    // Возвращаем понятную ошибку клиенту
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? error?.message 
          : 'Ошибка сервера. Проверьте логи.',
        details: process.env.NODE_ENV === 'development' 
          ? {
              stack: error?.stack,
              code: error?.code,
              name: error?.name,
            }
          : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(handlers.GET, req)
}

export async function POST(req: NextRequest) {
  return handleRequest(handlers.POST, req)
}
