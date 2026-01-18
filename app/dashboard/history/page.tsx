import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">История</h1>
        <p className="text-muted-foreground">История изменений (TODO: в разработке)</p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
        <p>История изменений будет добавлена позже</p>
      </div>
    </div>
  )
}
