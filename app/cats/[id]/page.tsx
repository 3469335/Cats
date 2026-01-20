import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { LikeButton } from '@/components/like-button'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

interface CatDetailPageProps {
  params: { id: string }
}

export default async function CatDetailPage({ params }: CatDetailPageProps) {
  const userId = await getCurrentUserId()

  const cat = await prisma.cat.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: { votes: true },
      },
    },
  })

  if (!cat) {
    notFound()
  }

  // Проверяем видимость - если приватный и не владелец, перенаправляем
  if (cat.visibility === 'PRIVATE' && cat.ownerId !== userId) {
    redirect('/login')
  }

  // Получаем информацию о лайке
  let likedByMe = false
  if (userId) {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_catId: {
          userId,
          catId: cat.id,
        },
      },
    })
    likedByMe = !!vote
  }

  const createdAt = new Date(cat.createdAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const updatedAt = new Date(cat.updatedAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад на главную
          </Link>
        </Button>
      </div>

      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>{cat.category.category}</span>
                {cat.owner && (
                  <>
                <span>•</span>
                <User className="h-4 w-4" />
                <span>{cat.owner.name || cat.owner.email}</span>
              </>
            )}
                <span>•</span>
                <Calendar className="h-4 w-4" />
                <span>{createdAt}</span>
              </div>
              <h1 className="mb-4 text-4xl font-bold">{cat.title}</h1>
              {cat.description && (
                <p className="mb-6 text-lg text-muted-foreground">{cat.description}</p>
              )}
            </div>

            <div className="mb-8 whitespace-pre-wrap text-base leading-relaxed">{cat.content}</div>

            <div className="flex items-center justify-between border-t pt-6">
              <LikeButton
                catId={cat.id}
                initialLiked={likedByMe}
                initialCount={cat._count.votes}
                isPublic={cat.visibility === 'PUBLIC'}
              />
            </div>

            {cat.updatedAt.getTime() !== cat.createdAt.getTime() && (
              <div className="mt-4 text-sm text-muted-foreground">
                Обновлено: {updatedAt}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
