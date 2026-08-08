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
import { FormField, setField, addItem, updateItem, removeItem } from './shared'
import { getCategories, type Top60Category } from '@/services/top60'

export function Group2Form({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  const [categories, setCategories] = useState<Top60Category[]>([])

  useEffect(() => {
    if (template === 'top60_marcas') {
      getCategories()
        .then(setCategories)
        .catch(() => {})
    }
  }, [template])

  if (template === 'anuncio_patrocinado') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Anunciante">
          <Input
            value={data.advertiser || ''}
            onChange={(e) => setField(data, setData, 'advertiser', e.target.value)}
            placeholder="Nome do anunciante"
          />
        </FormField>
        <FormField label="Imagem (URL)">
          <Input
            value={data.image || ''}
            onChange={(e) => setField(data, setData, 'image', e.target.value)}
            placeholder="URL da imagem"
          />
        </FormField>
        <FormField label="Headline">
          <Input
            value={data.headline || ''}
            onChange={(e) => setField(data, setData, 'headline', e.target.value)}
            placeholder="Título do anúncio"
          />
        </FormField>
        <FormField label="Descrição">
          <Textarea
            value={data.description || ''}
            onChange={(e) => setField(data, setData, 'description', e.target.value)}
            rows={4}
            placeholder="Texto do anúncio..."
          />
        </FormField>
        <FormField label="Link (V MODA BRASIL)">
          <Input
            value={data.link || ''}
            onChange={(e) => setField(data, setData, 'link', e.target.value)}
            placeholder="/"
          />
        </FormField>
      </div>
    )
  }

  if (template === 'top60_marcas') {
    return (
      <div className="space-y-4 border-t pt-4">
        <div className="p-3 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800 mb-2">
          Selecione uma categoria para exibir as marcas do Top 60 automaticamente na página.
        </div>
        <FormField label="Categoria">
          <Select
            value={data.category || ''}
            onValueChange={(v) => setField(data, setData, 'category', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>
    )
  }

  if (template === 'perfil_marca') {
    const products = data.products || []
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Nome da Marca">
          <Input
            value={data.brand_name || ''}
            onChange={(e) => setField(data, setData, 'brand_name', e.target.value)}
            placeholder="Ex: Lumina Festas"
          />
        </FormField>
        <FormField label="Logo (URL)">
          <Input
            value={data.logo || ''}
            onChange={(e) => setField(data, setData, 'logo', e.target.value)}
            placeholder="URL do logo"
          />
        </FormField>
        <FormField label="Descrição">
          <Textarea
            value={data.description || ''}
            onChange={(e) => setField(data, setData, 'description', e.target.value)}
            rows={4}
            placeholder="Descrição da marca..."
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Website">
            <Input
              value={data.website || ''}
              onChange={(e) => setField(data, setData, 'website', e.target.value)}
              placeholder="https://..."
            />
          </FormField>
          <FormField label="Social Handle">
            <Input
              value={data.social_handle || ''}
              onChange={(e) => setField(data, setData, 'social_handle', e.target.value)}
              placeholder="@marca"
            />
          </FormField>
        </div>
        <div className="flex items-center justify-between">
          <Label>Produtos da Marca</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              addItem(data, setData, 'products', { name: '', image: '', price: '', link: '' })
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
          </Button>
        </div>
        {products.map((p: any, i: number) => (
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
            <Input
              value={p.price}
              onChange={(e) => updateItem(data, setData, 'products', i, 'price', e.target.value)}
              placeholder="Preço"
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <FormField label="Nome do Parceiro/Anunciante">
        <Input
          value={data.partner_name || ''}
          onChange={(e) => setField(data, setData, 'partner_name', e.target.value)}
          placeholder="Nome do parceiro"
        />
      </FormField>
      <FormField label="Logo (URL)">
        <Input
          value={data.logo || ''}
          onChange={(e) => setField(data, setData, 'logo', e.target.value)}
          placeholder="URL do logo"
        />
      </FormField>
      <FormField label="Descrição">
        <Textarea
          value={data.description || ''}
          onChange={(e) => setField(data, setData, 'description', e.target.value)}
          rows={4}
          placeholder="Sobre o parceiro..."
        />
      </FormField>
      <FormField label="Depoimento / Testimonial">
        <Textarea
          value={data.testimonial || ''}
          onChange={(e) => setField(data, setData, 'testimonial', e.target.value)}
          rows={3}
          placeholder="Depoimento do parceiro ou cliente..."
        />
      </FormField>
      <FormField label="Autor do Depoimento">
        <Input
          value={data.testimonial_author || ''}
          onChange={(e) => setField(data, setData, 'testimonial_author', e.target.value)}
          placeholder="Ex: João Silva, CEO da Empresa X"
        />
      </FormField>
      <FormField label="Informações de Contato">
        <Input
          value={data.contact_info || ''}
          onChange={(e) => setField(data, setData, 'contact_info', e.target.value)}
          placeholder="email@exemplo.com / (00) 0000-0000"
        />
      </FormField>
      <FormField label="Link">
        <Input
          value={data.link || ''}
          onChange={(e) => setField(data, setData, 'link', e.target.value)}
          placeholder="/"
        />
      </FormField>
    </div>
  )
}
