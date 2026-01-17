'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TableInfo {
  name: string
  count: number
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Проверяем, выбран ли тип БД
    const dbType = typeof window !== 'undefined' ? sessionStorage.getItem('dbType') : null
    if (!dbType) {
      router.push('/view-db')
      return
    }

    fetchTables()
  }, [router])

  const fetchTables = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/view-db/tables')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Ошибка при загрузке таблиц')
      }
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setTables(data.tables || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      console.error('Error fetching tables:', err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const dbType = typeof window !== 'undefined' ? sessionStorage.getItem('dbType') : null

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка таблиц...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c33' }}>
          <p><strong>Ошибка:</strong> {error}</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Проверьте консоль браузера (F12) для подробностей
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              onClick={fetchTables}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Повторить попытку
            </button>
            <button
              onClick={() => router.push('/view-db')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Вернуться к выбору БД
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Таблицы базы данных</h1>
          <p>
            {dbType === 'local' ? '📁 Локальная БД' : '🌐 Рабочая БД'}
          </p>
        </div>
        <button
          onClick={() => router.push('/view-db')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ← Назад
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {tables.length === 0 ? (
          <div className="empty-state">
            <p>Таблицы не найдены</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {tables.map((table) => (
              <div
                key={table.name}
                style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{table.name}</h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                    Записей: {table.count}
                  </p>
                </div>
                <Link
                  href={`/view-db/tables/${table.name}`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                >
                  Открыть
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
