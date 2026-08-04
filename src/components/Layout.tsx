import { Outlet, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BookOpen, Settings } from 'lucide-react'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b py-5 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link
          to="/"
          className="shrink-0 hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-600 text-white font-extrabold text-sm md:text-lg shadow-md">
            V
          </div>
          <span className="text-orange-600 font-bold text-lg md:text-xl tracking-tight">
            MODA BRASIL
          </span>
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden lg:flex items-center gap-5 text-sm">
            <Link
              to="/editions"
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              Edições
            </Link>
            <Link
              to="/partners"
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              Parceiros
            </Link>
            <Link
              to="/advertisements"
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              Anúncios
            </Link>
            <Link
              to="/offers"
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              Ofertas
            </Link>
          </nav>
          <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm md:text-base">
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">Acervo Digital</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
            <Link to="/admin">
              <Settings className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 px-6 md:px-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-600 text-white font-extrabold text-sm opacity-80">
              V
            </div>
            <span className="text-sm">Revista Moda Atual Digital</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-sm flex-wrap justify-center">
            <Link to="/" className="hover:text-orange-500 transition-colors">
              Início
            </Link>
            <Link to="/editions" className="hover:text-orange-500 transition-colors">
              Edições
            </Link>
            <Link to="/partners" className="hover:text-orange-500 transition-colors">
              Parceiros
            </Link>
            <Link to="/advertisements" className="hover:text-orange-500 transition-colors">
              Anúncios
            </Link>
            <Link to="/offers" className="hover:text-orange-500 transition-colors">
              Ofertas
            </Link>
            <Link to="/reader/latest" className="hover:text-orange-500 transition-colors">
              Ler Revista
            </Link>
            <Link to="/admin" className="hover:text-orange-500 transition-colors">
              Admin
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} V Moda Brasil. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
