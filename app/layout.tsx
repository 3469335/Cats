import type { Metadata } from 'next'
import './globals.css'
import { AuthSessionProvider } from '@/components/session-provider'

export const metadata: Metadata = {
  title: 'Cats - сервис обмена информацией о котиках',
  description: 'Минимальный проект Next.js + Prisma + NeonDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  )
}
