import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type SocialPost } from '@/services/social-posts'
import {
  Play,
  Eye,
  Heart,
  MessageCircle,
  Instagram,
  Share2,
  Bookmark,
  Repeat2,
  Star,
} from 'lucide-react'

interface SocialGalleryProps {
  posts: SocialPost[]
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '...' : text
}

function formatNumber(n: number) {
  return n.toLocaleString('pt-BR')
}

export function SocialGallery({ posts }: SocialGalleryProps) {
  const [selected, setSelected] = useState<SocialPost | null>(null)

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        <Instagram className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>Nenhum post social disponível.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow active:scale-95"
            onClick={() => setSelected(post)}
          >
            <div className="aspect-video bg-gray-100 relative flex items-center justify-center">
              {post.format === 'Photo' ? (
                <img
                  src="https://img.usecurling.com/p/400/300?q=instagram%20fashion%20photo"
                  alt={post.hook}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Play className="w-12 h-12 text-white" fill="white" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 bg-black/60 text-white border-none">
                {post.format}
              </Badge>
              {post.is_top_performer && (
                <Star className="absolute top-2 left-2 w-4 h-4 text-orange-400 fill-orange-400" />
              )}
            </div>
            <CardContent className="p-3">
              <p className="text-sm text-gray-700 line-clamp-2 mb-2">{truncate(post.hook, 80)}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {formatNumber(post.views)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" /> {formatNumber(post.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {formatNumber(post.comments)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="secondary">{selected.format}</Badge>
                  <span className="text-sm text-gray-500 font-normal">
                    {selected.post_date?.split(' ')[0]}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {selected.format === 'Photo' ? (
                    <img
                      src="https://img.usecurling.com/p/800/600?q=instagram%20fashion%20photo"
                      alt={selected.hook}
                      className="w-full h-full object-cover"
                    />
                  ) : selected.format === 'Carousel' ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col items-center justify-center gap-4">
                      <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                      <p className="text-white/80 text-sm">Carousel &bull; Deslize para ver mais</p>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                      <Button asChild className="bg-white text-purple-600 hover:bg-white/90">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                          <Instagram className="w-4 h-4 mr-2" /> Ver no Instagram
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{selected.hook}</h3>
                  {selected.description && (
                    <p className="text-sm text-gray-600">{selected.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {formatNumber(selected.views)}
                    </span>
                    <span className="text-[10px] text-gray-400">Views</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {formatNumber(selected.likes)}
                    </span>
                    <span className="text-[10px] text-gray-400">Likes</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {formatNumber(selected.comments)}
                    </span>
                    <span className="text-[10px] text-gray-400">Coment.</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                    <Share2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {formatNumber(selected.shares)}
                    </span>
                    <span className="text-[10px] text-gray-400">Shares</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                    <Bookmark className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {formatNumber(selected.saves)}
                    </span>
                    <span className="text-[10px] text-gray-400">Saves</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                    <Repeat2 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {formatNumber(selected.remixes || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400">Remixes</span>
                  </div>
                </div>

                {selected.is_top_performer && (
                  <Badge className="bg-orange-500 text-white border-none gap-1">
                    <Star className="w-3 h-3 fill-white" /> Top Performer
                  </Badge>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
