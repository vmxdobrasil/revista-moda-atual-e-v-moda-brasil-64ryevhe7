import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEditions, Edition, getFileUrl, deleteEdition, createEdition } from '@/services/magazine'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function EditionsPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getEditions()
      setEditions(data)
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar edições.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async () => {
    try {
      await createEdition({ title: 'Nova Edição' })
      toast({ title: 'Sucesso', description: 'Edição criada com sucesso.' })
      loadData()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao criar edição.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Tem certeza que deseja excluir esta edição?')) return
    try {
      await deleteEdition(id)
      toast({ title: 'Sucesso', description: 'Edição excluída com sucesso.' })
      loadData()
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir edição.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Edições da Revista</h2>
          <p className="text-gray-500 mt-1">Gerencie as publicações da plataforma.</p>
        </div>
        <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 shadow-md">
          <Plus className="w-5 h-5 mr-2" /> Nova Edição
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {editions.map((ed) => (
          <Link key={ed.id} to={`/admin/editions/${ed.id}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all border-none bg-white rounded-xl h-full flex flex-col group cursor-pointer">
              <div className="relative aspect-[0.7118] bg-gray-100 flex items-center justify-center group shrink-0 overflow-hidden">
                <img
                  src={ed.cover_file ? getFileUrl(ed, ed.cover_file) : ed.cover_url}
                  alt={ed.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium bg-orange-600 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <Edit className="w-4 h-4" /> Editar Edição
                  </span>
                </div>
              </div>
              <CardContent className="p-5 flex items-center justify-between gap-3 grow">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {ed.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{ed.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(ed.id, e)}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0 transition-colors z-10 relative"
                  title="Excluir edição"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
        {editions.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-lg">Nenhuma edição encontrada.</p>
            <Button
              onClick={handleCreate}
              variant="outline"
              className="mt-4 border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-2" /> Criar Primeira Edição
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
