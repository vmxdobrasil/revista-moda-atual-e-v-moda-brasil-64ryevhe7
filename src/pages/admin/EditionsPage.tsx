import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEditions, deleteEdition, createEdition, Edition, getFileUrl } from '@/services/magazine'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'

export default function EditionsPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadEditions = async () => {
    setLoading(true)
    try {
      const data = await getEditions()
      setEditions(data)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as edições.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEditions()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta edição?')) return
    try {
      await deleteEdition(id)
      toast({ title: 'Sucesso', description: 'Edição excluída.' })
      loadEditions()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciar Edições</h2>
        <CreateEditionModal onCreated={loadEditions} />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : editions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm">
          Nenhuma edição encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {editions.map((ed) => (
            <Card
              key={ed.id}
              className="overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="aspect-[3/4] bg-gray-100 relative">
                <img
                  src={ed.cover_file ? getFileUrl(ed, ed.cover_file) : ed.cover_url}
                  alt={ed.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4 flex-1">
                <CardTitle className="text-lg line-clamp-2">{ed.title}</CardTitle>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{ed.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/admin/editions/${ed.id}`}>
                    <Edit className="w-4 h-4 mr-2" /> Editar
                  </Link>
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(ed.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateEditionModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      if (file) formData.append('cover_file', file)

      await createEdition(formData)
      toast({ title: 'Sucesso', description: 'Edição criada.' })
      setOpen(false)
      setTitle('')
      setDescription('')
      setFile(null)
      onCreated()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao criar edição.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Nova Edição
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Edição</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Capa (Arquivo de Imagem)</Label>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
              {saving ? 'Salvando...' : 'Criar Edição'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
