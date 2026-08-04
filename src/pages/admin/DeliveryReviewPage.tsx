import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getDeliveryItem,
  getArticleFields,
  updateCaption,
  approveDelivery,
  rejectDelivery,
  setQaApproved,
  STATUS_CONFIG,
  type DeliveryQueueItem,
  type DeliveryStatus,
} from '@/services/delivery-queue'
import { reviewContent, type QaParecer } from '@/services/editorial-qa'
import { QaParecerDisplay } from '@/components/QaParecerDisplay'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Check,
  X,
  Save,
  Copy,
  Download,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

export default function DeliveryReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [item, setItem] = useState<DeliveryQueueItem | null>(null)
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qaResult, setQaResult] = useState<QaParecer | null>(null)
  const [qaLoading, setQaLoading] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const data = await getDeliveryItem(id)
      setItem(data)
      setCaption(data.caption || '')
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await updateCaption(id, caption)
      toast({ title: 'Salvo', description: 'Legenda atualizada.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (action: 'approve' | 'reject') => {
    if (!id) return
    try {
      if (action === 'approve') await approveDelivery(id)
      else await rejectDelivery(id)
      toast({ title: 'Sucesso', description: action === 'approve' ? 'Aprovado.' : 'Rejeitado.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha na operação.', variant: 'destructive' })
    }
  }

  const handleQaReview = async () => {
    if (!item) return
    setQaLoading(true)
    setQaResult(null)
    try {
      const article = getArticleFields(item.article_content)
      const content = article?.body || item.caption || item.theme
      const parecer = await reviewContent(content, article ? 'article' : 'caption')
      setQaResult(parecer)
      if (parecer.classification === 'aprovado') {
        await setQaApproved(item.id, true)
        toast({ title: 'QA Aprovado', description: 'Conteúdo liberado para download.' })
        loadData()
      } else {
        toast({
          title: 'QA: ' + parecer.classification,
          description: 'Revise as sugestões antes de publicar.',
          variant: parecer.classification === 'reprovado' ? 'destructive' : 'default',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro QA',
        description: err?.message || 'Falha ao revisar conteúdo.',
        variant: 'destructive',
      })
    } finally {
      setQaLoading(false)
    }
  }

  const handleExport = (copy: boolean) => {
    const article = item ? getArticleFields(item.article_content) : null
    const text = `ARTIGO:\n${article?.body || ''}\n\n---\n\nLEGENDA:\n${caption}\n\n---\n\nBIO:\n${item?.bio_text || ''}`
    if (copy) {
      navigator.clipboard.writeText(text)
      toast({ title: 'Copiado!', description: 'Conteúdo copiado para a área de transferência.' })
    } else {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `entrega_${id}.txt`
      a.click()
      URL.revokeObjectURL(url)
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

  if (!item) {
    return <p className="text-center text-gray-400 py-10">Entrega não encontrada.</p>
  }

  const article = getArticleFields(item.article_content)
  const status = item.status as DeliveryStatus
  const product = item.expand?.product
  const canExport = (status === 'aprovado' || status === 'publicado') && item.qa_approved

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/delivery-queue')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{item.theme}</h2>
          <div className="flex items-center gap-2">
            <Badge className={STATUS_CONFIG[status]?.color}>{STATUS_CONFIG[status]?.label}</Badge>
            {item.qa_approved ? (
              <Badge className="bg-green-500">QA Aprovado</Badge>
            ) : (
              <Badge variant="outline">QA Pendente</Badge>
            )}
          </div>
        </div>
      </div>

      {item.error_note && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{item.error_note}</p>
        </div>
      )}

      {qaResult && <QaParecerDisplay parecer={qaResult} />}

      {article && (
        <Card>
          <CardHeader>
            <CardTitle>Artigo Gerado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="text-xl font-bold">{article.title}</h3>
            {article.subtitle && <p className="text-gray-600 font-medium">{article.subtitle}</p>}
            {article.lead && <p className="text-sm text-gray-500 italic">{article.lead}</p>}
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{article.body}</p>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {article.tags.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Legenda (Editável)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={8}
            disabled={status === 'publicado'}
            className="resize-y"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Bio Text</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{item.bio_text || '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">{product?.name || '—'}</p>
            {product?.link && (
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-500 hover:underline flex items-center gap-1"
              >
                Ver produto <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {status !== 'publicado' && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        )}
        {(status === 'rascunho' || status === 'em_revisao') && (
          <Button
            onClick={() => handleStatus('approve')}
            className="bg-green-500 hover:bg-green-600 gap-2"
          >
            <Check className="w-4 h-4" /> Aprovar
          </Button>
        )}
        {(status === 'em_revisao' || status === 'aprovado') && (
          <Button onClick={() => handleStatus('reject')} variant="outline" className="gap-2">
            <X className="w-4 h-4" /> Rejeitar
          </Button>
        )}
        <Button onClick={handleQaReview} disabled={qaLoading} variant="outline" className="gap-2">
          {qaLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          Revisar QA
        </Button>
        {canExport ? (
          <>
            <Button onClick={() => handleExport(true)} variant="outline" className="gap-2">
              <Copy className="w-4 h-4" /> Copiar Tudo
            </Button>
            <Button onClick={() => handleExport(false)} variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Baixar
            </Button>
          </>
        ) : (
          status !== 'rascunho' &&
          !item.qa_approved && (
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> QA aprovado necessário para download
            </span>
          )
        )}
      </div>
    </div>
  )
}
