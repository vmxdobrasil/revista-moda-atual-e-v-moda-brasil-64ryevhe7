import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/BrandLogo'

export function SiteHeader() {
  return (
    <header className="bg-white border-b py-5 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <Link to="/" className="shrink-0 hover:opacity-80 transition-opacity flex items-center gap-2">
        <div className="h-8 md:h-10 w-auto">
          <BrandLogo variant="header" className="h-full w-auto" />
        </div>
      </Link>
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
        <Link
          to="/sobre-nos"
          className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
        >
          Sobre Nós
        </Link>
      </nav>
      <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
        <Link to="/admin">
          <Settings className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </Button>
    </header>
  )
}
