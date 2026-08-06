import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getEdition, deleteEdition, Edition } from '@/services/magazine'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { EditionForm } from './components/EditionForm'
import { EditionPagesManager } from './components/EditionPagesManager'

export default function EditionEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [edition, setEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setEdition(await getEdition(id))
      setNotFound(false)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (notFound || !edition) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-orange-500" />
        <h2 className="text-xl font-bold text-gray-800">Edição não encontrada</h2>
        <p className="text-gray-500 text-center max-w-md">
          A edição que você procura não existe, foi removida, ou o identificador é inválido.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/editions">Ver todas as edições</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      await deleteEdition(edition.id)
      navigate('/admin/editions')
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/editions">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Editando: {edition.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <EditionForm edition={edition} onSaved={loadData} onDelete={handleDelete} />
        </div>
        <div className="lg:col-span-2">
          <EditionPagesManager editionId={edition.id} />
        </div>
      </div>
    </div>
  )
}
