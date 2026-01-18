'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createCat, updateCat } from '@/app/actions/cats'
import type { Cat } from '@prisma/client'

interface PromptDialogProps {
  cat?: Cat | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  children?: React.ReactNode
}

export function PromptDialog({ cat, open: controlledOpen, onOpenChange, onSuccess, children }: PromptDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Array<{ id: string; category: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (cat) {
        setTitle(cat.title)
        setContent(cat.content)
        setDescription(cat.description || '')
      } else {
        setTitle('')
        setContent('')
        setDescription('')
      }
      setError(null)
      fetchCategories()
    }
  }, [open, cat])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        if (data.length > 0 && !categoryId && !cat) {
          setCategoryId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (cat) {
        result = await updateCat(cat.id, { title, content, description })
      } else {
        if (!categoryId) {
          setError('Выберите категорию')
          setLoading(false)
          return
        }
        result = await createCat({ title, content, description, categoryId })
      }

      if (result.success) {
        setOpen(false)
        onSuccess?.()
      } else {
        setError(result.error || 'Произошла ошибка')
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{cat ? 'Редактировать котика' : 'Добавить котика'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium">
              Заголовок
            </label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          {!cat && (
            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium">
                Категория
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium">
              Краткое описание (необязательно)
            </label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium">
              Содержание
            </label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={8} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Отмена
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : cat ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )

  if (children) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        {dialogContent}
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {dialogContent}
    </Dialog>
  )
}
