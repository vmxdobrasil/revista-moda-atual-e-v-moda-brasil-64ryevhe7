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
import { Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

export interface FormProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  errors?: Record<string, string>
}

function set(data: any, onChange: any, k: string, v: any) {
  onChange({ ...data, [k]: v })
}
function err(errors: any, k: string) {
  return errors?.[k]
}
function F({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
function StrList({
  items,
  onChange,
  ph,
}: {
  items: string[]
  onChange: (v: string[]) => void
  ph: string
}) {
  return (
    <div className="space-y-1">
      {(items || []).map((s, i) => (
        <div key={i} className="flex gap-1">
          <Input
            value={s}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            className="text-xs h-7"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange([...(items || []), ''])}>
        <Plus className="w-3 h-3 mr-1" />
        {ph}
      </Button>
    </div>
  )
}

export function GaleriaProdutosForm({ data, onChange, errors }: FormProps) {
  const products: any[] = data.products || []
  const setP = (i: number, k: string, v: string) =>
    onChange({ ...data, products: products.map((p, j) => (j === i ? { ...p, [k]: v } : p)) })
  return (
    <div className="space-y-3">
      <F label="Título" error={err(errors, 'title')}>
        <Input
          value={data.title || ''}
          onChange={(e) => set(data, onChange, 'title', e.target.value)}
          className={err(errors, 'title') ? 'border-red-500' : ''}
        />
      </F>
      <F label="Subtítulo" error={err(errors, 'subtitle')}>
        <Input
          value={data.subtitle || ''}
          onChange={(e) => set(data, onChange, 'subtitle', e.target.value)}
        />
      </F>
      <F label="Produtos" error={err(errors, 'products')}>
        <div className="space-y-2">
          {products.map((p, i) => (
            <div key={i} className="flex gap-2 items-start p-2 border rounded-md">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Nome do produto"
                  value={p.name || ''}
                  onChange={(e) => setP(i, 'name', e.target.value)}
                  className="text-xs h-7"
                />
                <Input
                  placeholder="URL da imagem"
                  value={p.image || ''}
                  onChange={(e) => setP(i, 'image', e.target.value)}
                  className="text-xs h-7"
                />
                <Input
                  placeholder="Descrição curta"
                  value={p.description || ''}
                  onChange={(e) => setP(i, 'description', e.target.value)}
                  className="text-xs h-7"
                />
                <Input
                  placeholder="Preço (ex: R$ 89,90)"
                  value={p.price || ''}
                  onChange={(e) => setP(i, 'price', e.target.value)}
                  className="text-xs h-7"
                />
                <Input
                  placeholder="Link (opcional)"
                  value={p.link || ''}
                  onChange={(e) => setP(i, 'link', e.target.value)}
                  className="text-xs h-7"
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onChange({ ...data, products: products.filter((_, j) => j !== i) })}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChange({ ...data, products: [...products, {}] })}
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar produto
          </Button>
        </div>
      </F>
    </div>
  )
}

export function MateriaCtaForm({ data, onChange, errors }: FormProps) {
  return (
    <div className="space-y-3">
      <F label="Título" error={err(errors, 'title')}>
        <Input
          value={data.title || ''}
          onChange={(e) => set(data, onChange, 'title', e.target.value)}
          className={err(errors, 'title') ? 'border-red-500' : ''}
        />
      </F>
      <F label="Subtítulo">
        <Input
          value={data.subtitle || ''}
          onChange={(e) => set(data, onChange, 'subtitle', e.target.value)}
        />
      </F>
      <F label="Corpo da matéria" error={err(errors, 'body')}>
        <Textarea
          value={data.body || ''}
          onChange={(e) => set(data, onChange, 'body', e.target.value)}
          className="min-h-[120px]"
        />
      </F>
      <F label="Imagens">
        <StrList
          items={data.images || []}
          onChange={(v) => set(data, onChange, 'images', v)}
          ph="Adicionar URL de imagem"
        />
      </F>
      <div className="p-2 border rounded-md space-y-3 bg-orange-50/30">
        <p className="text-xs font-semibold text-orange-600">Bloco CTA</p>
        <F label="CTA Headline">
          <Input
            value={data.cta_headline || ''}
            onChange={(e) => set(data, onChange, 'cta_headline', e.target.value)}
            placeholder="Ex: Conheça V MODA BRASIL"
          />
        </F>
        <F label="CTA Texto do botão">
          <Input
            value={data.cta_label || ''}
            onChange={(e) => set(data, onChange, 'cta_label', e.target.value)}
            placeholder="Ex: Saiba Mais"
          />
        </F>
        <F label="CTA Link">
          <Input
            value={data.cta_link || ''}
            onChange={(e) => set(data, onChange, 'cta_link', e.target.value)}
            placeholder="/"
          />
        </F>
        <F label="CTA Variante" error={err(errors, 'cta_variant')}>
          <Select
            value={data.cta_variant || ''}
            onValueChange={(v) => set(data, onChange, 'cta_variant', v)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Variante A</SelectItem>
              <SelectItem value="B">Variante B</SelectItem>
              <SelectItem value="C">Variante C</SelectItem>
            </SelectContent>
          </Select>
        </F>
      </div>
      <F label="Créditos">
        <Input
          value={data.credits || ''}
          onChange={(e) => set(data, onChange, 'credits', e.target.value)}
          placeholder="Ex: Equipe Revista MODA ATUAL"
        />
      </F>
    </div>
  )
}

export function ComparativoAbForm({ data, onChange, errors }: FormProps) {
  const opt = (key: string) => data[key] || {}
  const setOpt = (key: string, field: string, value: any) =>
    onChange({ ...data, [key]: { ...opt(key), [field]: value } })
  const points: string[] = data.comparison_points || data.deciding_factors || []
  return (
    <div className="space-y-3">
      <F label="Título" error={err(errors, 'title')}>
        <Input
          value={data.title || ''}
          onChange={(e) => set(data, onChange, 'title', e.target.value)}
          className={err(errors, 'title') ? 'border-red-500' : ''}
        />
      </F>
      {(['option_a', 'option_b'] as const).map((key) => (
        <div key={key} className="space-y-2 p-2 border rounded-md">
          <p className="text-xs font-semibold text-orange-600">
            {key === 'option_a' ? 'Opção A' : 'Opção B'}
          </p>
          <Input
            placeholder="Título"
            value={opt(key).title || ''}
            onChange={(e) => setOpt(key, 'title', e.target.value)}
            className="text-xs h-7"
          />
          <Input
            placeholder="URL da imagem"
            value={opt(key).image || ''}
            onChange={(e) => setOpt(key, 'image', e.target.value)}
            className="text-xs h-7"
          />
          <Textarea
            placeholder="Descrição"
            value={opt(key).description || ''}
            onChange={(e) => setOpt(key, 'description', e.target.value)}
            className="text-xs min-h-[40px]"
          />
          <Input
            placeholder="Preço"
            value={opt(key).price || ''}
            onChange={(e) => setOpt(key, 'price', e.target.value)}
            className="text-xs h-7"
          />
          <F label="Prós">
            <StrList
              items={opt(key).pros || []}
              onChange={(v) => setOpt(key, 'pros', v)}
              ph="Adicionar pró"
            />
          </F>
          <F label="Contras">
            <StrList
              items={opt(key).cons || []}
              onChange={(v) => setOpt(key, 'cons', v)}
              ph="Adicionar contra"
            />
          </F>
        </div>
      ))}
      <F label="Pontos de Comparação">
        <StrList
          items={points}
          onChange={(v) => set(data, onChange, 'comparison_points', v)}
          ph="Adicionar ponto"
        />
      </F>
      <F label="Recomendação">
        <Textarea
          value={data.recommendation || ''}
          onChange={(e) => set(data, onChange, 'recommendation', e.target.value)}
          className="min-h-[60px]"
        />
      </F>
      <F label="CTA Texto">
        <Input
          value={data.cta_label || ''}
          onChange={(e) => set(data, onChange, 'cta_label', e.target.value)}
        />
      </F>
      <F label="CTA Link">
        <Input
          value={data.cta_link || ''}
          onChange={(e) => set(data, onChange, 'cta_link', e.target.value)}
        />
      </F>
    </div>
  )
}
