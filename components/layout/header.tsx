import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/sign-out-button'
import { User, LogIn } from 'lucide-react'

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            🐱 Cats
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Главная
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                  Личный кабинет
                </Link>
                <Link href="/dashboard/my-cats" className="text-sm font-medium transition-colors hover:text-primary">
                  Мои котики
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.name || user.email}</span>
              </div>
              <SignOutButton />
            </>
          ) : (
            <Button asChild variant="default">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Войти
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
