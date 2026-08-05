import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { getAllAds, type Advertisement } from '@/services/advertisements'
import {
  getProposals,
  type AdProposal,
  AD_STATUS_LABELS,
  STATUS_BADGE_CLASSES,
} from '@/services/ad-proposals'
import { useRealtime } from '@/hooks/use-realtime'
import { ReachEvolutionSection } from './ReachEvolutionSection'
import { CrossCampaignComparison } from './CrossCampaignComparison'
import { ReportFilters, type ReportFilterState } from './ReportFilters'

export function RelatoriosTab() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [proposals, setProposals] = useState<AdProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilterState>({
    period: 'all',
    format: 'all',
    position: 'all',
  })

  const loadData = async () => {
    try {
      const [a, p] = await Promise.all([getAllAds(), getProposals()])
      setAds(a)
      setProposals(p)
    } catch {
      /* handled by empty state */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('advertisements', () => {
    loadData()
  })
  useRealtime('ad_proposals', () => {
    loadData()
  })

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (filters.format !== 'all' && p.format !== filters.format) return false
      if (
        filters.position !== 'all' &&
        !(p.position || '').toLowerCase().includes(filters.position.toLowerCase())
      )
        return false
      if (filters.period !== 'all') {
        const created = new Date(p.created)
        const now = new Date()
        if (filters.period === '7d' && now.getTime() - created.getTime() > 7 * 86400000)
          return false
        if (filters.period === '30d' && now.getTime() - created.getTime() > 30 * 86400000)
          return false
        if (
          filters.period === 'this_month' &&
          (created.getMonth() !== now.getMonth() || created.getFullYear() !== now.getFullYear())
        )
          return false
      }
      return true
    })
  }, [proposals, filters])

  const filteredAds = useMemo(() => {
    if (filters.period === 'all') return ads
    return ads.filter((a) => {
      const created = new Date(a.created)
      const now = new Date()
      if (filters.period === '7d') return now.getTime() - created.getTime() <= 7 * 86400000
      if (filters.period === '30d') return now.getTime() - created.getTime() <= 30 * 86400000
      if (filters.period === 'this_month')
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
      return true
    })
  }, [ads, filters])

  const totalRevenue = useMemo(
    () =>
      filteredAds
        .filter((a) => ['entregue', 'concluido'].includes(a.status || ''))
        .reduce((s, a) => s + (a.price || 0), 0),
    [filteredAds],
  )

  const totalProposed = useMemo(
    () => filteredProposals.reduce((s, p) => s + (p.suggested_price || 0), 0),
    [filteredProposals],
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ReportFilters value={filters} onChange={setFilters} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Receita Realizada</p>
            <p className="text-2xl font-bold text-green-600">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Receita Potencial</p>
            <p className="text-2xl font-bold text-orange-500">
              R$ {totalProposed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Campanhas</p>
            <p className="text-2xl font-bold text-blue-600">{filteredAds.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relatório por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anunciante</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entrega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAds.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.advertiser || ad.title}</TableCell>
                    <TableCell>{ad.campaign || '-'}</TableCell>
                    <TableCell>
                      {ad.price ? `R$ ${ad.price.toLocaleString('pt-BR')}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          STATUS_BADGE_CLASSES[ad.status || ''] || 'bg-gray-100 text-gray-700'
                        }
                        variant="secondary"
                      >
                        {AD_STATUS_LABELS[ad.status || ''] || ad.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ad.delivery ? new Date(ad.delivery).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                      Nenhuma campanha encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ReachEvolutionSection proposals={filteredProposals} />

      <CrossCampaignComparison proposals={filteredProposals} />
    </div>
  )
}
