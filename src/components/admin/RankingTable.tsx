import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SocialPost } from '@/services/social-posts'

interface RankingTableProps {
  posts: SocialPost[]
  rankMetric: 'engagement_rate' | 'views'
  onRankMetricChange: (v: 'engagement_rate' | 'views') => void
}

function getRankBadge(index: number, total: number) {
  if (index < 3) return <Badge className="bg-orange-500 text-white">Top 3</Badge>
  if (index >= total - 3) return <Badge variant="destructive">Bottom 3</Badge>
  return null
}

export function RankingTable({ posts, rankMetric, onRankMetricChange }: RankingTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <h3 className="text-lg font-semibold text-gray-800">Performance Ranking</h3>
        <ToggleGroup
          type="single"
          value={rankMetric}
          onValueChange={(v) => v && onRankMetricChange(v as 'engagement_rate' | 'views')}
        >
          <ToggleGroupItem value="engagement_rate">Por Engajamento</ToggleGroupItem>
          <ToggleGroupItem value="views">Por Views</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Hook</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Eng. Rate</TableHead>
                <TableHead className="text-center">Like Rate</TableHead>
                <TableHead className="text-center">Comment Rate</TableHead>
                <TableHead className="text-center">Share Rate</TableHead>
                <TableHead className="text-center">Save Rate</TableHead>
                <TableHead className="text-center">Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post, i) => (
                <TableRow key={post.id}>
                  <TableCell className="font-bold text-gray-700">{i + 1}</TableCell>
                  <TableCell className="font-medium text-gray-900 max-w-[200px] truncate">
                    {post.hook}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {post.views.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {post.likes.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right font-medium text-orange-600">
                    {((post.engagement_rate || 0) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center text-gray-500">
                    {post.views ? ((post.likes / post.views) * 100).toFixed(1) : '0'}%
                  </TableCell>
                  <TableCell className="text-center text-gray-500">
                    {post.views ? ((post.comments / post.views) * 100).toFixed(1) : '0'}%
                  </TableCell>
                  <TableCell className="text-center text-gray-500">
                    {post.views ? ((post.shares / post.views) * 100).toFixed(1) : '0'}%
                  </TableCell>
                  <TableCell className="text-center text-gray-500">
                    {post.views ? ((post.saves / post.views) * 100).toFixed(1) : '0'}%
                  </TableCell>
                  <TableCell className="text-center">{getRankBadge(i, posts.length)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
