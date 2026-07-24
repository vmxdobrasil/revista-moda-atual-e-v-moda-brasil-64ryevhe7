import { useState } from 'react'
import { EditionPage, updateEditionPage, getFileUrl } from '@/services/magazine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { Loader2, Save } from 'lucide-react'

interface PageEditFormProps {
  page: EditionPage
  onSaved: () => void
}

export function PageEditForm({ page, onSaved }: PageEditFormProps) {
  const [pageNumber, setPageNumber] = useState(page.page_number)
  const [tocTitle, setTocTitle] = useState(page.toc_title || '')
  const [template, setTemplate] = useState(page.template || 'default')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    try {
      const formData = new FormData()
      formData.append('page_number', pageNumber.toString())
      formData.append('template', template)
      formData.append('toc_title', tocTitle)
      if (file) formData.append('image_file', file)

      await updateEditionPage(page.id, formData)
      toast({ title: 'Página atualizada.' })
      setFile(null)
      onSaved()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Verifique os campos.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Página</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="w-24 h-32 bg-gray-100 rounded-md overflow-hidden shrink-0">
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : page.image_file ? (
                <img
                  src={getFileUrl(page, page.image_file)}
                  className="w-full h-full object-cover"
                  alt="Página"
                />
              ) : page.image_url ? (
                <img src={page.image_url} className="w-full h-full object-cover" alt="Página" />
              ) : null}
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Label>Número da Página</Label>
                <Input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                />
                {fieldErrors.page_number && (
                  <p className="text-sm text-red-500">{fieldErrors.page_number}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Título do Índice</Label>
                <Input value={tocTitle} onChange={(e) => setTocTitle(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="editorial">Editorial</SelectItem>
                <SelectItem value="marketing">Marketing de Moda</SelectItem>
                <SelectItem value="holofote">Coluna Social Holofote</SelectItem>
                <SelectItem value="entrevista">Entrevista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Trocar Imagem</Label>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {fieldErrors.image_file && (
              <p className="text-sm text-red-500">{fieldErrors.image_file}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
