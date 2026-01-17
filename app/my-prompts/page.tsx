import { getCurrentUser, getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/sign-out-button'

export default async function MyPromptsPage() {
  const user = await getCurrentUser()
  const userId = await getCurrentUserId()

  if (!user || !userId) {
    redirect('/login')
  }

  // Получаем котиков пользователя
  const myCats = await prisma.cat.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      category: true,
      tags: true,
      _count: {
        select: { votes: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '2rem auto' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Мои промты (Котики)</h1>
          <p>Всего: {myCats.length}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            href="/dashboard"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#666',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            ← Назад
          </Link>
          <SignOutButton />
        </div>
      </div>

      {myCats.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет созданных промтов.</p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem' }}>
          {myCats.map((cat) => (
            <div
              key={cat.id}
              style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{cat.title}</h2>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                    Категория: {cat.category.category} | 
                    Видимость: {cat.visibility === 'PUBLIC' ? '🌐 Публичный' : '🔒 Приватный'} |
                    Голосов: {cat._count.votes}
                  </p>
                </div>
              </div>
              
              {cat.description && (
                <p style={{ marginBottom: '1rem', color: '#666' }}>{cat.description}</p>
              )}
              
              <p style={{ marginBottom: '1rem' }}>{cat.content}</p>

              {cat.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  {cat.tags.map((tag) => (
                    <span
                      key={tag.id}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#999' }}>
                Создано: {new Date(cat.createdAt).toLocaleString('ru-RU')}
                {cat.updatedAt && cat.updatedAt.getTime() !== cat.createdAt.getTime() && (
                  <> | Обновлено: {new Date(cat.updatedAt).toLocaleString('ru-RU')}</>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
