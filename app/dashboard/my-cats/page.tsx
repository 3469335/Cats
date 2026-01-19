import { getCurrentUser, getCurrentUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CatsList } from '@/components/cats-list-client'
import { CreateCatButton } from '@/components/create-cat-button'

export const dynamic = 'force-dynamic'

export default async function MyCatsPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const user = await getCurrentUser()
  const userId = await getCurrentUserId()

  if (!user || !userId) {
    redirect('/login')
  }

  const searchQuery = searchParams.search || ''

  // Получаем ID котиков, которые лайкнул текущий пользователь
  const userVotes = await prisma.vote.findMany({
    where: { userId },
    select: { catId: true },
  })
  const likedCatIds = new Set(userVotes.map((v) => v.catId))

  // Показываем только котиков текущего пользователя
  const cats = await prisma.cat.findMany({
    where: {
      ownerId: userId,
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
      _count: {
        select: { votes: true },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 10,
  })

  // Добавляем информацию о том, лайкнул ли пользователь
  const catsWithLiked = cats.map((cat) => ({
    ...cat,
    likedByMe: likedCatIds.has(cat.id),
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Мои котики</h1>
          <p className="text-muted-foreground">Всего: {cats.length}</p>
        </div>
        <CreateCatButton />
      </div>
      <CatsList initialCats={catsWithLiked} searchQuery={searchQuery} currentUserId={userId} />
    </div>
  )
}
