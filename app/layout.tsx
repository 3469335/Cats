import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
