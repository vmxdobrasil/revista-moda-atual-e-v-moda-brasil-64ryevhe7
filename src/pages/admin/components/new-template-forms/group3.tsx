import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import {
  FormField,
  ImageListEditor,
  setField,
  setNested,
  updateItem,
  addItem,
  removeItem,
} from './shared'

export function Group3Form({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  if (template === 'galeria_produtos') {
    return (
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label>Produtos</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              addItem(data, setData, 'products', { name: '', image: '', description: '', link: '' })
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
          </Button>
        </div>
        {(data.products || []).map((p: any, i: number) => (
          <div key={i} className="p-4 border rounded-md bg-gray-50 space-y-2 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              type="button"
              onClick={() => removeItem(data, setData, 'products', i)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
            <Input
              value={p.name}
              onChange={(e) => updateItem(data, setData, 'products', i, 'name', e.target.value)}
              placeholder="Nome do produto"
            />
            <Input
              value={p.image}
              onChange={(e) => updateItem(data, setData, 'products', i, 'image', e.target.value)}
              placeholder="URL da imagem"
            />
            <Textarea
              value={p.description}
              onChange={(e) =>
                updateItem(data, setData, 'products', i, 'description', e.target.value)
              }
              rows={2}
              placeholder="Descrição"
            />
            <Input
              value={p.link}
              onChange={(e) => updateItem(data, setData, 'products', i, 'link', e.target.value)}
              placeholder="/ (link para V MODA BRASIL)"
            />
          </div>
        ))}
      </div>
    )
  }

  if (template === 'materia_cta') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Título da Matéria">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: O Futuro do Varejo"
          />
        </FormField>
        <FormField label="Corpo da Matéria">
          <Textarea
            value={data.body || ''}
            onChange={(e) => setField(data, setData, 'body', e.target.value)}
            rows={8}
            placeholder="Texto da matéria... (use Enter para parágrafos)"
          />
        </FormField>
        <ImageListEditor
          label="Imagens"
          images={data.images || []}
          onChange={(imgs) => setField(data, setData, 'images', imgs)}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Texto do CTA">
            <Input
              value={data.cta_label || ''}
              onChange={(e) => setField(data, setData, 'cta_label', e.target.value)}
              placeholder="Ex: Confira"
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
      </div>
    )
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="p-3 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800 mb-2">
        Configure as duas opções para o comparativo A/B.
      </div>
      {(['option_a', 'option_b'] as const).map((key) => (
        <div key={key} className="p-4 border rounded-md bg-gray-50 space-y-2">
          <Label className="text-sm font-semibold">
            {key === 'option_a' ? 'Opção A' : 'Opção B'}
          </Label>
          <Input
            value={data[key]?.title || ''}
            onChange={(e) => setNested(data, setData, key, 'title', e.target.value)}
            placeholder="Título"
          />
          <Textarea
            value={data[key]?.description || ''}
            onChange={(e) => setNested(data, setData, key, 'description', e.target.value)}
            rows={2}
            placeholder="Descrição"
          />
          <Input
            value={data[key]?.image || ''}
            onChange={(e) => setNested(data, setData, key, 'image', e.target.value)}
            placeholder="URL da imagem"
          />
          <Input
            value={data[key]?.link || ''}
            onChange={(e) => setNested(data, setData, key, 'link', e.target.value)}
            placeholder="Link (opcional)"
          />
        </div>
      ))}
    </div>
  )
}
