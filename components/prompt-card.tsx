'use client'

import { useState } from 'react'
import { Star, Globe, Lock, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { togglePublic, toggleFavorite, deleteCat } from '@/app/actions/cats'
import { PromptDialog } from './prompt-dialog'
import { LikeButton } from './like-button'
import type { Cat } from '@prisma/client'

interface PromptCardProps {
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
  onUpdate?: () => void
}

export function PromptCard({ cat, currentUserId, onUpdate }: PromptCardProps) {
  const isOwner = currentUserId ? cat.ownerId === currentUserId : false
  const [isPublicLoading, setIsPublicLoading] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleTogglePublic = async () => {
    setIsPublicLoading(true)
    try {
      await togglePublic(cat.id)
      onUpdate?.()
    } catch (error) {
      console.error('Error toggling public:', error)
    } finally {
      setIsPublicLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    setIsFavoriteLoading(true)
    try {
      await toggleFavorite(cat.id)
      onUpdate?.()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого котика?')) {
      return
    }
    setIsDeleteLoading(true)
    try {
      await deleteCat(cat.id)
      onUpdate?.()
    } catch (error) {
      console.error('Error deleting cat:', error)
    } finally {
      setIsDeleteLoading(false)
    }
  }

  const preview = cat.content.split('\n').slice(0, 2).join(' ')

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{cat.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {cat.category.category} • {cat.visibility === 'PUBLIC' ? '🌐 Публичный' : '🔒 Приватный'}
                {cat.owner && !isOwner && ` • Автор: ${cat.owner.name || cat.owner.email}`}
              </p>
            </div>
            {isOwner && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isFavoriteLoading}
                  className={cat.isFavorite ? 'text-yellow-500' : ''}
                >
                  <Star className={`h-4 w-4 ${cat.isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleTogglePublic} disabled={isPublicLoading}>
                  {cat.visibility === 'PUBLIC' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {cat.description && <p className="mb-2 text-sm text-muted-foreground">{cat.description}</p>}
          <p className="text-sm">{preview}</p>
          <div className="mt-4 flex items-center justify-between">
            <LikeButton
              catId={cat.id}
              initialLiked={cat.likedByMe || false}
              initialCount={cat._count.votes}
              isPublic={cat.visibility === 'PUBLIC'}
              onUpdate={onUpdate}
            />
            {isOwner && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Редактировать
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleteLoading}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <PromptDialog cat={cat} open={isDialogOpen} onOpenChange={setIsDialogOpen} onSuccess={onUpdate} />
    </>
  )
}
