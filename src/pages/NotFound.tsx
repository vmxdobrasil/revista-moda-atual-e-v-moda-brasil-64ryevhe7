import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-6xl md:text-8xl font-extrabold text-orange-600 mb-4">404</h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-2 font-semibold">
          Página não encontrada
        </p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          A página que você procura não existe ou foi movida. Que tal voltar para o início?
        </p>
        <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8">
          <Link to="/">
            <Home className="w-5 h-5 mr-2" />
            Voltar para o Início
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
