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
}

if (!authConfig.hasAuthSecret) {
  console.error('[AUTH] AUTH_SECRET не установлен!')
}

if (!authConfig.hasClientId) {
  console.error('[AUTH] GOOGLE_CLIENT_ID не установлен!')
}

if (!authConfig.hasClientSecret) {
  console.error('[AUTH] GOOGLE_CLIENT_SECRET не установлен!')
}

if (!authConfig.hasDatabaseUrl) {
  console.error('[AUTH] DATABASE_URL не установлен!')
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
        console.log('[AUTH ADAPTER] Creating session:', { userId: data.userId })
        const result = await baseAdapter.createSession(data)
        console.log('[AUTH ADAPTER] Session created successfully')
        return result
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error creating session:', error)
        console.error('[AUTH ADAPTER] Session creation error details:', {
          message: error?.message,
          code: error?.code,
          meta: error?.meta,
          userId: data?.userId,
        })
        throw error
      }
    },
    async getSessionAndUser(sessionToken: string) {
      try {
        return await baseAdapter.getSessionAndUser(sessionToken)
      } catch (error: any) {
        console.error('[AUTH ADAPTER] Error getting session and user:', { sessionToken, error: error?.message })
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

// Проверка подключения к БД и таблиц перед инициализацией NextAuth
async function checkDatabaseSetup() {
  try {
    // Проверяем подключение
    await prisma.$queryRaw`SELECT 1`
    
    // Проверяем наличие необходимых таблиц
    const tables = ['users', 'accounts', 'sessions']
    for (const table of tables) {
      try {
        await prisma.$queryRawUnsafe(`SELECT 1 FROM ${table} LIMIT 1`)
        console.log(`[AUTH] Table ${table} exists and accessible`)
      } catch (error: any) {
        console.error(`[AUTH] Warning: Table ${table} may not exist:`, error?.message)
      }
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  secret: process.env.AUTH_SECRET,
  debug: true, // Включаем debug для детальных логов
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      try {
        // В NextAuth v5 используем token или user для получения ID
        if (session.user) {
          session.user.id = (user?.id as string) || (token?.sub as string) || ''
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
        // Сохраняем user ID в token при первом входе
        if (user) {
          token.id = user.id
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
