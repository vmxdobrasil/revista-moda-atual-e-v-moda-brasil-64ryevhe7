import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEdition, Edition } from '@/services/magazine'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { EditionDetailsForm } from './components/EditionDetailsForm'
import { EditionPagesManager } from './components/EditionPagesManager'

export default function EditionEditPage() {
  const { id } = useParams<{ id: string }>()
  const [edition, setEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const ed = await getEdition(id)
      setEdition(ed)
    } catch (err) {
      toast({ title: 'Erro', description: 'Edição não encontrada.', variant: 'destructive' })
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

  if (!edition) return <div>Edição não encontrada.</div>

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Editando: {edition.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <EditionDetailsForm edition={edition} onUpdated={loadData} />
        </div>
        <div className="lg:col-span-2">
          <EditionPagesManager editionId={edition.id} />
        </div>
      </div>
    </div>
  )
}
