import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import type { AdProposal } from '@/services/ad-proposals'
import type { SocialPost } from '@/services/social-posts'

interface ReachEvolutionSectionProps {
  proposals: AdProposal[]
}

export function ReachEvolutionSection({ proposals }: ReachEvolutionSectionProps) {
  const [selectedId, setSelectedId] = useState('')
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) {
      setPosts([])
      return
    }
    const proposal = proposals.find((p) => p.id === selectedId)
    if (!proposal?.edition) {
      setPosts([])
      return
    }
    setLoading(true)
    pb.collection('social_posts')
      .getFullList({
        filter: `edition = "${proposal.edition}"`,
        sort: 'post_date',
      })
      .then((data) => {
        setPosts(data as unknown as SocialPost[])
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [selectedId, proposals])

  const chartData = useMemo(
    () =>
      posts.map((p) => ({
        date: p.post_date?.split(' ')[0] || '',
        views: p.views || 0,
      })),
    [posts],
  )

  const summary = useMemo(() => {
    if (!posts.length) return null
    return {
      views: posts.reduce((s, p) => s + (p.views || 0), 0),
      likes: posts.reduce((s, p) => s + (p.likes || 0), 0),
      comments: posts.reduce((s, p) => s + (p.comments || 0), 0),
      shares: posts.reduce((s, p) => s + (p.shares || 0), 0),
      saves: posts.reduce((s, p) => s + (p.saves || 0), 0),
      remixes: posts.reduce((s, p) => s + (p.remixes || 0), 0),
      avgER: posts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / posts.length,
    }
  }, [posts])

  const config: ChartConfig = { views: { label: 'Views', color: 'hsl(24, 95%, 53%)' } }
  const metrics = summary
    ? [
        { label: 'Views', value: summary.views.toLocaleString('pt-BR') },
        { label: 'Likes', value: summary.likes.toLocaleString('pt-BR') },
        { label: 'Comentários', value: summary.comments.toLocaleString('pt-BR') },
        { label: 'Shares', value: summary.shares.toLocaleString('pt-BR') },
        { label: 'Saves', value: summary.saves.toLocaleString('pt-BR') },
        { label: 'Remixes', value: summary.remixes.toLocaleString('pt-BR') },
        { label: 'Taxa Engajamento', value: `${summary.avgER.toFixed(2)}%` },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução de Alcance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecionar proposta/campanha" />
          </SelectTrigger>
          <SelectContent>
            {proposals.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.advertiser} — {p.campaign || 'Sem campanha'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        )}
        {!loading && selectedId && !posts.length && (
          <p className="text-center text-gray-400 py-8">
            Nenhum post social encontrado para esta edição.
          </p>
        )}
        {!loading && posts.length > 0 && (
          <>
            <ChartContainer config={config} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(24, 95%, 53%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(24, 95%, 53%)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metrics.map((m) => (
                <Card key={m.label}>
                  <CardContent className="p-3">
                    <p className="text-xs text-gray-500">{m.label}</p>
                    <p className="text-lg font-bold text-gray-900">{m.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
