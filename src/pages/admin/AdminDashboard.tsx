import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BookOpen, LayoutTemplate, Image as ImageIcon } from 'lucide-react'

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Painel Administrativo</h2>
        <p className="text-gray-500 mt-2">Visão geral do gerenciamento da Revista Moda Atual.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/admin/editions">
          <Card className="hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer h-full group">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">Edições</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Gerencie todas as edições da revista. Adicione, edite ou exclua publicações ativas
                no portal.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/editions">
          <Card className="hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer h-full group">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ImageIcon className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">Páginas & Hotspots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Faça upload de páginas, configure os hotspots interativos e ajuste a ordem dentro
                das edições.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/editions">
          <Card className="hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer h-full group">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed">
                Aplique templates de conteúdo dinâmico como Editorial, Holofote, Marketing de Moda e
                Entrevistas.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
