import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingDown } from 'lucide-react'
import type { SocialPost } from '@/services/social-posts'

interface TopBottomCardsProps {
  top3: SocialPost[]
  bottom3: SocialPost[]
  totalPosts: number
}

export function TopBottomCards({ top3, bottom3, totalPosts }: TopBottomCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Trophy className="w-5 h-5" /> Top 3 Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {top3.map((post, i) => (
            <div
              key={post.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">{post.hook}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  <span>{post.views.toLocaleString('pt-BR')} views</span>
                  <span>{((post.engagement_rate || 0) * 100).toFixed(1)}% eng.</span>
                  <span>{post.format}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <TrendingDown className="w-5 h-5" /> Bottom 3 Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bottom3.map((post, i) => (
            <div
              key={post.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-400 text-white font-bold text-sm shrink-0">
                {totalPosts - i}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">{post.hook}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  <span>{post.views.toLocaleString('pt-BR')} views</span>
                  <span>{((post.engagement_rate || 0) * 100).toFixed(1)}% eng.</span>
                  <span>{post.format}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
