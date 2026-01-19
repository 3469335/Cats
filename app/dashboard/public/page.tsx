import { getCurrentUser, getCurrentUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CatsList } from '@/components/cats-list-client'

export const dynamic = 'force-dynamic'

export default async function PublicPage({
  searchParams,
}: {
  searchParams: { search?: string; sort?: 'popular' | 'recent' }
}) {
  const user = await getCurrentUser()
  const userId = await getCurrentUserId()

  if (!user || !userId) {
    redirect('/login')
  }

  const searchQuery = searchParams.search || ''
  const sort = searchParams.sort || 'recent'

  // Получаем ID котиков, которые лайкнул текущий пользователь
  const userVotes = await prisma.vote.findMany({
    where: { userId },
    select: { catId: true },
  })
  const likedCatIds = new Set(userVotes.map((v) => v.catId))

  // Показываем публичные котики всех пользователей
  let cats = await prisma.cat.findMany({
    where: {
      visibility: 'PUBLIC',
      ...(searchQuery && {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' as const } },
          { content: { contains: searchQuery, mode: 'insensitive' as const } },
          { description: { contains: searchQuery, mode: 'insensitive' as const } },
        ],
      }),
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
    orderBy:
      sort === 'popular'
        ? {
            createdAt: 'desc', // Сначала по дате, потом отсортируем по лайкам
          }
        : {
            createdAt: 'desc',
          },
  })

  // Добавляем информацию о том, лайкнул ли пользователь
  let catsWithLiked = cats.map((cat) => ({
    ...cat,
    likedByMe: likedCatIds.has(cat.id),
  }))

  // Сортировка по популярности (количество лайков) - сначала котики с большим количеством лайков
  if (sort === 'popular') {
    catsWithLiked = catsWithLiked.sort((a, b) => {
      const likesA = a._count.votes
      const likesB = b._count.votes
      // Сначала по количеству лайков (убывание), потом по дате создания (убывание)
      if (likesA !== likesB) {
        return likesB - likesA
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  // Ограничиваем количество после сортировки
  catsWithLiked = catsWithLiked.slice(0, 10)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Публичные котики</h1>
        <p className="text-muted-foreground">Всего: {catsWithLiked.length}</p>
      </div>
      <CatsList initialCats={catsWithLiked} searchQuery={searchQuery} currentUserId={userId} sort={sort} />
    </div>
  )
}
