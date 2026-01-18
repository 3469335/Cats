import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Настройки приложения (TODO: в разработке)</p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
        <p>Настройки будут добавлены позже</p>
      </div>
    </div>
  )
}
