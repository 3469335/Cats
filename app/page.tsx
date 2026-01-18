import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { SignOutButton } from '@/components/sign-out-button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getNotes() {
  try {
    console.log('[HOME] Fetching notes from database...')
    const notes = await prisma.note.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    console.log('[HOME] Notes fetched successfully:', notes.length)
    return { notes, error: null }
  } catch (error) {
    console.error('[HOME] Error fetching notes:', error)
    return { 
      notes: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export default async function Home() {
  console.log('[HOME] Loading home page...')
  const user = await getCurrentUser()
  console.log('[HOME] User status:', { authenticated: !!user, userId: user?.id })
  
  const { notes, error } = await getNotes()

  return (
    <div className="container">
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Cats - сервис обмена информацией о котиках</h1>
          <p>Минимальный проект Next.js + Prisma + NeonDB (PostgreSQL)</p>
          {user && (
            <p style={{ marginTop: '0.5rem', color: '#666' }}>
              Добро пожаловать, {user.name || user.email}!
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user && (
            <>
              <Link
                href="/dashboard"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                Панель управления
              </Link>
              <Link
                href="/my-prompts"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#666',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                Мои промты
              </Link>
              <Link
                href="/view-db"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#666',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                Просмотр БД
              </Link>
              <SignOutButton />
            </>
          )}
        </div>
      </div>

      {error ? (
        <div className="empty-state">
          <p style={{ color: '#d32f2f' }}>
            Ошибка подключения к базе данных: {error}
            <br />
            <small>Проверьте настройку DATABASE_URL в переменных окружения Vercel</small>
          </p>
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <p>Заметок пока нет. Запустите seed скрипт для создания тестовых данных.</p>
          {user && (
            <p style={{ marginTop: '1rem' }}>
              Вы успешно авторизованы и имеете доступ к базе данных!
            </p>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
            <p style={{ margin: 0, color: '#2e7d32' }}>
              ✅ Подключение к базе данных успешно! Найдено заметок: {notes.length}
            </p>
          </div>
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <h2>{note.title}</h2>
                <p>
                  Создано: {new Date(note.createdAt).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
