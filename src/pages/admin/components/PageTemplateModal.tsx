import { useState } from 'react'
import { EditionPage, updateEditionPage } from '@/services/magazine'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Loader2 } from 'lucide-react'

export function PageTemplateModal({
  page,
  open,
  onOpenChange,
  onSaved,
}: {
  page: EditionPage
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [template, setTemplate] = useState<string>(page.template || 'default')
  const [templateData, setTemplateData] = useState<any>(page.template_data || {})
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEditionPage(page.id, {
        template,
        template_data: templateData,
      })
      toast({ title: 'Template salvo com sucesso.' })
      onSaved()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao salvar template.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const addQA = () => {
    const qa = templateData.qa || []
    setTemplateData({ ...templateData, qa: [...qa, { q: '', a: '' }] })
  }

  const updateQA = (index: number, field: 'q' | 'a', value: string) => {
    const qa = [...(templateData.qa || [])]
    qa[index][field] = value
    setTemplateData({ ...templateData, qa })
  }

  const removeQA = (index: number) => {
    const qa = [...(templateData.qa || [])]
    qa.splice(index, 1)
    setTemplateData({ ...templateData, qa })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Template - Página {page.page_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Template da Página</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão (Apenas Imagem)</SelectItem>
                <SelectItem value="editorial">Editorial</SelectItem>
                <SelectItem value="marketing">Marketing de Moda</SelectItem>
                <SelectItem value="holofote">Coluna Social Holofote</SelectItem>
                <SelectItem value="entrevista">Entrevista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {template === 'editorial' && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Título do Editorial</Label>
                <Input
                  value={templateData.title || ''}
                  onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                  placeholder="Ex: Tendências de Verão..."
                />
              </div>
              <div className="space-y-2">
                <Label>Texto do Editorial</Label>
                <Textarea
                  value={templateData.content || ''}
                  onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                  rows={8}
                />
              </div>
            </div>
          )}

          {template === 'marketing' && (
            <div className="space-y-4 border-t pt-4">
              <div className="p-3 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800 mb-4">
                Este template exibe automaticamente a assinatura:{' '}
                <strong>"Diretor de Marketing da Revista Moda Atual"</strong>.
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={templateData.title || ''}
                  onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                  placeholder="Ex: O Futuro do Varejo"
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea
                  value={templateData.content || ''}
                  onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                  rows={8}
                />
              </div>
            </div>
          )}

          {template === 'holofote' && (
            <div className="space-y-4 border-t pt-4">
              <div className="p-3 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800 mb-4">
                Este template exibe automaticamente o título{' '}
                <strong>"Coluna Social Holofote"</strong> e a assinatura{' '}
                <strong>"Editora de Moda Fabia Mendonça"</strong>.
              </div>
              <div className="space-y-2">
                <Label>Texto da Coluna</Label>
                <Textarea
                  value={templateData.content || ''}
                  onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                  rows={8}
                />
              </div>
            </div>
          )}

          {template === 'entrevista' && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Nome do Entrevistado</Label>
                <Input
                  value={templateData.interviewee || ''}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, interviewee: e.target.value })
                  }
                  placeholder="Ex: Gisele Bündchen"
                />
              </div>
              <div className="space-y-2">
                <Label>Introdução (Opcional)</Label>
                <Textarea
                  value={templateData.intro || ''}
                  onChange={(e) => setTemplateData({ ...templateData, intro: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <Label>Perguntas e Respostas</Label>
                  <Button variant="outline" size="sm" onClick={addQA}>
                    <Plus className="w-4 h-4 mr-2" /> Adicionar P&R
                  </Button>
                </div>

                {(templateData.qa || []).map((item: any, i: number) => (
                  <div key={i} className="p-4 border rounded-md relative bg-gray-50 space-y-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeQA(i)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="space-y-1 pr-8">
                      <Label className="text-xs text-gray-500">Pergunta</Label>
                      <Input
                        value={item.q}
                        onChange={(e) => updateQA(i, 'q', e.target.value)}
                        placeholder="Pergunta..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Resposta</Label>
                      <Textarea
                        value={item.a}
                        onChange={(e) => updateQA(i, 'a', e.target.value)}
                        placeholder="Resposta..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                {(!templateData.qa || templateData.qa.length === 0) && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    Nenhuma pergunta adicionada.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
