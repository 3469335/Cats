'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Globe, Star, History, Settings, Home, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Все котики', href: '/dashboard', icon: Home },
  { name: 'Мои котики', href: '/dashboard/my-cats', icon: User },
  { name: 'Публичные', href: '/dashboard/public', icon: Globe },
  { name: 'Избранное', href: '/dashboard/favorites', icon: Star },
  { name: 'История', href: '/dashboard/history', icon: History },
  { name: 'Настройки', href: '/dashboard/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-[280px] flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Cats</h2>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
