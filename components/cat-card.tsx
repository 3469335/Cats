import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LikeButton } from './like-button'
import { Heart, Calendar, User } from 'lucide-react'
import type { Cat } from '@prisma/client'

interface CatCardProps {
  cat: Cat & {
    category: { category: string }
    owner?: {
      id: string
      name: string | null
      email: string
    }
    _count: { votes: number }
    likedByMe?: boolean
  }
  currentUserId?: string | null
}

export function CatCard({ cat, currentUserId }: CatCardProps) {
  const preview = cat.content.split('\n').slice(0, 3).join(' ').substring(0, 150)
  const createdAt = new Date(cat.createdAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Link href={`/cats/${cat.id}`}>
              <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2">
                {cat.title}
              </CardTitle>
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span>{cat.category.category}</span>
              </span>
              {cat.owner && (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{cat.owner.name || cat.owner.email}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{createdAt}</span>
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {cat.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
        )}
        <p className="mb-4 text-sm line-clamp-4 flex-1">{preview}...</p>
        <div className="flex items-center justify-between pt-4 border-t">
          <LikeButton
            catId={cat.id}
            initialLiked={cat.likedByMe || false}
            initialCount={cat._count.votes}
            isPublic={cat.visibility === 'PUBLIC'}
          />
          <Link href={`/cats/${cat.id}`}>
            <span className="text-sm text-primary hover:underline">Читать далее →</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
