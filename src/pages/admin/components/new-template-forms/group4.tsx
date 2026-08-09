import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField, setField, updateItem, addItem, removeItem } from './shared'
import { getAllStoryTexts, type StoryText } from '@/services/story-texts'
import { getCampaigns, type NewsletterCampaign } from '@/services/newsletter'

function CtaVariantField({ data, setData }: { data: any; setData: (d: any) => void }) {
  return (
    <FormField label="CTA Variante (A/B/C)">
      <Select
        value={data.cta_variant || ''}
        onValueChange={(val) => setField(data, setData, 'cta_variant', val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="A">Variante A</SelectItem>
          <SelectItem value="B">Variante B</SelectItem>
          <SelectItem value="C">Variante C</SelectItem>
        </SelectContent>
      </Select>
    </FormField>
  )
}

export function Group4Form({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  const [storyTexts, setStoryTexts] = useState<StoryText[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])

  useEffect(() => {
    if (template === 'story_social')
      getAllStoryTexts()
        .then(setStoryTexts)
        .catch(() => {})
    if (template === 'newsletter_preview')
      getCampaigns()
        .then(setCampaigns)
        .catch(() => {})
  }, [template])

  if (template === 'story_social') {
    return (
      <div className="space-y-4 border-t pt-4">
        {storyTexts.length > 0 && (
          <FormField label="Importar de Story Texts">
            <Select
              value={data.story_text_id || ''}
              onValueChange={(val) => {
                const st = storyTexts.find((s) => s.id === val)
                if (st) {
                  setData({
                    ...data,
                    story_text_id: val,
                    subject: st.subject,
                    hook: st.subject,
                    options: st.options,
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um story text..." />
              </SelectTrigger>
              <SelectContent>
                {storyTexts.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
        <FormField label="Assunto">
          <Input
            value={data.subject || ''}
            onChange={(e) => setField(data, setData, 'subject', e.target.value)}
            placeholder="Ex: Tendências de Verão"
          />
        </FormField>
        <FormField label="Hook / Gancho">
          <Input
            value={data.hook || ''}
            onChange={(e) => setField(data, setData, 'hook', e.target.value)}
            placeholder="Ex: Você viu essa tendência?"
          />
        </FormField>
        <FormField label="Imagem (URL)">
          <Input
            value={data.image || ''}
            onChange={(e) => setField(data, setData, 'image', e.target.value)}
            placeholder="URL da imagem"
          />
        </FormField>
        <FormField label="Legenda">
          <Textarea
            value={data.caption || ''}
            onChange={(e) => setField(data, setData, 'caption', e.target.value)}
            rows={4}
            placeholder="Legenda do story..."
          />
        </FormField>
        <FormField label="Rótulo do CTA">
          <Input
            value={data.cta_label || ''}
            onChange={(e) => setField(data, setData, 'cta_label', e.target.value)}
            placeholder="Ex: Saiba Mais"
          />
        </FormField>
        <FormField label="Link do CTA">
          <Input
            value={data.link || data.cta_link || ''}
            onChange={(e) => setField(data, setData, 'link', e.target.value)}
            placeholder="/"
          />
        </FormField>
        <CtaVariantField data={data} setData={setData} />
      </div>
    )
  }

  if (template === 'newsletter_preview') {
    return (
      <div className="space-y-4 border-t pt-4">
        {campaigns.length > 0 && (
          <FormField label="Importar de Campanha Existente">
            <Select
              value={data.campaign_id || ''}
              onValueChange={(val) => {
                const c = campaigns.find((c) => c.id === val)
                if (c) {
                  setData({
                    ...data,
                    campaign_id: val,
                    title: c.title,
                    subject: c.subject || '',
                    preheader: c.preheader || '',
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma campanha..." />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
        <FormField label="Título">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Edição Especial Verão 2026"
          />
        </FormField>
        <FormField label="Assunto">
          <Input
            value={data.subject || ''}
            onChange={(e) => setField(data, setData, 'subject', e.target.value)}
            placeholder="Assunto do email"
          />
        </FormField>
        <FormField label="Preheader">
          <Input
            value={data.preheader || ''}
            onChange={(e) => setField(data, setData, 'preheader', e.target.value)}
            placeholder="Texto de pré-visualização"
          />
        </FormField>
        <FormField label="Conteúdo">
          <Textarea
            value={data.content || ''}
            onChange={(e) => setField(data, setData, 'content', e.target.value)}
            rows={5}
            placeholder="Conteúdo da newsletter..."
          />
        </FormField>
        <div className="flex items-center justify-between">
          <Label>Seções</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => addItem(data, setData, 'sections', { title: '', summary: '' })}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>
        {(data.sections || []).map((s: any, i: number) => (
          <div key={i} className="p-3 border rounded-md bg-gray-50 space-y-2 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              type="button"
              onClick={() => removeItem(data, setData, 'sections', i)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
            <Input
              value={s.title || ''}
              onChange={(e) => updateItem(data, setData, 'sections', i, 'title', e.target.value)}
              placeholder="Título da seção"
            />
            <Textarea
              value={s.summary || ''}
              onChange={(e) => updateItem(data, setData, 'sections', i, 'summary', e.target.value)}
              rows={2}
              placeholder="Resumo da seção"
            />
          </div>
        ))}
        <FormField label="Rótulo do CTA">
          <Input
            value={data.cta_label || ''}
            onChange={(e) => setField(data, setData, 'cta_label', e.target.value)}
            placeholder="Ex: Ler Edição Completa"
          />
        </FormField>
        <FormField label="Link do CTA">
          <Input
            value={data.cta_link || ''}
            onChange={(e) => setField(data, setData, 'cta_link', e.target.value)}
            placeholder="/"
          />
        </FormField>
        <CtaVariantField data={data} setData={setData} />
      </div>
    )
  }

  if (template === 'capa_edicao') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Imagem de Capa (URL)">
          <Input
            value={data.cover_image || ''}
            onChange={(e) => setField(data, setData, 'cover_image', e.target.value)}
            placeholder="URL da imagem"
          />
        </FormField>
        <FormField label="Título">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Edição Especial"
          />
        </FormField>
        <FormField label="Texto Alternativo da Capa">
          <Input
            value={data.cover_alt_text || ''}
            onChange={(e) => setField(data, setData, 'cover_alt_text', e.target.value)}
            placeholder="Descrição da imagem para acessibilidade"
          />
        </FormField>
        <FormField label="Subtítulo">
          <Input
            value={data.subtitle || ''}
            onChange={(e) => setField(data, setData, 'subtitle', e.target.value)}
            placeholder="Ex: Verão 2026"
          />
        </FormField>
        <div className="flex items-center justify-between">
          <Label>Destaques da Edição</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => addItem(data, setData, 'highlights', '')}
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>
        {(data.highlights || []).map((h: string, i: number) => (
          <div key={i} className="flex gap-2">
            <Input
              value={h}
              onChange={(e) => {
                const arr = [...(data.highlights || [])]
                arr[i] = e.target.value
                setField(data, setData, 'highlights', arr)
              }}
              placeholder="Ex: Tendências Verão 2026"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => removeItem(data, setData, 'highlights', i)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <FormField label="Rótulo do CTA">
          <Input
            value={data.cta_label || ''}
            onChange={(e) => setField(data, setData, 'cta_label', e.target.value)}
            placeholder="Ex: Ler Agora"
          />
        </FormField>
        <FormField label="Link do CTA">
          <Input
            value={data.link || ''}
            onChange={(e) => setField(data, setData, 'link', e.target.value)}
            placeholder="/"
          />
        </FormField>
      </div>
    )
  }

  if (template === 'fashion_editorial') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Título">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Nova Era"
          />
        </FormField>
        <FormField label="Legenda / Título do Sumário (TOC)">
          <Input
            value={data.toc_title || ''}
            onChange={(e) => setField(data, setData, 'toc_title', e.target.value)}
            placeholder="Ex: Editorial — Nova Era"
          />
        </FormField>
        <FormField label="Introdução">
          <Textarea
            value={data.intro || ''}
            onChange={(e) => setField(data, setData, 'intro', e.target.value)}
            rows={3}
            placeholder="Texto introdutório..."
          />
        </FormField>
        <FormField label="Imagens (URLs, uma por linha)">
          <Textarea
            value={(data.images || []).join('\n')}
            onChange={(e) =>
              setField(
                data,
                setData,
                'images',
                e.target.value.split('\n').filter((s: string) => s.trim()),
              )
            }
            rows={4}
            placeholder="https://..."
          />
        </FormField>
        <FormField label="Corpo do Editorial">
          <Textarea
            value={data.body || ''}
            onChange={(e) => setField(data, setData, 'body', e.target.value)}
            rows={6}
            placeholder="Texto completo..."
          />
        </FormField>
        <FormField label="Créditos">
          <Input
            value={data.credits || ''}
            onChange={(e) => setField(data, setData, 'credits', e.target.value)}
            placeholder="Ex: Fotografia por João Silva"
          />
        </FormField>
      </div>
    )
  }

  return null
}
