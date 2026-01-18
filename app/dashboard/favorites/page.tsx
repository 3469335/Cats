import { getCurrentUser, getCurrentUserId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { CatsList } from '@/components/cats-list-client'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage({
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

  const cats = await prisma.cat.findMany({
    where: {
      ownerId: userId,
      isFavorite: true,
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Избранные котики</h1>
        <p className="text-muted-foreground">Всего: {cats.length}</p>
      </div>
      <CatsList initialCats={cats} searchQuery={searchQuery} currentUserId={userId} />
    </div>
  )
}
