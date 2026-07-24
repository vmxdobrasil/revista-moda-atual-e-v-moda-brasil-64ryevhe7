import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEditions, deleteEdition, Edition, getFileUrl } from '@/services/magazine'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useRealtime } from '@/hooks/use-realtime'
import { Loader2, Plus, Edit, Trash2, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function EditionsPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    try {
      setEditions(await getEditions())
    } catch {
      toast({ title: 'Erro', description: 'Erro ao carregar edições.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('editions', () => {
    loadData()
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteEdition(id)
      toast({ title: 'Sucesso', description: 'Edição excluída.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Erro ao excluir.', variant: 'destructive' })
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
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Edições</h2>
          <p className="text-gray-500 mt-1">Gerencie as publicações da revista.</p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 shadow-md">
          <Link to="/admin/editions/new">
            <Plus className="w-5 h-5 mr-2" /> Nova Edição
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {editions.map((ed) => (
          <Card
            key={ed.id}
            className="overflow-hidden hover:shadow-xl transition-all border-none bg-white rounded-xl flex flex-col group"
          >
            <Link to={`/admin/editions/${ed.id}`}>
              <div className="relative aspect-[0.7118] bg-gray-100 overflow-hidden group shrink-0">
                <img
                  src={ed.cover_file ? getFileUrl(ed, ed.cover_file) : ed.cover_url || ''}
                  alt={ed.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Link>
            <CardContent className="p-4 flex flex-col gap-3 grow">
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{ed.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(ed.created).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to={`/admin/editions/${ed.id}`}>
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir edição?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todas as páginas e hotspots serão
                        excluídos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(ed.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        {editions.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma edição encontrada.</p>
            <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600">
              <Link to="/admin/editions/new">
                <Plus className="w-4 h-4 mr-2" /> Criar Primeira Edição
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
