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

// Инициализация adapter с обработкой ошибок
let adapter
try {
  adapter = PrismaAdapter(prisma)
  console.log('[AUTH] PrismaAdapter инициализирован успешно')
} catch (error: any) {
  console.error('[AUTH] Ошибка при инициализации PrismaAdapter:', error)
  console.error('[AUTH] Error details:', {
    message: error?.message,
    stack: error?.stack,
    code: error?.code,
  })
  throw error
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
