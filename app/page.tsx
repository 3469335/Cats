import { prisma } from '@/lib/prisma'
import { getCurrentUser, getCurrentUserId } from '@/lib/auth'
import { CatCard } from '@/components/cat-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getRecentCats(userId: string | null) {
  try {
    const cats = await prisma.cat.findMany({
      where: {
        visibility: 'PUBLIC',
      },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    // Получаем ID котиков, которые лайкнул текущий пользователь
    let likedCatIds = new Set<string>()
    if (userId) {
      const userVotes = await prisma.vote.findMany({
        where: { userId },
        select: { catId: true },
      })
      likedCatIds = new Set(userVotes.map((v) => v.catId))
    }

    return cats.map((cat) => ({
      ...cat,
      likedByMe: likedCatIds.has(cat.id),
    }))
  } catch (error) {
    console.error('[HOME] Error fetching recent cats:', error)
    return []
  }
}

async function getPopularCats(userId: string | null) {
  try {
    const cats = await prisma.cat.findMany({
      where: {
        visibility: 'PUBLIC',
      },
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
      take: 50, // Берем больше, чтобы отсортировать по лайкам
    })

    // Получаем ID котиков, которые лайкнул текущий пользователь
    let likedCatIds = new Set<string>()
    if (userId) {
      const userVotes = await prisma.vote.findMany({
        where: { userId },
        select: { catId: true },
      })
      likedCatIds = new Set(userVotes.map((v) => v.catId))
    }

    // Сортируем по количеству лайков (убывание), потом по дате
    const catsWithLiked = cats.map((cat) => ({
      ...cat,
      likedByMe: likedCatIds.has(cat.id),
    }))

    catsWithLiked.sort((a, b) => {
      const likesA = a._count.votes
      const likesB = b._count.votes
      if (likesA !== likesB) {
        return likesB - likesA
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return catsWithLiked.slice(0, 20)
  } catch (error) {
    console.error('[HOME] Error fetching popular cats:', error)
    return []
  }
}

export default async function Home() {
  const user = await getCurrentUser()
  const userId = await getCurrentUserId()

  const [recentCats, popularCats] = await Promise.all([
    getRecentCats(userId),
    getPopularCats(userId),
  ])

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur"></div>
              <div className="relative rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-3">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Добро пожаловать в{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cats
            </span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            Сервис обмена информацией о котиках. Для полноценной работы с сервисом необходимо авторизоваться
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Личный кабинет
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard/public">Просмотреть публичные котики</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg">
                <Link href="/login">
                  Начать работу
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Recent Cats Section */}
      {recentCats.length > 0 && (
        <section className="py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Новые котики</h2>
              <p className="text-muted-foreground">Самые свежие публикации</p>
            </div>
            {user && (
              <Button asChild variant="outline">
                <Link href="/dashboard/public">Все котики →</Link>
              </Button>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentCats.slice(0, 12).map((cat) => (
              <CatCard key={cat.id} cat={cat} currentUserId={userId} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Cats Section */}
      {popularCats.length > 0 && (
        <section className="py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Популярные котики</h2>
              <p className="text-muted-foreground">Самые популярные по лайкам</p>
            </div>
            {user && (
              <Button asChild variant="outline">
                <Link href="/dashboard/public?sort=popular">Все популярные →</Link>
              </Button>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {popularCats.slice(0, 12).map((cat) => (
              <CatCard key={cat.id} cat={cat} currentUserId={userId} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {recentCats.length === 0 && popularCats.length === 0 && (
        <section className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Публичных котиков пока нет. {user ? 'Создайте первого котика!' : 'Войдите, чтобы создать первого котика!'}
          </p>
        </section>
      )}
    </div>
  )
}
