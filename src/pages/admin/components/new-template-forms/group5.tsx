import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, ImageListEditor, setField } from './shared'

function StringListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button variant="outline" size="sm" type="button" onClick={() => onChange([...items, ''])}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const n = [...items]
              n[i] = e.target.value
              onChange(n)
            }}
            placeholder={placeholder}
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => {
              const n = [...items]
              n.splice(i, 1)
              onChange(n)
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  )
}

export function Group5Form({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  const isMarketing = template === 'coluna_marketing_moda'

  if (isMarketing) {
    return (
      <div className="space-y-4 border-t pt-4">
        <div className="p-3 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800 mb-2">
          Esta coluna e assinada pelo <strong>CEO</strong> da Revista Moda Atual.
        </div>
        <FormField label="Titulo da Coluna">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Visao Estrategica"
          />
        </FormField>
        <FormField label="Subtitulo">
          <Input
            value={data.subtitle || ''}
            onChange={(e) => setField(data, setData, 'subtitle', e.target.value)}
            placeholder="Ex: Estrategias digitais no varejo"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Autor">
            <Input
              value={data.author || ''}
              onChange={(e) => setField(data, setData, 'author', e.target.value)}
              placeholder="Valter Mendonca"
            />
          </FormField>
          <FormField label="Data">
            <Input
              value={data.date || ''}
              onChange={(e) => setField(data, setData, 'date', e.target.value)}
              placeholder="Ex: Janeiro 2026"
            />
          </FormField>
        </div>
        <FormField label="Foto do Autor (URL)">
          <Input
            value={data.author_photo || ''}
            onChange={(e) => setField(data, setData, 'author_photo', e.target.value)}
            placeholder="URL da foto"
          />
        </FormField>
        <FormField label="Corpo do Artigo">
          <Textarea
            value={data.body || ''}
            onChange={(e) => setField(data, setData, 'body', e.target.value)}
            rows={6}
            placeholder="Texto do artigo..."
          />
        </FormField>
        <StringListEditor
          label="Insights (3 a 5 conclusoes)"
          items={data.insights || []}
          onChange={(v) => setField(data, setData, 'insights', v)}
          placeholder="Conclusao..."
        />
        <StringListEditor
          label="Para Aplicar (acoes praticas)"
          items={data.practical_actions || []}
          onChange={(v) => setField(data, setData, 'practical_actions', v)}
          placeholder="Acao pratica..."
        />
        <FormField label="Mini-bio do Autor">
          <Textarea
            value={data.author_bio || ''}
            onChange={(e) => setField(data, setData, 'author_bio', e.target.value)}
            rows={2}
            placeholder="Bio do autor..."
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Texto do CTA">
            <Input
              value={data.cta_label || ''}
              onChange={(e) => setField(data, setData, 'cta_label', e.target.value)}
              placeholder="Ex: Saiba Mais"
            />
          </FormField>
          <FormField label="Link do CTA">
            <Input
              value={data.cta_link || ''}
              onChange={(e) => setField(data, setData, 'cta_link', e.target.value)}
              placeholder="/"
            />
          </FormField>
        </div>
        <FormField label="Titulo da Edicao (rodape)">
          <Input
            value={data.edition_title || ''}
            onChange={(e) => setField(data, setData, 'edition_title', e.target.value)}
            placeholder="Ex: Edicao #42"
          />
        </FormField>
      </div>
    )
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <FormField label="Titulo da Coluna">
        <Input
          value={data.title || ''}
          onChange={(e) => setField(data, setData, 'title', e.target.value)}
          placeholder="Ex: Holofote da Semana"
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nome da Pessoa">
          <Input
            value={data.person_name || ''}
            onChange={(e) => setField(data, setData, 'person_name', e.target.value)}
            placeholder="Ex: Ana Beltrao"
          />
        </FormField>
        <FormField label="Cargo / Profissao">
          <Input
            value={data.person_role || ''}
            onChange={(e) => setField(data, setData, 'person_role', e.target.value)}
            placeholder="Ex: Estilista"
          />
        </FormField>
      </div>
      <FormField label="Foto da Pessoa (URL)">
        <Input
          value={data.person_photo || ''}
          onChange={(e) => setField(data, setData, 'person_photo', e.target.value)}
          placeholder="URL da foto"
        />
      </FormField>
      <FormField label="Data">
        <Input
          value={data.date || ''}
          onChange={(e) => setField(data, setData, 'date', e.target.value)}
          placeholder="Ex: Janeiro 2026"
        />
      </FormField>
      <FormField label="Corpo da Coluna">
        <Textarea
          value={data.body || ''}
          onChange={(e) => setField(data, setData, 'body', e.target.value)}
          rows={6}
          placeholder="Texto da coluna..."
        />
      </FormField>
      <StringListEditor
        label="Destaques (3 a 5 marcos)"
        items={data.highlights || []}
        onChange={(v) => setField(data, setData, 'highlights', v)}
        placeholder="Marco ou conquista..."
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Texto do CTA">
          <Input
            value={data.interaction_cta_label || ''}
            onChange={(e) => setField(data, setData, 'interaction_cta_label', e.target.value)}
            placeholder="Ex: Conhecer"
          />
        </FormField>
        <FormField label="Link do CTA">
          <Input
            value={data.interaction_cta_link || ''}
            onChange={(e) => setField(data, setData, 'interaction_cta_link', e.target.value)}
            placeholder="/"
          />
        </FormField>
      </div>
      <FormField label="Titulo da Edicao (rodape)">
        <Input
          value={data.edition_title || ''}
          onChange={(e) => setField(data, setData, 'edition_title', e.target.value)}
          placeholder="Ex: Edicao #42"
        />
      </FormField>
    </div>
  )
}
