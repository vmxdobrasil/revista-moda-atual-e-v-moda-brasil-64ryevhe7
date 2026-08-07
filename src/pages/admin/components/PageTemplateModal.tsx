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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { NewTemplateForms, NEW_TEMPLATE_VALUES, getInitialTemplateData } from './new-template-forms'

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (template === 'entrevista') {
      const qa = templateData.qa || []
      if (qa.length === 0) {
        errors.qa = 'Adicione pelo menos uma pergunta e resposta.'
      } else {
        const incomplete = qa.some((item: any) => !item.q?.trim() || !item.a?.trim())
        if (incomplete) {
          errors.qa = 'Preencha todas as perguntas e respostas.'
        }
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      toast({ title: 'Verifique os campos obrigatórios.', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const data: Record<string, any> = { template }
      if (template === 'default') {
        data.template_data = JSON.stringify(templateData)
      } else {
        data.template_data = JSON.stringify(templateData)
      }

      await updateEditionPage(page.id, data)
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

  const handleTemplateChange = (value: string) => {
    setTemplate(value)
    setValidationErrors({})
    if (!templateData || Object.keys(templateData).length === 0) {
      if (value === 'entrevista') {
        setTemplateData({ qa: [{ q: '', a: '' }] })
      } else if ((NEW_TEMPLATE_VALUES as readonly string[]).includes(value)) {
        setTemplateData(getInitialTemplateData(value))
      } else {
        setTemplateData({})
      }
    }
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
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Templates Atuais</SelectLabel>
                  <SelectItem value="default">Padrão (Título + Texto)</SelectItem>
                  <SelectItem value="editorial">Editorial</SelectItem>
                  <SelectItem value="marketing">Marketing de Moda</SelectItem>
                  <SelectItem value="holofote">Coluna Social Holofote</SelectItem>
                  <SelectItem value="entrevista">Entrevista</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Núcleo Editorial</SelectLabel>
                  <SelectItem value="lookbook">Lookbook / Tendência</SelectItem>
                  <SelectItem value="indice">Índice / Sumário</SelectItem>
                  <SelectItem value="trend_report">Coluna de Tendência (Trend Report)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Monetização e Parceiros</SelectLabel>
                  <SelectItem value="anuncio_patrocinado">Anúncio / Patrocinado</SelectItem>
                  <SelectItem value="top60_marcas">Top 60 Marcas</SelectItem>
                  <SelectItem value="perfil_marca">Perfil de Marca</SelectItem>
                  <SelectItem value="parceiro_anunciante">
                    Página de Parceiro / Anunciante
                  </SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Conversão</SelectLabel>
                  <SelectItem value="galeria_produtos">Galeria de Produtos</SelectItem>
                  <SelectItem value="materia_cta">Matéria com CTA</SelectItem>
                  <SelectItem value="comparativo_ab">Comparativo A/B</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Reuso Social</SelectLabel>
                  <SelectItem value="story_social">Story / Conteúdo Social</SelectItem>
                  <SelectItem value="newsletter_preview">Newsletter Preview</SelectItem>
                  <SelectItem value="capa_edicao">Capa de Edição</SelectItem>
                  <SelectItem value="fashion_editorial">Editorial de Moda</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Colunas Autorais</SelectLabel>
                  <SelectItem value="coluna_holofote_evoluida">
                    Coluna Holofote (Evoluída)
                  </SelectItem>
                  <SelectItem value="coluna_marketing_moda">
                    Coluna Marketing de Moda (CEO)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {template === 'default' && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={templateData.title || ''}
                  onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                  placeholder="Ex: Mensagem do Editor"
                />
              </div>
              <div className="space-y-2">
                <Label>Texto</Label>
                <Textarea
                  value={templateData.content || ''}
                  onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                  rows={6}
                  placeholder="Conteúdo da página..."
                />
              </div>
            </div>
          )}

          {template === 'editorial' && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Manchete</Label>
                <Input
                  value={templateData.title || ''}
                  onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                  placeholder="Ex: Tendências de Verão 2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Input
                  value={templateData.subtitle || ''}
                  onChange={(e) => setTemplateData({ ...templateData, subtitle: e.target.value })}
                  placeholder="Ex: As cores e estampas que vão dominar a estação"
                />
              </div>
              <div className="space-y-2">
                <Label>Texto do Editorial</Label>
                <Textarea
                  value={templateData.content || ''}
                  onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                  rows={8}
                  placeholder="Texto completo do editorial..."
                />
              </div>
              <div className="space-y-2">
                <Label>Crédito do Autor</Label>
                <Input
                  value={templateData.author || ''}
                  onChange={(e) => setTemplateData({ ...templateData, author: e.target.value })}
                  placeholder="Ex: Maria Silva"
                />
              </div>
            </div>
          )}

          {template === 'marketing' && (
            <div className="space-y-4 border-t pt-4">
              <div className="p-3 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800 mb-4">
                Este template exibe um link para a plataforma <strong>V MODA BRASIL</strong> e a
                assinatura: <strong>"Diretor de Marketing da Revista Moda Atual"</strong>.
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={templateData.title || ''}
                  onChange={(e) => setTemplateData({ ...templateData, title: e.target.value })}
                  placeholder="Ex: O Futuro do Varejo Atacadista"
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea
                  value={templateData.content || ''}
                  onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                  rows={6}
                  placeholder="Descrição do produto ou serviço..."
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Pessoa em Destaque</Label>
                  <Input
                    value={templateData.person_name || ''}
                    onChange={(e) =>
                      setTemplateData({ ...templateData, person_name: e.target.value })
                    }
                    placeholder="Ex: Ana Beltrão"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título / Profissão</Label>
                  <Input
                    value={templateData.person_title || ''}
                    onChange={(e) =>
                      setTemplateData({ ...templateData, person_title: e.target.value })
                    }
                    placeholder="Ex: Estilista e Empresária"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Texto / Biografia</Label>
                <Textarea
                  value={templateData.content || ''}
                  onChange={(e) => setTemplateData({ ...templateData, content: e.target.value })}
                  rows={6}
                  placeholder="Texto da coluna social..."
                />
              </div>
              <div className="space-y-2">
                <Label>Crédito da Foto</Label>
                <Input
                  value={templateData.photo_credit || ''}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, photo_credit: e.target.value })
                  }
                  placeholder="Ex: João Fotografias"
                />
              </div>
            </div>
          )}

          {template === 'entrevista' && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label>Nome do Entrevistador</Label>
                  <Input
                    value={templateData.interviewer_name || ''}
                    onChange={(e) =>
                      setTemplateData({ ...templateData, interviewer_name: e.target.value })
                    }
                    placeholder="Ex: Carlos Mendes"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Introdução (Opcional)</Label>
                <Textarea
                  value={templateData.intro || ''}
                  onChange={(e) => setTemplateData({ ...templateData, intro: e.target.value })}
                  rows={3}
                  placeholder="Texto introdutório da entrevista..."
                />
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <Label>
                    Perguntas e Respostas <span className="text-red-500">*</span>
                  </Label>
                  <Button variant="outline" size="sm" onClick={addQA}>
                    <Plus className="w-4 h-4 mr-2" /> Adicionar P&R
                  </Button>
                </div>
                {validationErrors.qa && (
                  <p className="text-sm text-red-500">{validationErrors.qa}</p>
                )}

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

        {(NEW_TEMPLATE_VALUES as readonly string[]).includes(template) && (
          <NewTemplateForms template={template} data={templateData} setData={setTemplateData} />
        )}

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
