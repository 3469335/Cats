import { handlers } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Обертка для обработки ошибок в handlers
async function handleRequest(
  handler: (req: NextRequest) => Promise<Response>,
  req: NextRequest
) {
  try {
    return await handler(req)
  } catch (error: any) {
    console.error('[AUTH API] Unhandled error:', error)
    console.error('[AUTH API] Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      name: error?.name,
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
