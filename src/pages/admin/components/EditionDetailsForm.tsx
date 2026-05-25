import { useState } from 'react'
import { Edition, updateEdition, getFileUrl } from '@/services/magazine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export function EditionDetailsForm({
  edition,
  onUpdated,
}: {
  edition: Edition
  onUpdated: () => void
}) {
  const [title, setTitle] = useState(edition.title)
  const [description, setDescription] = useState(edition.description)
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

      await updateEdition(edition.id, formData)
      toast({ title: 'Sucesso', description: 'Edição atualizada.' })
      setFile(null)
      onUpdated()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Edição</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative mb-4">
            <img
              src={edition.cover_file ? getFileUrl(edition, edition.cover_file) : edition.cover_url}
              className="w-full h-full object-cover"
              alt="Capa"
            />
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Trocar Capa</Label>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
