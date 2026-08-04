import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEdition, type Edition } from '@/services/magazine'
import { getCoverDeliveryByEdition, type CoverDeliveryItem } from '@/services/cover-actions'
import type { CoverData } from '@/services/cover-versions'
import { CoverVersionsPanel } from '@/components/cover/CoverVersionsPanel'
import { CoverExportButtons } from '@/components/cover/CoverExportButtons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-500' },
  em_revisao: { label: 'Em Revisão', color: 'bg-blue-500' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500' },
  publicado: { label: 'Publicado', color: 'bg-purple-500' },
}

export default function EditionCoversPage() {
  const { id } = useParams<{ id: string }>()
  const [edition, setEdition] = useState<Edition | null>(null)
  const [delivery, setDelivery] = useState<CoverDeliveryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      getEdition(id).catch(() => null),
      getCoverDeliveryByEdition(id).catch(() => null),
    ]).then(([ed, del]) => {
      setEdition(ed)
      setDelivery(del)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!edition) {
    return <p className="text-gray-500">Edição não encontrada.</p>
  }

  const coverData: CoverData | null = edition.cover_url
    ? {
        imageUrl: edition.cover_url,
        title: edition.title,
        subtitle: '',
        altText: edition.cover_alt_text || edition.title,
        stockSource: 'unsplash',
        theme: edition.title,
      }
    : null

  const status = delivery?.status || 'rascunho'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/editions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Capas: {edition.title}</h2>
          <p className="text-sm text-gray-500">Gerenciar versões e exportação de capas</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Capa Atual
          </h3>
          {delivery && (
            <Badge className={STATUS_CONFIG[status]?.color}>{STATUS_CONFIG[status]?.label}</Badge>
          )}
        </div>

        {coverData ? (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 max-w-2xl">
            <img
              src={coverData.imageUrl}
              alt={coverData.altText}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma capa definida para esta edição.</p>
        )}

        {coverData && id && <CoverExportButtons coverData={coverData} editionId={id} />}
      </div>

      {id && <CoverVersionsPanel editionId={id} />}
    </div>
  )
}
