import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
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
  )
}
