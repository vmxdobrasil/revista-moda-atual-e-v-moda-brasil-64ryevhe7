import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { getAllSocialPosts, type SocialPost } from '@/services/social-posts'
import { formatCurrency, type AdProposal } from '@/services/ad-revenue'
import type { Edition } from '@/services/magazine'

interface Props {
  proposals: AdProposal[]
  editions: Edition[]
}

export function RelatoriosTab({ proposals, editions }: Props) {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllSocialPosts()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const reports = useMemo(() => {
    return proposals.map((p) => {
      const ed = editions.find((e) => e.id === p.edition)
      const editionViews = ed?.view_count || 0
      const edPosts = posts.filter((sp) => sp.edition === p.edition)
      const totalSocialViews = edPosts.reduce((s, sp) => s + (sp.views || 0), 0)
      const totalEngagement = edPosts.reduce(
        (s, sp) => s + (sp.likes || 0) + (sp.comments || 0) + (sp.shares || 0) + (sp.saves || 0),
        0,
      )
      const totalReach = (p.audience_reach || 0) + editionViews + totalSocialViews
      const cpm = totalReach > 0 ? (p.suggested_price / totalReach) * 1000 : 0
      return {
        proposal: p,
        editionTitle: ed?.title || '—',
        editionViews,
        totalSocialViews,
        totalEngagement,
        totalReach,
        cpm,
      }
    })
  }, [proposals, editions, posts])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {reports.map((r) => (
          <Card key={r.proposal.id} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{r.proposal.advertiser}</p>
                  <p className="text-xs text-gray-400">
                    {r.proposal.campaign || '—'} · {r.editionTitle}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {r.proposal.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Reach Total</p>
                  <p className="font-semibold text-gray-700">
                    {r.totalReach.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Views Edição</p>
                  <p className="font-semibold text-gray-700">
                    {r.editionViews.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Views Social</p>
                  <p className="font-semibold text-gray-700">
                    {r.totalSocialViews.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Engajamento</p>
                  <p className="font-semibold text-gray-700">
                    {r.totalEngagement.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">CPM</p>
                  <p className="font-semibold text-gray-700">{formatCurrency(r.cpm)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Preço: {formatCurrency(r.proposal.suggested_price)} · Match:{' '}
                  {r.proposal.match_score}/100
                </span>
                <span className="text-xs text-gray-400">
                  Entrega:{' '}
                  {r.proposal.delivery_date
                    ? new Date(r.proposal.delivery_date).toLocaleDateString('pt-BR')
                    : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {reports.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhuma proposta para relatório.</p>
        )}
      </div>
    </div>
  )
}
