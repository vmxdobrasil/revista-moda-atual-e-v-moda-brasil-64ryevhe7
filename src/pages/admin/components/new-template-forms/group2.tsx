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
import { getCategories, type Top60Category } from '@/services/top60'
import {
  getProposals,
  AD_FORMATS,
  FORMAT_LABELS,
  PROPOSAL_STATUSES,
  PROPOSAL_STATUS_LABELS,
} from '@/services/ad-proposals'
import type { AdProposal } from '@/services/ad-proposals'

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
  const [proposals, setProposals] = useState<AdProposal[]>([])

  useEffect(() => {
    if (template === 'top60_marcas')
      getCategories()
        .then(setCategories)
        .catch(() => {})
    if (template === 'parceiro_anunciante')
      getProposals()
        .then(setProposals)
        .catch(() => {})
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
        <FormField label="Campanha">
          <Input
            value={data.campaign || ''}
            onChange={(e) => setField(data, setData, 'campaign', e.target.value)}
            placeholder="Ex: Coleção Verão 2026"
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
        <FormField label="Texto do Anúncio">
          <Textarea
            value={data.body || data.description || ''}
            onChange={(e) => setField(data, setData, 'body', e.target.value)}
            rows={4}
            placeholder="Texto completo do anúncio..."
          />
        </FormField>
        <FormField label="Rótulo do CTA">
          <Input
            value={data.cta_label || ''}
            onChange={(e) => setField(data, setData, 'cta_label', e.target.value)}
            placeholder="Ex: Ver Coleção"
          />
        </FormField>
        <FormField label="Link para o catálogo no V MODA BRASIL">
          <Input
            value={data.catalog_link || ''}
            onChange={(e) => setField(data, setData, 'catalog_link', e.target.value)}
            placeholder="https://revistamodaatual.com.br/catalogo/sua-marca"
          />
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
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Categoria (texto)">
            <Input
              value={data.category_name || ''}
              onChange={(e) => setField(data, setData, 'category_name', e.target.value)}
              placeholder="Ex: Moda Festa"
            />
          </FormField>
          <FormField label="Posição no Ranking">
            <Input
              type="number"
              value={data.position || ''}
              onChange={(e) => setField(data, setData, 'position', parseInt(e.target.value) || 0)}
              placeholder="Ex: 1"
            />
          </FormField>
        </div>
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
        <FormField label="Link para o catálogo no V MODA BRASIL">
          <Input
            value={data.catalog_link || ''}
            onChange={(e) => setField(data, setData, 'catalog_link', e.target.value)}
            placeholder="https://revistamodaatual.com.br/catalogo/sua-marca"
          />
        </FormField>
        <FormField label="Destaques (um por linha)">
          <Textarea
            value={(data.highlights || []).join('\n')}
            onChange={(e) =>
              setField(
                data,
                setData,
                'highlights',
                e.target.value.split('\n').filter((s: string) => s.trim()),
              )
            }
            rows={3}
            placeholder="Fundada em 2015&#10;Presente em 12 estados&#10;Faturamento cresceu 200%"
          />
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

  if (template === 'parceiro_anunciante') {
    return (
      <div className="space-y-4 border-t pt-4">
        {proposals.length > 0 && (
          <FormField label="Vincular a Proposta Existente">
            <Select
              value={data.proposal_id || ''}
              onValueChange={(val) => {
                const prop = proposals.find((p) => p.id === val)
                if (prop) {
                  setData({
                    ...data,
                    proposal_id: val,
                    partner_name: prop.advertiser,
                    campaign: prop.campaign || '',
                    format: FORMAT_LABELS[prop.format] || prop.format || '',
                    position: prop.position || '',
                    audience_reach: prop.audience_reach || 0,
                    suggested_price: prop.suggested_price || 0,
                    status: PROPOSAL_STATUS_LABELS[prop.status] || prop.status || '',
                  })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma proposta..." />
              </SelectTrigger>
              <SelectContent>
                {proposals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.advertiser} — {p.campaign || 'Sem campanha'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
        <FormField label="Nome do Parceiro / Anunciante">
          <Input
            value={data.partner_name || data.advertiser || ''}
            onChange={(e) => setField(data, setData, 'partner_name', e.target.value)}
            placeholder="Ex: Atelier BH"
          />
        </FormField>
        <FormField label="Campanha">
          <Input
            value={data.campaign || ''}
            onChange={(e) => setField(data, setData, 'campaign', e.target.value)}
            placeholder="Ex: Coleção Inverno 2026"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Formato">
            <Select
              value={data.format || ''}
              onValueChange={(val) => setField(data, setData, 'format', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {AD_FORMATS.map((f) => (
                  <SelectItem key={f} value={FORMAT_LABELS[f] || f}>
                    {FORMAT_LABELS[f] || f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Posição">
            <Input
              value={data.position || ''}
              onChange={(e) => setField(data, setData, 'position', e.target.value)}
              placeholder="Ex: Capa principal"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Alcance (audiência)">
            <Input
              type="number"
              value={data.audience_reach || ''}
              onChange={(e) =>
                setField(data, setData, 'audience_reach', parseInt(e.target.value) || 0)
              }
              placeholder="Ex: 50000"
            />
          </FormField>
          <FormField label="Preço Sugerido (R$)">
            <Input
              type="number"
              value={data.suggested_price || ''}
              onChange={(e) =>
                setField(data, setData, 'suggested_price', parseFloat(e.target.value) || 0)
              }
              placeholder="Ex: 5000"
            />
          </FormField>
        </div>
        <FormField label="Status">
          <Select
            value={data.status || ''}
            onValueChange={(val) => setField(data, setData, 'status', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {PROPOSAL_STATUSES.map((s) => (
                <SelectItem key={s} value={PROPOSAL_STATUS_LABELS[s] || s}>
                  {PROPOSAL_STATUS_LABELS[s] || s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <FormField label="Link para o catálogo no V MODA BRASIL">
          <Input
            value={data.catalog_link || ''}
            onChange={(e) => setField(data, setData, 'catalog_link', e.target.value)}
            placeholder="https://revistamodaatual.com.br/catalogo/sua-marca"
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

  return null
}
