import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getNotes() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { notes, error: null }
  } catch (error) {
    console.error('Error fetching notes:', error)
    return { 
      notes: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export default async function Home() {
  const { notes, error } = await getNotes()

  return (
    <div className="container">
      <div className="header">
        <h1>Cats - сервис обмена информацией о котиках</h1>
        <p>Минимальный проект Next.js + Prisma + NeonDB (PostgreSQL)</p>
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
        </div>
      ) : (
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
      )}
    </div>
  )
}
