import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getMultiFormatResult,
  runMultiFormatGenerator,
  type MultiFormatResult,
} from '@/services/multi-format'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Copy, Loader2, AlertCircle, RefreshCw, Layers } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  processing: { label: 'Processando', color: 'bg-blue-500' },
  completed: { label: 'Concluído', color: 'bg-green-500' },
  failed: { label: 'Falhou', color: 'bg-red-500' },
}

function ContentSection({
  title,
  content,
  onCopy,
}: {
  title: string
  content: string
  onCopy: () => void
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button size="sm" variant="ghost" onClick={onCopy} className="gap-1">
          <Copy className="w-4 h-4" /> Copiar
        </Button>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  )
}

export default function MultiFormatReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [item, setItem] = useState<MultiFormatResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      setItem(await getMultiFormatResult(id))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('workflow_results', (e) => {
    if (e.record.id === id) loadData()
  })

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copiado!', description: `${label} copiado.` })
  }

  const copyAll = () => {
    if (!item?.final_content) return
    const fc = item.final_content
    const parts: string[] = []
    if (fc.seo_title?.length) parts.push(`=== TÍTULOS SEO ===\n${fc.seo_title.join('\n')}`)
    if (fc.article_content?.corpo)
      parts.push(`=== MATÉRIA COMPLETA ===\n${fc.article_content.corpo}`)
    if (fc.instagram_caption) parts.push(`=== LEGENDA INSTAGRAM ===\n${fc.instagram_caption}`)
    if (fc.reel_script?.raw) parts.push(`=== ROTEIRO REELS ===\n${fc.reel_script.raw}`)
    if (fc.youtube_description) parts.push(`=== DESCRIÇÃO YOUTUBE ===\n${fc.youtube_description}`)
    if (fc.trend_analysis?.raw) parts.push(`=== ANÁLISE DE TENDÊNCIA ===\n${fc.trend_analysis.raw}`)
    copyText(parts.join('\n\n'), 'Pacote completo')
  }

  const handleRegenerate = async () => {
    if (!item?.theme) return
    setRegenerating(true)
    try {
      const res = await runMultiFormatGenerator(item.theme)
      toast({ title: 'Sucesso', description: 'Nova geração iniciada!' })
      navigate(`/admin/multi-format-generator/${res.id}`)
    } catch (err: any) {
      const errId = err?.response?.id
      if (errId) {
        navigate(`/admin/multi-format-generator/${errId}`)
      } else {
        toast({
          title: 'Erro',
          description: err?.message || 'Falha ao regenerar.',
          variant: 'destructive',
        })
        setRegenerating(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!item) return <p className="text-center text-gray-400 py-10">Registro não encontrado.</p>

  const status = item.status
  const fc = item.final_content || {}

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="text-gray-600">Gerando conteúdo multi-formato...</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/multi-format-generator')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-600 font-medium">Falha na geração</p>
          <p className="text-gray-500 text-sm">{item.error_note || 'Erro desconhecido'}</p>
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {regenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/multi-format-generator')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{item.theme}</h2>
          <Badge className={STATUS_LABELS[status]?.color}>{STATUS_LABELS[status]?.label}</Badge>
        </div>
        <Button onClick={copyAll} variant="outline" className="gap-2">
          <Layers className="w-4 h-4" /> Copiar Tudo
        </Button>
        <Button
          onClick={handleRegenerate}
          disabled={regenerating}
          variant="outline"
          className="gap-2"
        >
          {regenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Gerar Novamente
        </Button>
      </div>

      {fc.seo_title?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-orange-700 mb-1">Título SEO</p>
          <p className="text-lg font-bold text-gray-800">{fc.seo_title[0]}</p>
          {fc.seo_title.length > 1 && (
            <p className="text-sm text-gray-500 mt-1">
              Alternativas: {fc.seo_title.slice(1).join(' | ')}
            </p>
          )}
        </div>
      )}

      <ContentSection
        title="Matéria Completa (Site)"
        content={fc.article_content?.corpo || fc.article_content?.raw || ''}
        onCopy={() =>
          copyText(fc.article_content?.corpo || fc.article_content?.raw || '', 'Matéria')
        }
      />
      <ContentSection
        title="Legenda Instagram Feed"
        content={fc.instagram_caption || ''}
        onCopy={() => copyText(fc.instagram_caption || '', 'Legenda')}
      />
      <ContentSection
        title="Roteiro Reels"
        content={fc.reel_script?.raw || ''}
        onCopy={() => copyText(fc.reel_script?.raw || '', 'Roteiro')}
      />
      <ContentSection
        title="Descrição YouTube"
        content={fc.youtube_description || ''}
        onCopy={() => copyText(fc.youtube_description || '', 'Descrição')}
      />
      {fc.trend_analysis?.raw && (
        <ContentSection
          title="Análise de Tendência"
          content={fc.trend_analysis.raw}
          onCopy={() => copyText(fc.trend_analysis.raw, 'Análise')}
        />
      )}
    </div>
  )
}
