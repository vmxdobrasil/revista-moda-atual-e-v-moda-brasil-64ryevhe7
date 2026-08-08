import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, setField, updateItem, addItem, removeItem, setNested } from './shared'
import { getAllProducts, type MarketplaceProduct, getImageUrl } from '@/services/marketplace'
import { formatPrice } from '@/services/marketplace'

export function Group3Form({
  template,
  data,
  setData,
}: {
  template: string
  data: any
  setData: (d: any) => void
}) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])

  useEffect(() => {
    if (
      template === 'galeria_produtos' ||
      template === 'materia_cta' ||
      template === 'comparativo_ab'
    ) {
      getAllProducts()
        .then(setProducts)
        .catch(() => {})
    }
  }, [template])

  if (template === 'galeria_produtos') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Título da Galeria">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Produtos em Destaque"
          />
        </FormField>
        {products.length > 0 && (
          <FormField label="Importar do Marketplace">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                const existing = data.products || []
                const imported = products.slice(0, 6).map((p) => ({
                  name: p.name,
                  image: p.image_file ? getImageUrl(p, p.image_file) : '',
                  description: p.description || '',
                  price: formatPrice(p.price, p.currency),
                  link: p.link || '/',
                }))
                setField(data, setData, 'products', [...existing, ...imported])
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Importar 6 Produtos
            </Button>
          </FormField>
        )}
        <div className="flex items-center justify-between">
          <Label>Produtos</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              addItem(data, setData, 'products', {
                name: '',
                image: '',
                description: '',
                price: '',
                link: '',
              })
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
              value={p.description}
              onChange={(e) =>
                updateItem(data, setData, 'products', i, 'description', e.target.value)
              }
              placeholder="Descrição curta"
            />
            <Input
              value={p.price}
              onChange={(e) => updateItem(data, setData, 'products', i, 'price', e.target.value)}
              placeholder="Preço (ex: R$ 129,90)"
            />
            <Input
              value={p.link}
              onChange={(e) => updateItem(data, setData, 'products', i, 'link', e.target.value)}
              placeholder="/ (link)"
            />
          </div>
        ))}
      </div>
    )
  }

  if (template === 'materia_cta') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Manchete">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: O Futuro do Varejo de Moda"
          />
        </FormField>
        <FormField label="Subtítulo">
          <Input
            value={data.subtitle || ''}
            onChange={(e) => setField(data, setData, 'subtitle', e.target.value)}
            placeholder="Ex: Como a digitalização transforma o setor"
          />
        </FormField>
        <FormField label="Corpo da Matéria">
          <Textarea
            value={data.body || ''}
            onChange={(e) => setField(data, setData, 'body', e.target.value)}
            rows={8}
            placeholder="Texto completo da matéria..."
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
            rows={3}
            placeholder="https://..."
          />
        </FormField>
        <FormField label="Créditos">
          <Input
            value={data.credits || ''}
            onChange={(e) => setField(data, setData, 'credits', e.target.value)}
            placeholder="Ex: Equipe Revista MODA ATUAL"
          />
        </FormField>
        <FormField label="Rótulo do CTA">
          <Input
            value={data.cta_label || ''}
            onChange={(e) => setField(data, setData, 'cta_label', e.target.value)}
            placeholder="Ex: Conheça V MODA BRASIL"
          />
        </FormField>
        <FormField label="Link do CTA">
          <Input
            value={data.cta_link || ''}
            onChange={(e) => setField(data, setData, 'cta_link', e.target.value)}
            placeholder="/"
          />
        </FormField>
        {products.length > 0 && (
          <FormField label="Produto de Destaque (opcional)">
            <Select
              value={data.target_product || ''}
              onValueChange={(val) => setField(data, setData, 'target_product', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {formatPrice(p.price, p.currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      </div>
    )
  }

  if (template === 'comparativo_ab') {
    return (
      <div className="space-y-4 border-t pt-4">
        <FormField label="Título do Comparativo">
          <Input
            value={data.title || ''}
            onChange={(e) => setField(data, setData, 'title', e.target.value)}
            placeholder="Ex: Minimalista vs Maximalista"
          />
        </FormField>
        {['option_a', 'option_b'].map((key) => (
          <div key={key} className="p-4 border rounded-md bg-gray-50 space-y-2">
            <Label className="font-semibold">Opção {key === 'option_a' ? 'A' : 'B'}</Label>
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
              value={data[key]?.price || ''}
              onChange={(e) => setNested(data, setData, key, 'price', e.target.value)}
              placeholder="Preço (ex: R$ 129,90)"
            />
            <Input
              value={data[key]?.link || ''}
              onChange={(e) => setNested(data, setData, key, 'link', e.target.value)}
              placeholder="/ (link)"
            />
          </div>
        ))}
        <FormField label="Fatores Decisivos (um por linha)">
          <Textarea
            value={(data.deciding_factors || []).join('\n')}
            onChange={(e) =>
              setField(
                data,
                setData,
                'deciding_factors',
                e.target.value.split('\n').filter((s: string) => s.trim()),
              )
            }
            rows={3}
            placeholder="Custo-benefício&#10;Qualidade do tecido&#10;Versatilidade"
          />
        </FormField>
        <FormField label="Rótulo do CTA">
          <Input
            value={data.cta_label || ''}
            onChange={(e) => setField(data, setData, 'cta_label', e.target.value)}
            placeholder="Ex: Ver Opções"
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
    )
  }

  return null
}
