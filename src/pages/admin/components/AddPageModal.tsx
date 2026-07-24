import { useState } from 'react'
import { createEditionPage } from '@/services/magazine'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { Loader2, Plus } from 'lucide-react'

interface AddPageModalProps {
  editionId: string
  nextPageNumber: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function AddPageModal({
  editionId,
  nextPageNumber,
  open,
  onOpenChange,
  onSaved,
}: AddPageModalProps) {
  const [pageNumber, setPageNumber] = useState(nextPageNumber)
  const [tocTitle, setTocTitle] = useState('')
  const [template, setTemplate] = useState('default')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const formData = new FormData()
      formData.append('edition', editionId)
      formData.append('page_number', pageNumber.toString())
      formData.append('template', template)
      if (tocTitle) formData.append('toc_title', tocTitle)
      if (file) formData.append('image_file', file)

      await createEditionPage(formData)
      toast({ title: 'Sucesso', description: 'Página adicionada.' })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Verifique os campos.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) {
          setPageNumber(nextPageNumber)
          setTocTitle('')
          setTemplate('default')
          setFile(null)
          setFieldErrors({})
        }
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Página</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
            <Label>Título do Índice (Opcional)</Label>
            <Input
              value={tocTitle}
              onChange={(e) => setTocTitle(e.target.value)}
              placeholder="Ex: Capa, Editorial..."
            />
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
            <Label>Imagem</Label>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {fieldErrors.image_file && (
              <p className="text-sm text-red-500">{fieldErrors.image_file}</p>
            )}
            {file && (
              <img
                src={URL.createObjectURL(file)}
                className="w-full max-w-[150px] rounded-md mt-2"
                alt="Preview"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
