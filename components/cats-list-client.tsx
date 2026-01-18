'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { PromptCard } from './prompt-card'
import { Search } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
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
    }
  >
  searchQuery?: string
  currentUserId?: string | null
}

function CatsListInner({ initialCats, searchQuery = '', currentUserId }: CatsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchQuery)
  const [cats, setCats] = useState(initialCats)
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      const params = new URLSearchParams(searchParams.toString())
      if (debouncedSearch) {
        params.set('search', debouncedSearch)
      } else {
        params.delete('search')
      }
      router.push(`?${params.toString()}`, { scroll: false })
    }
  }, [debouncedSearch, router, searchParams, searchQuery])

  const handleUpdate = async () => {
    // Перезагружаем страницу для обновления списка
    router.refresh()
  }

  const filteredCats = useMemo(() => {
    if (!debouncedSearch) return cats
    const query = debouncedSearch.toLowerCase()
    return cats.filter(
      (cat) =>
        cat.title.toLowerCase().includes(query) ||
        cat.content.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
    )
  }, [cats, debouncedSearch])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию, содержанию или описанию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredCats.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            {search ? 'Котики не найдены' : 'Котиков пока нет. Создайте первого котика!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCats.map((cat) => (
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
