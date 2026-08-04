import { useState, useEffect, useCallback } from 'react'
import {
  getCoverVersions,
  restoreCoverVersion,
  type CoverVersion,
  type CoverData,
} from '@/services/cover-versions'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { History, RotateCcw, GitCompare } from 'lucide-react'

interface CoverVersionsPanelProps {
  editionId: string
}

export function CoverVersionsPanel({ editionId }: CoverVersionsPanelProps) {
  const [versions, setVersions] = useState<CoverVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  const loadData = useCallback(async () => {
    try {
      const data = await getCoverVersions(editionId)
      setVersions(data)
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [editionId])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('cover_versions', () => loadData())

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const handleRestore = async (versionId: string) => {
    try {
      await restoreCoverVersion(versionId)
      loadData()
    } catch {
      /* intentionally ignored */
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (versions.length === 0) {
    return <p className="text-sm text-gray-500 py-4">Nenhuma versão de capa encontrada.</p>
  }

  const compareVersions = selected
    .map((id) => versions.find((v) => v.id === id))
    .filter(Boolean) as CoverVersion[]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Histórico de Versões</h3>
        <Badge variant="secondary">{versions.length}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {versions.map((v) => {
          const coverData = v.cover_variants as unknown as CoverData | null
          const isSelected = selected.includes(v.id)
          return (
            <div
              key={v.id}
              className={`rounded-lg border-2 cursor-pointer overflow-hidden transition-colors ${isSelected ? 'border-orange-500' : 'border-gray-200'}`}
              onClick={() => toggleSelect(v.id)}
            >
              <div className="aspect-[3/4] relative bg-gray-100">
                {coverData?.imageUrl ? (
                  <img
                    src={coverData.imageUrl}
                    alt={v.cover_alt_text}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Sem imagem
                  </div>
                )}
                <span className="absolute top-1 right-1 text-xs text-white bg-black/60 px-1.5 py-0.5 rounded">
                  v{v.version_number}
                </span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(v.created).toLocaleDateString('pt-BR')}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestore(v.id)
                  }}
                  className="h-7 px-2"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {compareVersions.length === 2 && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare className="w-4 h-4 text-orange-500" />
            <h4 className="font-medium">Comparação Visual</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {compareVersions.map((v) => {
              const coverData = v.cover_variants as unknown as CoverData | null
              return (
                <div key={v.id} className="space-y-2">
                  <Badge>v{v.version_number}</Badge>
                  <div className="aspect-[3/4] rounded overflow-hidden bg-gray-100">
                    {coverData?.imageUrl && (
                      <img
                        src={coverData.imageUrl}
                        alt={v.cover_alt_text}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(v.created).toLocaleString('pt-BR')}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
