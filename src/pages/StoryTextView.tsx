import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getStoryText, type StoryText } from '@/services/story-texts'
import { extractDisplayContent, extractTags, getTagColor } from '@/lib/story-text-utils'
import { VisualTemplateCard } from '@/components/VisualTemplateCard'
import { SocialShare } from '@/components/SocialShare'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Link2, Check, AlertCircle } from 'lucide-react'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { useToast } from '@/hooks/use-toast'

export default function StoryTextView() {
  const { id } = useParams<{ id: string }>()
  const [text, setText] = useState<StoryText | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!id) return
    getStoryText(id)
      .then((data) => {
        setText(data)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  const displayContent = useMemo(() => (text ? extractDisplayContent(text.options) : null), [text])
  const tags = useMemo(() => (text ? extractTags(text.options) : []), [text])

  const metaTags = useMemo(
    () =>
      text
        ? {
            title: `${text.subject} — Revista Moda Atual`,
            description: displayContent?.content.slice(0, 160) || 'Texto da Revista Moda Atual',
            url: `${window.location.origin}/texto/${text.id}`,
            type: 'article' as const,
          }
        : { title: 'Revista Moda Atual', url: window.location.href },
    [text, displayContent],
  )
  useMetaTags(metaTags)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast({ title: 'Link copiado!', description: 'Compartilhe com seus contatos.' })
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )

  if (error || !text || !displayContent)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Texto não encontrado</h1>
        <p className="text-gray-500 mb-6">O texto que você procura não está disponível.</p>
        <Button asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>
        </Button>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b py-4 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-extrabold text-sm flex items-center justify-center">
            V
          </div>
          <span className="text-orange-600 font-bold">MODA BRASIL</span>
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Dashboard
          </Link>
        </Button>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <Badge>{displayContent.typeLabel}</Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{text.subject}</h1>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
              {displayContent.content}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className={`text-xs px-2 py-1 rounded-full ${getTagColor(tag)}`}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-400">
              {new Date(text.created).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="space-y-4">
            <VisualTemplateCard storyText={text} />
            <div className="flex flex-col gap-3">
              <Button onClick={handleCopyLink} variant="outline">
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Link copiado!' : 'Copiar link de compartilhamento'}
              </Button>
              <SocialShare title={text.subject} url={window.location.href} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
