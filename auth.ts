import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// Проверка конфигурации при инициализации
const authConfig = {
  hasAuthSecret: !!process.env.AUTH_SECRET,
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
  clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
  authSecretLength: process.env.AUTH_SECRET?.length || 0,
}

console.log('[AUTH] Configuration check:', {
  hasAuthSecret: authConfig.hasAuthSecret,
  hasClientId: authConfig.hasClientId,
  hasClientSecret: authConfig.hasClientSecret,
  hasDatabaseUrl: authConfig.hasDatabaseUrl,
  clientIdLength: authConfig.clientIdLength,
  clientSecretLength: authConfig.clientSecretLength,
  authSecretLength: authConfig.authSecretLength,
})

if (!authConfig.hasAuthSecret) {
  console.error('[AUTH] ❌ AUTH_SECRET не установлен!')
}

if (!authConfig.hasClientId) {
  console.error('[AUTH] ❌ GOOGLE_CLIENT_ID не установлен!')
} else if (authConfig.clientIdLength < 20) {
  console.error('[AUTH] ⚠️ GOOGLE_CLIENT_ID кажется слишком коротким (должно быть ~50+ символов)')
}

if (!authConfig.hasClientSecret) {
  console.error('[AUTH] ❌ GOOGLE_CLIENT_SECRET не установлен!')
} else if (authConfig.clientSecretLength < 20) {
  console.error('[AUTH] ⚠️ GOOGLE_CLIENT_SECRET кажется слишком коротким (должно быть ~50+ символов)')
}

if (!authConfig.hasDatabaseUrl) {
  console.error('[AUTH] ❌ DATABASE_URL не установлен!')
}

// Создание обертки для PrismaAdapter с логированием и обработкой ошибок
function createAdapterWithLogging() {
  const baseAdapter = PrismaAdapter(prisma)
  
  return {
    ...baseAdapter,
    async createUser(data: any) {
      try {
        console.log('[AUTH ADAPTER] Creating user:', { email: data.email, name: data.name })
        const result = await baseAdapter.createUser(data)
        console.log('[AUTH ADAPTER] User created successfully:', { id: result.id, email: result.email })
        return result
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error creating user:', error)
        console.error('[AUTH ADAPTER] User creation error details:', {
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
          email: data?.email,
        })
        throw error
      }
    },
    async getUser(id: string) {
      try {
        return await baseAdapter.getUser(id)
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error getting user:', { id, error: error?.message })
        throw error
      }
    },
    async getUserByEmail(email: string) {
      try {
        return await baseAdapter.getUserByEmail(email)
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error getting user by email:', { email, error: error?.message })
        throw error
      }
    },
    async getUserByAccount({ providerAccountId, provider }: any) {
      try {
        return await baseAdapter.getUserByAccount({ providerAccountId, provider })
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error getting user by account:', { providerAccountId, provider, error: error?.message })
        throw error
      }
    },
    async updateUser(data: any) {
      try {
        return await baseAdapter.updateUser(data)
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error updating user:', { id: data.id, error: error?.message })
        throw error
      }
    },
    async linkAccount(data: any) {
      try {
        console.log('[AUTH ADAPTER] Linking account:', { userId: data.userId, provider: data.provider })
        const result = await baseAdapter.linkAccount(data)
        console.log('[AUTH ADAPTER] Account linked successfully')
        return result
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error linking account:', error)
        console.error('[AUTH ADAPTER] Link account error details:', {
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
          userId: data?.userId,
          provider: data?.provider,
        })
        throw error
      }
    },
    async createSession(data: any) {
      try {
        console.log('[AUTH ADAPTER] ========== Creating session START ==========')
        console.log('[AUTH ADAPTER] Session data:', { 
          userId: data.userId,
          expires: data.expires,
          sessionToken: data.sessionToken?.substring(0, 20) + '...',
        })
        
        // Проверяем подключение к БД перед созданием сессии
        try {
          await prisma.$queryRaw`SELECT 1`
          console.log('[AUTH ADAPTER] Database connection: OK')
        } catch (dbError: any) {
          console.error('[AUTH ADAPTER] ❌ Database connection failed:', {
            message: dbError?.message,
            code: dbError?.code,
          })
        }
        
        const result = await baseAdapter.createSession(data)
        console.log('[AUTH ADAPTER] ✅ Session created successfully:', {
          sessionToken: result.sessionToken?.substring(0, 20) + '...',
          userId: result.userId,
          expires: result.expires,
        })
        console.log('[AUTH ADAPTER] ========== Creating session END ==========')
        return result
      } catch (error: any) {
        console.error('[AUTH ADAPTER] ❌❌❌ Error creating session:', error)
        console.error('[AUTH ADAPTER] Session creation error details:', {
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
          userId: data?.userId,
          stack: error?.stack,
          name: error?.name,
        })
        console.error('[AUTH ADAPTER] ========== Creating session FAILED ==========')
        throw error
      }
    },
    async getSessionAndUser(sessionToken: string) {
      try {
        console.log('[AUTH ADAPTER] ========== Getting session and user START ==========')
        console.log('[AUTH ADAPTER] Session token (preview):', sessionToken?.substring(0, 30) + '...')
        console.log('[AUTH ADAPTER] Session token length:', sessionToken?.length)
        
        if (!sessionToken || sessionToken.trim() === '') {
          console.error('[AUTH ADAPTER] ❌ Session token is empty or null!')
          return null
        }
        
        const result = await baseAdapter.getSessionAndUser(sessionToken)
        if (result) {
          console.log('[AUTH ADAPTER] ✅ Session and user found:', {
            userId: result.user?.id,
            userEmail: result.user?.email,
            sessionExpires: result.session?.expires,
            sessionToken: result.session?.sessionToken?.substring(0, 30) + '...',
          })
        } else {
          console.log('[AUTH ADAPTER] ⚠️ Session and user NOT FOUND in database')
          console.log('[AUTH ADAPTER] Searching for session token:', sessionToken?.substring(0, 30) + '...')
          
          // Проверяем, есть ли вообще сессии в БД
          try {
            const allSessions = await prisma.session.findMany({
              take: 5,
              orderBy: { expires: 'desc' },
              select: {
                sessionToken: true,
                userId: true,
                expires: true,
              },
            })
            console.log('[AUTH ADAPTER] Recent sessions in DB:', allSessions.map(s => ({
              tokenPreview: s.sessionToken?.substring(0, 30) + '...',
              userId: s.userId,
              expires: s.expires,
            })))
          } catch (dbError: any) {
            console.error('[AUTH ADAPTER] Error checking sessions in DB:', dbError?.message)
          }
        }
        console.log('[AUTH ADAPTER] ========== Getting session and user END ==========')
        return result
      } catch (error: any) {
        console.error('[AUTH ADAPTER] ❌❌❌ Error getting session and user:', error)
        console.error('[AUTH ADAPTER] Error details:', {
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
          stack: error?.stack,
          sessionToken: sessionToken?.substring(0, 30) + '...',
        })
        console.error('[AUTH ADAPTER] ========== Getting session and user FAILED ==========')
        throw error
      }
    },
    async updateSession(data: any) {
      try {
        return await baseAdapter.updateSession(data)
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error updating session:', error)
        throw error
      }
    },
    async deleteSession(sessionToken: string) {
      try {
        return await baseAdapter.deleteSession(sessionToken)
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error deleting session:', { sessionToken, error: error?.message })
        throw error
      }
    },
  }
}

// Инициализация adapter с обработкой ошибок
let adapter
try {
  adapter = createAdapterWithLogging()
  console.log('[AUTH] PrismaAdapter инициализирован успешно с логированием')
} catch (error: any) {
  console.error('[AUTH] Ошибка при инициализации PrismaAdapter:', error)
  console.error('[AUTH] Error details:', {
    message: error?.message,
    stack: error?.stack,
    code: error?.code,
  })
  throw error
}

// Проверка подключения к БД перед инициализацией NextAuth
async function checkDatabaseSetup() {
  try {
    // Проверяем подключение к БД
    await prisma.$queryRaw`SELECT 1`
    console.log('[AUTH] Database connection check: OK')
    
    // Проверяем наличие необходимых таблиц через безопасные запросы
    try {
      // Проверяем таблицу users
      await prisma.user.findFirst({ take: 1 }).catch(() => null)
      console.log('[AUTH] Table users: accessible')
    } catch (error: any) {
      console.error('[AUTH] Warning: Table users may not exist:', error?.message)
    }
    
    try {
      // Проверяем таблицу accounts
      await prisma.account.findFirst({ take: 1 }).catch(() => null)
      console.log('[AUTH] Table accounts: accessible')
    } catch (error: any) {
      console.error('[AUTH] Warning: Table accounts may not exist:', error?.message)
    }
    
    try {
      // Проверяем таблицу sessions
      await prisma.session.findFirst({ take: 1 }).catch(() => null)
      console.log('[AUTH] Table sessions: accessible')
    } catch (error: any) {
      console.error('[AUTH] Warning: Table sessions may not exist:', error?.message)
    }
  } catch (error: any) {
    console.error('[AUTH] Database setup check failed:', error)
    console.error('[AUTH] Database error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    // Не бросаем ошибку, чтобы приложение могло запуститься
    // Проблемы будут видны в логах при попытке авторизации
  }
}

// Проверяем БД при инициализации (асинхронно, не блокируем)
checkDatabaseSetup().catch((error) => {
  console.error('[AUTH] Error in database setup check:', error)
})

// Валидация обязательных переменных окружения перед инициализацией NextAuth
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const authSecret = process.env.AUTH_SECRET

if (!googleClientId || googleClientId.trim() === '') {
  console.error('[AUTH] ❌ CRITICAL: GOOGLE_CLIENT_ID is missing or empty!')
  throw new Error('GOOGLE_CLIENT_ID is required but not set in environment variables')
}

if (!googleClientSecret || googleClientSecret.trim() === '') {
  console.error('[AUTH] ❌ CRITICAL: GOOGLE_CLIENT_SECRET is missing or empty!')
  throw new Error('GOOGLE_CLIENT_SECRET is required but not set in environment variables')
}

if (!authSecret || authSecret.trim() === '') {
  console.error('[AUTH] ❌ CRITICAL: AUTH_SECRET is missing or empty!')
  throw new Error('AUTH_SECRET is required but not set in environment variables')
}

console.log('[AUTH] ✅ All required environment variables are set:', {
  hasClientId: !!googleClientId,
  hasClientSecret: !!googleClientSecret,
  hasAuthSecret: !!authSecret,
  clientIdLength: googleClientId?.length,
  clientSecretLength: googleClientSecret?.length,
  authSecretLength: authSecret?.length,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  secret: authSecret,
  debug: true, // Включаем debug для детальных логов
  trustHost: true, // Доверяем хост для production
  session: {
    strategy: 'database', // Используем database adapter для сессий
  },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      checks: ['pkce', 'state'],
    }),
  ],
  callbacks: {
    async authorized({ auth, request }) {
      // Этот callback вызывается для проверки авторизации в middleware
      // В NextAuth v5 с database adapter, этот callback может не вызываться для всех запросов
      // Middleware использует req.auth напрямую
      const isLoggedIn = !!auth
      if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/dashboard') {
        console.log('[AUTH] authorized callback:', {
          pathname: request.nextUrl.pathname,
          isLoggedIn,
          userEmail: auth?.user?.email,
          userId: auth?.user?.id,
        })
      }
      // Возвращаем true для авторизованных, false для неавторизованных
      // Но middleware сам проверяет req.auth, так что это может не использоваться
      return isLoggedIn
    },
    async session({ session, token, user }) {
      try {
        console.log('[AUTH] Session callback called:', {
          hasSession: !!session,
          hasUser: !!user,
          hasToken: !!token,
          userEmail: session?.user?.email,
          userId: user?.id,
          tokenSub: token?.sub,
        })
        
        // В NextAuth v5 используем token или user для получения ID
        if (session.user) {
          session.user.id = (user?.id as string) || (token?.sub as string) || (token?.id as string) || ''
          console.log('[AUTH] Session callback: User ID set to:', session.user.id)
        }
        
        return session
      } catch (error: any) {
        console.error('[AUTH] Error in session callback:', error)
        console.error('[AUTH] Session error details:', {
          message: error?.message,
          stack: error?.stack,
          session: session?.user?.email,
        })
        // Возвращаем session даже при ошибке, чтобы не блокировать авторизацию
        return session
      }
    },
    async jwt({ token, user, account }) {
      try {
        console.log('[AUTH] JWT callback called:', {
          hasToken: !!token,
          hasUser: !!user,
          hasAccount: !!account,
          userId: user?.id,
          tokenSub: token?.sub,
        })
        
        // Сохраняем user ID в token при первом входе
        if (user) {
          token.id = user.id
          token.sub = user.id // Также устанавливаем sub для совместимости
          console.log('[AUTH] JWT callback: User ID saved to token:', user.id)
        }
        
        return token
      } catch (error: any) {
        console.error('[AUTH] Error in jwt callback:', error)
        console.error('[AUTH] JWT error details:', {
          message: error?.message,
          stack: error?.stack,
          userId: user?.id,
        })
        // Возвращаем token даже при ошибке
        return token
      }
    },
  },
  pages: {
    signIn: '/login',
  },
  events: {
    async signIn({ user, account, profile }) {
      try {
        console.log('[AUTH] Sign in:', { 
          userId: user?.id, 
          email: user?.email, 
          provider: account?.provider,
          accountId: account?.providerAccountId,
        })
      } catch (error: any) {
        console.error('[AUTH] Error in signIn event:', error)
        console.error('[AUTH] SignIn event error details:', {
          message: error?.message,
          stack: error?.stack,
          userId: user?.id,
        })
      }
    },
    async signOut() {
      try {
        console.log('[AUTH] Sign out')
      } catch (error: any) {
        console.error('[AUTH] Error in signOut event:', error)
      }
    },
  },
})
