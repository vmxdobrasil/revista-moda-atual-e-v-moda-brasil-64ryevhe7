import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { BookOpen, Award, LayoutDashboard, Sparkles, Megaphone, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function SiteHeader() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

        {/* Desktop Navigation */}
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

        {/* Actions & Mobile Trigger */}
        <div className="flex items-center gap-2">
          <Link to="/reader/latest">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs sm:text-sm">
              <BookOpen className="h-4 w-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Ler </span>Última Edição
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

          {/* Mobile Sheet Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden ml-1"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] p-6">
              <SheetHeader className="text-left pb-4 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <BrandLogo size="xs" className="h-8 w-auto" />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3 text-base font-medium"
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
                <div className="pt-4 mt-2 border-t flex flex-col gap-2">
                  {isAuthenticated ? (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-3">
                        <LayoutDashboard className="h-5 w-5" />
                        Painel Administrativo
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-3">
                        Área Restrita
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
