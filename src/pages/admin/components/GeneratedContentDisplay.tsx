import type { GeneratedContent } from '@/services/content-generator'
import { ContentSectionCard } from './ContentSectionCard'
import { Badge } from '@/components/ui/badge'
import { FileText, Instagram, Video, Camera, Hash, Megaphone } from 'lucide-react'

export function GeneratedContentDisplay({ content }: { content: GeneratedContent }) {
  const articleCopy = content.materia_completa
  const postCopy = `${content.post_feed.titulo}\n\n${content.post_feed.legenda}`
  const reelCopy = content.roteiro_reel.cenas
    .map(
      (c) =>
        `${c.numero}. [${c.tempo}] ${c.descricao}\nOverlay: ${c.texto_overlay}\nAudio: ${c.audio}`,
    )
    .join('\n\n')
  const storiesCopy = content.stories
    .map((s) => `Story ${s.numero}: ${s.texto}\nDesign: ${s.design}\nCTA: ${s.cta}`)
    .join('\n\n')
  const hashtagsCopy = [...content.hashtags.principais, ...content.hashtags.alcance].join(' ')

  const renderArticle = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('## '))
        return (
          <h4 key={i} className="font-bold text-gray-900 mt-4 mb-2">
            {line.slice(3)}
          </h4>
        )
      if (line.startsWith('# '))
        return (
          <h3 key={i} className="font-bold text-gray-900 text-lg mt-4 mb-2">
            {line.slice(2)}
          </h3>
        )
      if (line.trim() === '') return null
      return (
        <p key={i} className="text-gray-600 leading-relaxed mb-3">
          {line}
        </p>
      )
    })

  return (
    <div className="space-y-4">
      <ContentSectionCard
        title="Materia Completa"
        icon={<FileText className="w-5 h-5 text-orange-500" />}
        copyText={articleCopy}
      >
        <div className="max-h-96 overflow-y-auto pr-2">
          {renderArticle(content.materia_completa)}
        </div>
      </ContentSectionCard>

      <ContentSectionCard
        title="Post para Feed"
        icon={<Instagram className="w-5 h-5 text-orange-500" />}
        copyText={postCopy}
      >
        <p className="font-semibold text-gray-900 mb-2">{content.post_feed.titulo}</p>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
          {content.post_feed.legenda}
        </p>
      </ContentSectionCard>

      <ContentSectionCard
        title="Roteiro Reel"
        icon={<Video className="w-5 h-5 text-orange-500" />}
        copyText={reelCopy}
      >
        <p className="text-xs text-gray-500 mb-3">Duracao: {content.roteiro_reel.duracao}</p>
        <ol className="space-y-3">
          {content.roteiro_reel.cenas.map((cena) => (
            <li key={cena.numero} className="border-l-2 border-orange-200 pl-3">
              <p className="font-medium text-gray-900">
                Cena {cena.numero}{' '}
                <span className="text-gray-400 font-normal text-sm">({cena.tempo})</span>
              </p>
              <p className="text-gray-600 text-sm mt-1">{cena.descricao}</p>
              <p className="text-gray-500 text-xs mt-1">
                <span className="font-medium">Overlay:</span> {cena.texto_overlay}
              </p>
              <p className="text-gray-500 text-xs">
                <span className="font-medium">Audio:</span> {cena.audio}
              </p>
            </li>
          ))}
        </ol>
      </ContentSectionCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {content.stories.map((story) => (
          <ContentSectionCard
            key={story.numero}
            title={`Story ${story.numero}`}
            icon={<Camera className="w-5 h-5 text-orange-500" />}
            copyText={`Story ${story.numero}: ${story.texto}\nDesign: ${story.design}\nCTA: ${story.cta}`}
          >
            <p className="text-gray-600 text-sm">{story.texto}</p>
            <p className="text-gray-500 text-xs mt-2">
              <span className="font-medium">Design:</span> {story.design}
            </p>
            <p className="text-gray-500 text-xs">
              <span className="font-medium">CTA:</span> {story.cta}
            </p>
          </ContentSectionCard>
        ))}
      </div>

      <ContentSectionCard
        title="Hashtags"
        icon={<Hash className="w-5 h-5 text-orange-500" />}
        copyText={hashtagsCopy}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {content.hashtags.principais.map((tag, i) => (
              <Badge
                key={i}
                className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {content.hashtags.alcance.map((tag, i) => (
              <Badge key={i} variant="outline" className="cursor-pointer">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </ContentSectionCard>

      <ContentSectionCard
        title="Call to Action"
        icon={<Megaphone className="w-5 h-5 text-orange-500" />}
        copyText={content.cta}
      >
        <p className="text-gray-600">{content.cta}</p>
      </ContentSectionCard>
    </div>
  )
}
