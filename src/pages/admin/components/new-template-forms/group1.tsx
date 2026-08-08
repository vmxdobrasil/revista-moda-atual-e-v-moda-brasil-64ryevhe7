import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, ShoppingBag, Info, BarChart3 } from 'lucide-react'
import { FormField, ImageListEditor, setField, updateItem, addItem, removeItem } from './shared'
import { getFeaturedProducts, getImageUrl } from '@/services/marketplace'

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
    const looks = data.looks || []
    const importFromMarketplace = async () => {
      try {
        const products = await getFeaturedProducts()
        const newLooks = products.slice(0, 6).map((p) => ({
          image: getImageUrl(p, p.image_file) || '',
          description: p.name,
          price: `R$ ${p.price.toFixed(2).replace('.', ',')}`,
        }))
        setField(data, setData, 'looks', [...(data.looks || []), ...newLooks])
      } catch {
        /* noop */
      }
    }
    return (
      <div className="space-y-4 border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Título">
            <Input
              value={data.title || ''}
              onChange={(e) => setField(data, setData, 'title', e.target.value)}
              placeholder="Ex: Tendências Verão 2026"
            />
          </FormField>
          <FormField label="Estação / Temporada">
            <Input
              value={data.season || ''}
              onChange={(e) => setField(data, setData, 'season', e.target.value)}
              placeholder="Ex: Verão 2026"
            />
          </FormField>
        </div>
        <FormField label="Descrição">
          <Textarea
            value={data.description || ''}
            onChange={(e) => setField(data, setData, 'description', e.target.value)}
            rows={2}
            placeholder="Descrição do lookbook..."
          />
        </FormField>
        <div className="flex items-center justify-between">
          <Label>Looks (imagem + descrição + preço)</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button" onClick={importFromMarketplace}>
              <ShoppingBag className="w-4 h-4 mr-2" /> Importar do Marketplace
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() =>
                addItem(data, setData, 'looks', { image: '', description: '', price: '' })
              }
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Look
            </Button>
          </div>
        </div>
        {looks.map((look: any, i: number) => (
          <div key={i} className="p-4 border rounded-md bg-gray-50 space-y-2 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              type="button"
              onClick={() => removeItem(data, setData, 'looks', i)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
            <Input
              value={look.image}
              onChange={(e) => updateItem(data, setData, 'looks', i, 'image', e.target.value)}
              placeholder="URL da imagem"
            />
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  value={look.description}
                  onChange={(e) =>
                    updateItem(data, setData, 'looks', i, 'description', e.target.value)
                  }
                  placeholder="Descrição do look"
                />
              </div>
              <Input
                value={look.price}
                onChange={(e) => updateItem(data, setData, 'looks', i, 'price', e.target.value)}
                placeholder="Preço"
              />
            </div>
          </div>
        ))}
        <ImageListEditor
          label="Galeria de Imagens (alternativo)"
          images={data.images || []}
          onChange={(imgs) => setField(data, setData, 'images', imgs)}
        />
        <FormField label="Link V MODA BRASIL">
          <Input
            value={data.link || ''}
            onChange={(e) => setField(data, setData, 'link', e.target.value)}
            placeholder="/"
          />
        </FormField>
        <FormField label="Título da Edição (rodapé)">
          <Input
            value={data.edition_title || ''}
            onChange={(e) => setField(data, setData, 'edition_title', e.target.value)}
            placeholder="Ex: Edição #42"
          />
        </FormField>
      </div>
    )
  }

  if (template === 'indice') {
    return (
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            O sumário é gerado <strong>automaticamente</strong> a partir das páginas da edição
            (campos <code>toc_title</code> e <code>page_number</code>). As seções manuais abaixo são
            opcionais e sobrescrevem a leitura automática.
          </p>
        </div>
        <FormField label="Título da Edição (rodapé)">
          <Input
            value={data.edition_title || ''}
            onChange={(e) => setField(data, setData, 'edition_title', e.target.value)}
            placeholder="Ex: Edição #42"
          />
        </FormField>
        <div className="flex items-center justify-between">
          <Label>Seções Manuais (opcional — sobrescreve auto-read)</Label>
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
      <FormField label="Resumo Executivo">
        <Textarea
          value={data.executive_summary || ''}
          onChange={(e) => setField(data, setData, 'executive_summary', e.target.value)}
          rows={3}
          placeholder="Síntese analítica do trend report..."
        />
      </FormField>
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Dados de Mercado</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() =>
              addItem(data, setData, 'market_data', { label: '', value: 0, unit: '%', trend: 'up' })
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Dado
          </Button>
        </div>
        {(data.market_data || []).map((d: any, i: number) => (
          <div key={i} className="p-3 border rounded-md bg-gray-50 space-y-2 relative mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              type="button"
              onClick={() => removeItem(data, setData, 'market_data', i)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
            <div className="grid grid-cols-4 gap-2 pr-8">
              <div className="col-span-2">
                <Input
                  value={d.label}
                  onChange={(e) =>
                    updateItem(data, setData, 'market_data', i, 'label', e.target.value)
                  }
                  placeholder="Label (ex: Crescimento)"
                />
              </div>
              <Input
                type="number"
                value={d.value}
                onChange={(e) =>
                  updateItem(
                    data,
                    setData,
                    'market_data',
                    i,
                    'value',
                    parseFloat(e.target.value) || 0,
                  )
                }
                placeholder="Valor"
              />
              <Input
                value={d.unit}
                onChange={(e) =>
                  updateItem(data, setData, 'market_data', i, 'unit', e.target.value)
                }
                placeholder="Unidade"
              />
            </div>
            <Select
              value={d.trend || 'up'}
              onValueChange={(v) => updateItem(data, setData, 'market_data', i, 'trend', v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up">↑ Alta</SelectItem>
                <SelectItem value="down">↓ Baixa</SelectItem>
                <SelectItem value="neutral">– Neutro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
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
          <div key={i} className="p-4 border rounded-md bg-gray-50 space-y-2 relative mb-2">
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
              onChange={(e) =>
                updateItem(data, setData, 'trends', i, 'description', e.target.value)
              }
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
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Recomendações</Label>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => addItem(data, setData, 'recommendations', '')}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>
        {(data.recommendations || []).map((r: string, i: number) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input
              value={r}
              onChange={(e) => {
                const arr = [...(data.recommendations || [])]
                arr[i] = e.target.value
                setField(data, setData, 'recommendations', arr)
              }}
              placeholder="Recomendação..."
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => removeItem(data, setData, 'recommendations', i)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
      <FormField label="Título da Edição (rodapé)">
        <Input
          value={data.edition_title || ''}
          onChange={(e) => setField(data, setData, 'edition_title', e.target.value)}
          placeholder="Ex: Edição #42"
        />
      </FormField>
    </div>
  )
}
