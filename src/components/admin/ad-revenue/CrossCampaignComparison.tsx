import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChartContainer } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts'
import { Loader2 } from 'lucide-react'
import { type AdProposal, FORMAT_LABELS, getSocialPostsByEdition } from '@/services/ad-proposals'

interface Props {
  proposals: AdProposal[]
}

interface CampaignMetrics {
  name: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagement: number
}

export function CrossCampaignComparison({ proposals }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [metrics, setMetrics] = useState<Record<string, CampaignMetrics>>({})
  const [loading, setLoading] = useState(false)

  const proposalsWithEdition = useMemo(() => proposals.filter((p) => p.edition), [proposals])

  useEffect(() => {
    if (selected.size === 0) {
      setMetrics({})
      return
    }
    setLoading(true)
    const fetchMetrics = async () => {
      const results: Record<string, CampaignMetrics> = {}
      for (const p of proposalsWithEdition) {
        if (!selected.has(p.id)) continue
        try {
          const posts = await getSocialPostsByEdition(p.edition!)
          const m: CampaignMetrics = {
            name: p.advertiser.slice(0, 12),
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            engagement: 0,
          }
          posts.forEach((post: any) => {
            m.views += post.views || 0
            m.likes += post.likes || 0
            m.comments += post.comments || 0
            m.shares += post.shares || 0
            m.saves += post.saves || 0
          })
          m.engagement = m.likes + m.comments + m.shares + m.saves
          results[p.id] = m
        } catch {
          results[p.id] = {
            name: p.advertiser.slice(0, 12),
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            engagement: 0,
          }
        }
      }
      setMetrics(results)
      setLoading(false)
    }
    fetchMetrics()
  }, [selected, proposalsWithEdition])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const reachData = useMemo(
    () =>
      proposalsWithEdition
        .filter((p) => selected.has(p.id) && metrics[p.id])
        .map((p) => ({
          name: metrics[p.id].name,
          views: metrics[p.id].views,
          engagement: metrics[p.id].engagement,
        })),
    [selected, metrics, proposalsWithEdition],
  )

  const engagementData = useMemo(
    () =>
      proposalsWithEdition
        .filter((p) => selected.has(p.id) && metrics[p.id])
        .map((p) => ({
          name: metrics[p.id].name,
          likes: metrics[p.id].likes,
          comments: metrics[p.id].comments,
          shares: metrics[p.id].shares,
          saves: metrics[p.id].saves,
        })),
    [selected, metrics, proposalsWithEdition],
  )

  const chartConfig = {
    views: { label: 'Views', color: 'hsl(24, 95%, 53%)' },
    engagement: { label: 'Engajamento', color: 'hsl(142, 71%, 45%)' },
    likes: { label: 'Likes', color: 'hsl(0, 84%, 60%)' },
    comments: { label: 'Comentários', color: 'hsl(217, 91%, 60%)' },
    shares: { label: 'Shares', color: 'hsl(262, 83%, 58%)' },
    saves: { label: 'Saves', color: 'hsl(38, 92%, 50%)' },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comparativo de Campanhas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {proposalsWithEdition.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <Checkbox
                id={`cmp-${p.id}`}
                checked={selected.has(p.id)}
                onCheckedChange={() => toggleSelect(p.id)}
              />
              <Label htmlFor={`cmp-${p.id}`} className="text-sm cursor-pointer">
                {p.advertiser}
                {p.campaign ? ` (${p.campaign})` : ''}
              </Label>
            </div>
          ))}
          {proposalsWithEdition.length === 0 && (
            <p className="text-sm text-gray-400">
              Nenhuma campanha com edição vinculada encontrada.
            </p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          </div>
        )}

        {!loading && selected.size >= 2 && reachData.length > 0 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Alcance vs Engajamento</h4>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={reachData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="hsl(24, 95%, 53%)" radius={4} />
                  <Bar dataKey="engagement" fill="hsl(142, 71%, 45%)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Métricas de Engajamento</h4>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="hsl(0, 84%, 60%)" radius={4} />
                  <Bar dataKey="comments" fill="hsl(217, 91%, 60%)" radius={4} />
                  <Bar dataKey="shares" fill="hsl(262, 83%, 58%)" radius={4} />
                  <Bar dataKey="saves" fill="hsl(38, 92%, 50%)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        )}

        {!loading && selected.size > 0 && selected.size < 2 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Selecione 2 ou mais campanhas para comparar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
