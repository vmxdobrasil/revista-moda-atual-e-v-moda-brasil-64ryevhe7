import { useState, useEffect } from 'react'
import { Edition, createEdition, updateEdition, getFileUrl } from '@/services/magazine'
import { getBrands, type Top60Brand } from '@/services/top60'
import { generateCover } from '@/services/cover-art-director'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { Loader2, Save, Trash2, ImagePlus } from 'lucide-react'
import { SeoFieldsForm, type SeoFieldValues } from './SeoFieldsForm'

interface EditionFormProps {
  edition?: Edition
  onSaved: (id: string) => void
  onDelete?: () => void
}

export function EditionForm({ edition, onSaved, onDelete }: EditionFormProps) {
  const [title, setTitle] = useState(edition?.title || '')
  const [description, setDescription] = useState(edition?.description || '')
  const [file, setFile] = useState<File | null>(null)
  const [brandId, setBrandId] = useState(edition?.brand || '')
  const [brands, setBrands] = useState<Top60Brand[]>([])
  const [saving, setSaving] = useState(false)
  const [generatingCover, setGeneratingCover] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [seoValues, setSeoValues] = useState<SeoFieldValues>({
    seo_title: (edition as any)?.seo_title || '',
    seo_description: (edition as any)?.seo_description || '',
    keywords: (edition as any)?.keywords || '',
    canonical_url: (edition as any)?.canonical_url || '',
    slug: (edition as any)?.slug || '',
  })
  const { toast } = useToast()

  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('brand', brandId || '')
      formData.append('seo_title', seoValues.seo_title)
      formData.append('seo_description', seoValues.seo_description)
      formData.append('keywords', seoValues.keywords)
      formData.append('canonical_url', seoValues.canonical_url)
      formData.append('slug', seoValues.slug)
      if (file) formData.append('cover_file', file)

      const saved = edition
        ? await updateEdition(edition.id, formData)
        : await createEdition(formData)

      toast({
        title: 'Sucesso',
        description: edition ? 'Edição atualizada.' : 'Edição criada.',
      })
      setFile(null)
      onSaved(saved.id)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Verifique os campos.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateCover = async () => {
    if (!edition) return
    setGeneratingCover(true)
    try {
      await generateCover(title || edition.title, edition.id)
      toast({ title: 'Sucesso', description: 'Capa gerada e salva na edição!' })
      onSaved(edition.id)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao gerar capa.',
        variant: 'destructive',
      })
    } finally {
      setGeneratingCover(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{edition ? 'Detalhes da Edição' : 'Nova Edição'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative mb-4 max-w-[200px]">
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover"
                alt="Preview"
              />
            ) : edition?.cover_file ? (
              <img
                src={getFileUrl(edition, edition.cover_file)}
                className="w-full h-full object-cover"
                alt="Capa"
              />
            ) : edition?.cover_url ? (
              <img src={edition.cover_url} className="w-full h-full object-cover" alt="Capa" />
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
            {fieldErrors.title && <p className="text-sm text-red-500">{fieldErrors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            {fieldErrors.description && (
              <p className="text-sm text-red-500">{fieldErrors.description}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Marca (TOP 60)</Label>
            <Select value={brandId} onValueChange={(v) => setBrandId(v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma marca..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Capa</Label>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {fieldErrors.cover_file && (
              <p className="text-sm text-red-500">{fieldErrors.cover_file}</p>
            )}
          </div>
          {edition && (
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateCover}
              disabled={generatingCover}
              className="w-full gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              {generatingCover ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
              Gerar Capa com IA
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {edition ? 'Salvar Alterações' : 'Criar Edição'}
            </Button>
            <SeoFieldsForm values={seoValues} onChange={setSeoValues} />

            {edition && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir edição?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todas as páginas e hotspots serão excluídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
