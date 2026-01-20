import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <span className="font-bold">Cats</span>
            <span className="text-muted-foreground">© {currentYear}</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Главная
            </Link>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Личный кабинет
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
