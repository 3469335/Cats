'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ViewDbPage() {
  const [dbType, setDbType] = useState<'local' | 'production' | null>(null)
  const router = useRouter()

  const handleSelectDb = (type: 'local' | 'production') => {
    setDbType(type)
    // Сохраняем выбор в sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dbType', type)
    }
    router.push('/view-db/tables')
  }

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="header">
        <h1>Просмотр базы данных</h1>
        <p>Выберите базу данных для просмотра</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={() => handleSelectDb('local')}
          style={{
            padding: '1.5rem',
            fontSize: '1.125rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0051cc')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0070f3')}
        >
          📁 Локальная БД
          <br />
          <small style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Использует DATABASE_URL из .env
          </small>
        </button>

        <button
          onClick={() => handleSelectDb('production')}
          style={{
            padding: '1.5rem',
            fontSize: '1.125rem',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#ee5a5a')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ff6b6b')}
        >
          🌐 Рабочая БД
          <br />
          <small style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Использует DATABASE_URL из переменных окружения Vercel
          </small>
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
          <strong>Примечание:</strong> Убедитесь, что переменная окружения DATABASE_URL настроена правильно.
        </p>
      </div>
    </div>
  )
}
