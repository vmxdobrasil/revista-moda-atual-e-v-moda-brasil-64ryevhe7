import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, ImageListEditor, setField, updateItem, addItem, removeItem } from './shared'

export function Group1Form({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  if (template === 'lookbook') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Título">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Tendências Verão 2026"
          />
        </FormField>
        <FormField label="Descrição">
          <Textarea
            value={data.description || ''}
            onChange={(e) => setField(data, setData, 'description', e.target.value)}
            rows={2}
            placeholder="Descrição do lookbook..."
          />
        </FormField>
        <ImageListEditor
          label="Galeria de Imagens"
          images={data.images || []}
          onChange={(imgs) => setField(data, setData, 'images', imgs)}
        />
        <FormField label="Link V MODA BRASIL (opcional)">
          <Input
            value={data.link || ''}
            onChange={(e) => setField(data, setData, 'link', e.target.value)}
            placeholder="/"
          />
        </FormField>
      </div>
    )
  }

  if (template === 'indice') {
    return (
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label>Seções do Sumário</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => addItem(data, setData, 'sections', { title: '', link: '' })}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Seção
          </Button>
        </div>
        {(data.sections || []).map((s: any, i: number) => (
          <div key={i} className="flex gap-2 items-start p-3 border rounded-md bg-gray-50">
            <Input
              value={s.title}
              onChange={(e) => updateItem(data, setData, 'sections', i, 'title', e.target.value)}
              placeholder="Título da seção"
              className="flex-1"
            />
            <Input
              value={s.link}
              onChange={(e) => updateItem(data, setData, 'sections', i, 'link', e.target.value)}
              placeholder="Link"
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => removeItem(data, setData, 'sections', i)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Título">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Tendências 2026"
          />
        </FormField>
        <FormField label="Autor">
          <Input
            value={data.author || ''}
            onChange={(e) => setField(data, setData, 'author', e.target.value)}
            placeholder="Ex: Maria Silva"
          />
        </FormField>
      </div>
      <FormField label="Data">
        <Input
          value={data.date || ''}
          onChange={(e) => setField(data, setData, 'date', e.target.value)}
          placeholder="Ex: Janeiro 2026"
        />
      </FormField>
      <div className="flex items-center justify-between">
        <Label>Itens de Tendência</Label>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() =>
            addItem(data, setData, 'trends', { headline: '', description: '', image: '' })
          }
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>
      {(data.trends || []).map((t: any, i: number) => (
        <div key={i} className="p-4 border rounded-md bg-gray-50 space-y-2 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            type="button"
            onClick={() => removeItem(data, setData, 'trends', i)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
          <Input
            value={t.headline}
            onChange={(e) => updateItem(data, setData, 'trends', i, 'headline', e.target.value)}
            placeholder="Headline da tendência"
          />
          <Textarea
            value={t.description}
            onChange={(e) => updateItem(data, setData, 'trends', i, 'description', e.target.value)}
            rows={2}
            placeholder="Descrição"
          />
          <Input
            value={t.image}
            onChange={(e) => updateItem(data, setData, 'trends', i, 'image', e.target.value)}
            placeholder="URL da imagem"
          />
        </div>
      ))}
    </div>
  )
}
