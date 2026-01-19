'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { PromptCard } from './prompt-card'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import type { Cat } from '@prisma/client'

interface CatsListProps {
  initialCats: Array<
    Cat & {
      category: { category: string }
      owner?: {
        id: string
        name: string | null
        email: string
      }
      _count: { votes: number }
      likedByMe?: boolean
    }
  >
  searchQuery?: string
  currentUserId?: string | null
  sort?: 'popular' | 'recent'
}

function CatsListInner({ initialCats, searchQuery = '', currentUserId, sort: initialSort = 'recent' }: CatsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchQuery)
  const [cats, setCats] = useState(initialCats)
  const [sort, setSort] = useState<'popular' | 'recent'>(initialSort)
  const debouncedSearch = useDebounce(search, 500)

  // Обновляем котиков при изменении initialCats (когда сервер обновил данные)
  useEffect(() => {
    setCats(initialCats)
    setSort(initialSort)
  }, [initialCats, initialSort])

  useEffect(() => {
    if (debouncedSearch !== searchQuery || sort !== initialSort) {
      const params = new URLSearchParams(searchParams.toString())
      if (debouncedSearch) {
        params.set('search', debouncedSearch)
      } else {
        params.delete('search')
      }
      if (sort !== 'recent') {
        params.set('sort', sort)
      } else {
        params.delete('sort')
      }
      router.push(`?${params.toString()}`, { scroll: false })
      // Обновляем данные с сервера после изменения параметров
      router.refresh()
    }
  }, [debouncedSearch, sort, router, searchParams, searchQuery, initialSort])

  const handleUpdate = async () => {
    // Перезагружаем страницу для обновления списка
    router.refresh()
  }

  // Сортируем и фильтруем котиков
  const filteredAndSortedCats = useMemo(() => {
    let result = [...cats]

    // Применяем поиск
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      result = result.filter(
        (cat) =>
          cat.title.toLowerCase().includes(query) ||
          cat.content.toLowerCase().includes(query) ||
          (cat.description && cat.description.toLowerCase().includes(query))
      )
    }

    // Применяем сортировку
    if (sort === 'popular') {
      result = result.sort((a, b) => {
        const likesA = a._count.votes
        const likesB = b._count.votes
        // Сначала по количеству лайков (убывание), потом по дате создания (убывание)
        if (likesA !== likesB) {
          return likesB - likesA
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    } else {
      // Сортировка по дате (убывание)
      result = result.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    }

    return result
  }, [cats, debouncedSearch, sort])

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию, содержанию или описанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sort === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSort('recent')}
          >
            По дате
          </Button>
          <Button
            variant={sort === 'popular' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSort('popular')}
          >
            По популярности
          </Button>
        </div>
      </div>

      {filteredAndSortedCats.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            {search ? 'Котики не найдены' : 'Котиков пока нет. Создайте первого котика!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedCats.map((cat) => (
            <PromptCard key={cat.id} cat={cat} currentUserId={currentUserId} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CatsList(props: CatsListProps) {
  return (
    <Suspense fallback={<div className="p-4">Загрузка...</div>}>
      <CatsListInner {...props} />
    </Suspense>
  )
}
