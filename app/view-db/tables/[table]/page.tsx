'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface TableData {
  [key: string]: any
}

export default function TableViewPage() {
  const params = useParams()
  const router = useRouter()
  const tableName = params.table as string

  const [data, setData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [columns, setColumns] = useState<string[]>([])

  const pageSize = 20

  useEffect(() => {
    fetchData()
  }, [tableName, page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/view-db/tables/${tableName}?page=${page}&pageSize=${pageSize}`)
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных')
      }
      const result = await response.json()
      setData(result.data || [])
      setTotalPages(result.totalPages || 1)
      setTotalCount(result.totalCount || 0)
      if (result.data && result.data.length > 0) {
        setColumns(Object.keys(result.data[0]))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
      return
    }

    try {
      const response = await fetch(`/api/view-db/tables/${tableName}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Ошибка при удалении')
      }
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при удалении')
    }
  }

  const handleUpdate = async (id: string, updatedData: TableData) => {
    try {
      const response = await fetch(`/api/view-db/tables/${tableName}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      })
      if (!response.ok) {
        throw new Error('Ошибка при обновлении')
      }
      setEditingRow(null)
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при обновлении')
    }
  }

  const handleCreate = async (newData: TableData) => {
    try {
      const response = await fetch(`/api/view-db/tables/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      })
      if (!response.ok) {
        throw new Error('Ошибка при создании')
      }
      setShowCreateModal(false)
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка при создании')
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Загрузка данных...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fee', borderRadius: '8px', color: '#c33' }}>
          <p><strong>Ошибка:</strong> {error}</p>
          <Link
            href="/view-db/tables"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Вернуться к списку таблиц
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '1400px', margin: '2rem auto' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Таблица: {tableName}</h1>
          <p>Всего записей: {totalCount}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            + Создать
          </button>
          <Link
            href="/view-db/tables"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#666',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '500',
            }}
          >
            ← Назад
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '2rem', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '2px solid #ddd',
                  }}
                >
                  {col}
                </th>
              ))}
              <th style={{ padding: '1rem', borderBottom: '2px solid #ddd' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const rowId = row.id || row[columns[0]] || idx.toString()
              const isEditing = editingRow === rowId

              return (
                <tr key={rowId} style={{ borderBottom: '1px solid #eee' }}>
                  {columns.map((col) => (
                    <td key={col} style={{ padding: '0.75rem 1rem' }}>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={String(row[col] || '')}
                          onBlur={(e) => {
                            const updated = { ...row, [col]: e.target.value }
                            handleUpdate(rowId, updated)
                          }}
                          style={{
                            width: '100%',
                            padding: '0.25rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => setEditingRow(rowId)}
                          style={{
                            cursor: 'pointer',
                            display: 'block',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={String(row[col] || '')}
                        >
                          {String(row[col] || '')}
                        </span>
                      )}
                    </td>
                  ))}
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setEditingRow(isEditing ? null : rowId)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        {isEditing ? '✓' : '✏️'}
                      </button>
                      <button
                        onClick={() => handleDelete(rowId)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: page === 1 ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          ← Назад
        </button>
        <span>
          Страница {page} из {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: page === totalPages ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Вперед →
        </button>
      </div>

      {/* Модальное окно создания */}
      {showCreateModal && (
        <CreateModal
          columns={columns}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

function CreateModal({
  columns,
  onClose,
  onCreate,
}: {
  columns: string[]
  onClose: () => void
  onCreate: (data: TableData) => void
}) {
  const [formData, setFormData] = useState<TableData>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate(formData)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Создать новую запись</h2>
        <form onSubmit={handleSubmit}>
          {columns.map((col) => (
            <div key={col} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                {col}
              </label>
              <input
                type="text"
                value={formData[col] || ''}
                onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
