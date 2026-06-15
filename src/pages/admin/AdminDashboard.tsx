import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BookOpen, LayoutTemplate, Image as ImageIcon, Loader2 } from 'lucide-react'
import { getEditions, Edition, getFileUrl } from '@/services/magazine'

export function AdminDashboard() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEditions()
      .then((data) => {
        setEditions(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-10">
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
              <CardTitle className="text-xl">Todas as Edições</CardTitle>
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

      <div>
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight mb-6">Edições Recentes</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {editions.slice(0, 4).map((ed) => (
              <Link key={ed.id} to={`/admin/editions/${ed.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all border-none bg-white rounded-xl h-full flex flex-col group">
                  <div className="relative aspect-[0.7118] overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    <img
                      src={ed.cover_file ? getFileUrl(ed, ed.cover_file) : ed.cover_url}
                      alt={ed.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <h4 className="font-bold text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {ed.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{ed.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {editions.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                Nenhuma edição cadastrada ainda.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
