import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMultiFormatResults,
  runMultiFormatGenerator,
  type MultiFormatResult,
} from '@/services/multi-format'
import { getAllProducts, type MarketplaceProduct } from '@/services/marketplace'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Layers, Loader2, Eye } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  processing: { label: 'Processando', color: 'bg-blue-500' },
  completed: { label: 'Concluído', color: 'bg-green-500' },
  failed: { label: 'Falhou', color: 'bg-red-500' },
}

export default function MultiFormatGeneratorPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [results, setResults] = useState<MultiFormatResult[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [theme, setTheme] = useState('')
  const [productId, setProductId] = useState('')
  const [products, setProducts] = useState<MarketplaceProduct[]>([])

  const loadData = useCallback(async () => {
    try {
      const data = await getMultiFormatResults()
      setResults(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(() => {})
    loadData()
  }, [loadData])

  useRealtime('workflow_results', () => loadData())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!theme.trim()) return
    setGenerating(true)
    try {
      const res = await runMultiFormatGenerator(theme.trim(), productId || undefined)
      toast({ title: 'Sucesso', description: 'Conteúdo gerado!' })
      navigate(`/admin/multi-format-generator/${res.id}`)
    } catch (err: any) {
      const errId = err?.response?.id
      if (errId) {
        navigate(`/admin/multi-format-generator/${errId}`)
      } else {
        toast({
          title: 'Erro',
          description: err?.message || 'Falha ao gerar conteúdo.',
          variant: 'destructive',
        })
        setGenerating(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <Layers className="text-orange-500" /> Gerador Multi-Formato
        </h2>
        <p className="text-gray-500 mt-1">
          Gere artigo, legenda, roteiro Reels e descrição YouTube em um único fluxo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mf-theme">Tema da Tendência</Label>
          <Input
            id="mf-theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Digite o tema da tendência"
            required
            disabled={generating}
          />
        </div>
        <div className="space-y-2">
          <Label>Produto (opcional)</Label>
          <Select value={productId} onValueChange={setProductId} disabled={generating}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um produto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="submit"
          disabled={generating || !theme.trim()}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Gerando... Isso pode levar alguns
              minutos.
            </>
          ) : (
            'Gerar Multi-Formato'
          )}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tema</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-xs truncate">{r.theme}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_LABELS[r.status]?.color || 'bg-gray-500'}>
                      {STATUS_LABELS[r.status]?.label || r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(r.created).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/admin/multi-format-generator/${r.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
