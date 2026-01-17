import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/sign-out-button'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '2rem auto' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Панель управления</h1>
          <p>Добро пожаловать, {user.name || user.email}!</p>
        </div>
        <SignOutButton />
      </div>

      <div style={{ marginTop: '2rem', display: 'grid', gap: '1.5rem' }}>
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Информация о пользователе</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {user.image && (
              <div>
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                  }}
                />
              </div>
            )}
            <p><strong>Email:</strong> {user.email}</p>
            {user.name && <p><strong>Имя:</strong> {user.name}</p>}
            <p><strong>ID:</strong> {user.id}</p>
          </div>
        </div>

        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Быстрые действия</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <a
              href="/my-prompts"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0070f3',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500',
              }}
            >
              Мои промты
            </a>
            <a
              href="/view-db"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#666',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500',
              }}
            >
              Просмотр БД
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
