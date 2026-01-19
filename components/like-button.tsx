'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  catId: string
  initialLiked: boolean
  initialCount: number
  isPublic: boolean
  onUpdate?: () => void
}

export function LikeButton({ catId, initialLiked, initialCount, isPublic, onUpdate }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!isPublic) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/cats/${catId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка при обработке лайка')
      }

      const data = await response.json()
      setLiked(data.liked)
      setCount(data.likesCount)
      onUpdate?.()
    } catch (error) {
      console.error('Error toggling like:', error)
      // Можно добавить toast для уведомления об ошибке
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={loading || !isPublic}
      className={cn('gap-2', liked && 'text-red-500 hover:text-red-600')}
      title={!isPublic ? 'Можно лайкать только публичные котики' : liked ? 'Убрать лайк' : 'Лайкнуть'}
    >
      <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
      <span>{count}</span>
    </Button>
  )
}
