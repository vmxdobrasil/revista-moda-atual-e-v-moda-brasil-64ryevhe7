import { useState } from 'react'
import {
  fetchStockImages,
  STOCK_SOURCES,
  type StockImage,
  type StockImageSource,
} from '@/services/cover-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, ImageIcon } from 'lucide-react'

interface StockImageSourceSelectorProps {
  onSelect: (imageUrl: string, altText: string) => void
  defaultQuery?: string
}

export function StockImageSourceSelector({
  onSelect,
  defaultQuery = 'fashion magazine cover',
}: StockImageSourceSelectorProps) {
  const [source, setSource] = useState<StockImageSource>('unsplash')
  const [query, setQuery] = useState(defaultQuery)
  const [images, setImages] = useState<StockImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await fetchStockImages(query.trim(), source)
      setImages(result.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar imagens')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div className="space-y-2">
          <Label>Fonte de Imagens</Label>
          <Select value={source} onValueChange={(v) => setSource(v as StockImageSource)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCK_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock-query">Buscar</Label>
          <Input
            id="stock-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite termos de busca"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelect(img.url, img.alt)}
              className="group relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-500 transition-colors"
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="absolute bottom-1 left-1 text-xs text-white bg-black/60 px-1.5 py-0.5 rounded">
                {img.sourceLabel}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
