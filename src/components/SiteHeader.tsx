import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { BookOpen, Award, LayoutDashboard, Sparkles, Megaphone } from 'lucide-react'

export function SiteHeader() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const navItems = [
    { label: 'Edições', path: '/editions', icon: BookOpen },
    { label: 'TOP 60 Marcas', path: '/partners', icon: Award },
    { label: 'Anúncios', path: '/advertisements', icon: Megaphone },
    { label: 'Sobre Nós', path: '/sobre-nos', icon: Sparkles },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 shrink-0"
        >
          <BrandLogo size="md" className="h-12 sm:h-14 md:h-16 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2 font-medium text-sm"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/reader/latest">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs sm:text-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Ler Última Edição
            </Button>
          </Link>

          {isAuthenticated ? (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Painel
              </Button>
            </Link>
          ) : (
            <Link to="/admin/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Área Restrita
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
