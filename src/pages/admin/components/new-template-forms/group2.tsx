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
import { FormField, setField, setNested, updateItem, addItem, removeItem } from './shared'
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
            placeholder="Ex: Lumina Festas"
          />
        </FormField>
        <FormField label="Imagem (URL)">
          <Input
            value={data.image || ''}
            onChange={(e) => setField(data, setData, 'image', e.target.value)}
            placeholder="URL da imagem"
          />
        </FormField>
        <FormField label="Manchete">
          <Input
            value={data.headline || ''}
            onChange={(e) => setField(data, setData, 'headline', e.target.value)}
            placeholder="Ex: Coleção Verão 2026"
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
        <FormField label="Link para o catálogo da marca no V MODA BRASIL">
          <Input
            value={data.catalog_link || ''}
            onChange={(e) => setField(data, setData, 'catalog_link', e.target.value)}
            placeholder="https://revistamodaatual.com.br/catalogo/sua-marca"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se vazio, usa o link de fallback ({data.link || '/'}).
          </p>
        </FormField>
        <FormField label="Link de fallback (opcional)">
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
        <FormField label="Categoria">
          <Select
            value={data.category || ''}
            onValueChange={(val) => setField(data, setData, 'category', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            As marcas são carregadas automaticamente da categoria selecionada.
          </p>
        </FormField>
      </div>
    )
  }

  if (template === 'perfil_marca') {
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
          <FormField label="Handle Social">
            <Input
              value={data.social_handle || ''}
              onChange={(e) => setField(data, setData, 'social_handle', e.target.value)}
              placeholder="@marca"
            />
          </FormField>
        </div>
        <FormField label="Link para o catálogo da marca no V MODA BRASIL">
          <Input
            value={data.catalog_link || ''}
            onChange={(e) => setField(data, setData, 'catalog_link', e.target.value)}
            placeholder="https://revistamodaatual.com.br/catalogo/sua-marca"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se vazio, usa o website ({data.website || 'não definido'}).
          </p>
        </FormField>
        <div className="flex items-center justify-between">
          <Label>Produtos em Destaque</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              addItem(data, setData, 'products', { name: '', image: '', price: '', link: '' })
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar
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
            <Input
              value={p.price}
              onChange={(e) => updateItem(data, setData, 'products', i, 'price', e.target.value)}
              placeholder="Preço (ex: R$ 129,90)"
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

  return (
    <div className="space-y-4 border-t pt-4">
      <FormField label="Nome do Parceiro">
        <Input
          value={data.partner_name || ''}
          onChange={(e) => setField(data, setData, 'partner_name', e.target.value)}
          placeholder="Ex: Atelier BH"
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
          placeholder="Descrição do parceiro..."
        />
      </FormField>
      <FormField label="Informações de Contato">
        <Input
          value={data.contact_info || ''}
          onChange={(e) => setField(data, setData, 'contact_info', e.target.value)}
          placeholder="email@marca.com - (00) 0000-0000"
        />
      </FormField>
      <FormField label="Link para o catálogo da marca no V MODA BRASIL">
        <Input
          value={data.catalog_link || ''}
          onChange={(e) => setField(data, setData, 'catalog_link', e.target.value)}
          placeholder="https://revistamodaatual.com.br/catalogo/sua-marca"
        />
        <p className="text-xs text-gray-500 mt-1">
          Se vazio, usa o link de fallback ({data.link || '/'}).
        </p>
      </FormField>
      <FormField label="Link de fallback (opcional)">
        <Input
          value={data.link || ''}
          onChange={(e) => setField(data, setData, 'link', e.target.value)}
          placeholder="/"
        />
      </FormField>
      <FormField label="Depoimento">
        <Textarea
          value={data.testimonial || ''}
          onChange={(e) => setField(data, setData, 'testimonial', e.target.value)}
          rows={3}
          placeholder="Texto do depoimento..."
        />
      </FormField>
      <FormField label="Autor do Depoimento">
        <Input
          value={data.testimonial_author || ''}
          onChange={(e) => setField(data, setData, 'testimonial_author', e.target.value)}
          placeholder="Ex: Mariana Costa, CEO"
        />
      </FormField>
    </div>
  )
}
