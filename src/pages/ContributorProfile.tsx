import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Contributor,
  ContributorArticle,
  getContributorBySlug,
  getContributorPhotoUrl,
  getContributorArticles,
} from '@/services/contributors'
import { BrandLogo } from '@/components/BrandLogo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Instagram,
  Twitter,
  Linkedin,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Calendar,
  ExternalLink,
  Share2,
  Check,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function ContributorProfile() {
  const { slug } = useParams<{ slug: string }>()
  const [contributor, setContributor] = useState<Contributor | null>(null)
  const [articles, setArticles] = useState<ContributorArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!slug) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const item = await getContributorBySlug(slug)
        setContributor(item)
        if (item) {
          const arts = await getContributorArticles(item, 6)
          setArticles(arts)
        }
      } catch (err) {
        console.error('Erro ao carregar perfil de colaborador:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: 'Link copiado!',
        description: 'O link do perfil foi copiado para a área de transferência.',
      })
      setTimeout(() => setCopied(false), 2500)
    }
  }

  // Loading skeleton state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-32 bg-slate-900" />
            <Skeleton className="h-9 w-24 bg-slate-900" />
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-4 flex justify-center">
                <Skeleton className="h-56 w-56 rounded-2xl bg-slate-800" />
              </div>
              <div className="md:col-span-8 space-y-4">
                <Skeleton className="h-6 w-32 bg-slate-800" />
                <Skeleton className="h-10 w-3/4 bg-slate-800" />
                <Skeleton className="h-5 w-1/2 bg-slate-800" />
                <Skeleton className="h-20 w-full bg-slate-800" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-8 w-48 bg-slate-900" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl bg-slate-900" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 404 Not Found state
  if (!contributor) {
    return (
      <div className="min-h-[70vh] bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 py-12">
          <div className="inline-flex p-4 rounded-full bg-orange-500/10 text-primary mb-2">
            <Sparkles className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Colaborador não encontrado</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            O perfil que você está procurando não existe ou pode ter sido alterado. Conheça nossa
            equipe editorial completa.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/contributors">
              <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Ver Todos os Colaboradores
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto border-slate-800">
                Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const photoUrl = getContributorPhotoUrl(contributor, 600)
  const initials = contributor.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const hasSocials =
    contributor.social_instagram || contributor.social_twitter || contributor.social_linkedin

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary selection:text-white pb-20">
      {/* Top Banner & Breadcrumb */}
      <div className="border-b border-slate-900 bg-slate-950/80 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <Link
            to="/contributors"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Colaboradores</span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-900 gap-1.5 text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copiado!' : 'Compartilhar'}
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 p-6 sm:p-8 md:p-12 shadow-2xl shadow-black/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
            {/* Left: Large Photo */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col items-center text-center">
              <div className="relative group">
                <Avatar className="h-56 w-56 sm:h-64 sm:w-64 rounded-3xl ring-4 ring-primary/30 shadow-2xl shadow-primary/10 overflow-hidden">
                  <AvatarImage
                    src={photoUrl}
                    alt={contributor.name}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <AvatarFallback className="bg-slate-900 text-primary font-bold text-4xl rounded-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {contributor.featured && (
                  <Badge className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground font-semibold px-3 py-1 text-xs shadow-md border-0 uppercase tracking-wider">
                    Destaque
                  </Badge>
                )}
              </div>
            </div>

            {/* Right: Info & Bio */}
            <div className="md:col-span-7 lg:col-span-8 space-y-5 text-left">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    Equipe Editorial
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">Revista Moda Atual</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-serif">
                  {contributor.name}
                </h1>
                {contributor.role && (
                  <p className="text-base sm:text-lg font-semibold text-orange-400/90 mt-1.5">
                    {contributor.role}
                  </p>
                )}
              </div>

              {contributor.bio && (
                <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed border-l-2 border-primary/40 pl-4 py-1">
                  <p>{contributor.bio}</p>
                </div>
              )}

              {/* Social Links */}
              {hasSocials && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {contributor.social_instagram && (
                    <a
                      href={
                        contributor.social_instagram.startsWith('http')
                          ? contributor.social_instagram
                          : `https://instagram.com/${contributor.social_instagram.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-primary/20 border border-slate-800 hover:border-primary/50 text-slate-300 hover:text-white transition-all text-xs font-medium"
                    >
                      <Instagram className="h-4 w-4 text-pink-400" />
                      <span>Instagram</span>
                    </a>
                  )}

                  {contributor.social_linkedin && (
                    <a
                      href={
                        contributor.social_linkedin.startsWith('http')
                          ? contributor.social_linkedin
                          : `https://linkedin.com/in/${contributor.social_linkedin}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-primary/20 border border-slate-800 hover:border-primary/50 text-slate-300 hover:text-white transition-all text-xs font-medium"
                    >
                      <Linkedin className="h-4 w-4 text-blue-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {contributor.social_twitter && (
                    <a
                      href={
                        contributor.social_twitter.startsWith('http')
                          ? contributor.social_twitter
                          : `https://twitter.com/${contributor.social_twitter.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-primary/20 border border-slate-800 hover:border-primary/50 text-slate-300 hover:text-white transition-all text-xs font-medium"
                    >
                      <Twitter className="h-4 w-4 text-sky-400" />
                      <span>Twitter / X</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Articles & Contributions */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <BookOpen className="h-4 w-4" />
                <span>Publicações & Curadoria</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-serif">
                Artigos e Edições Relacionadas
              </h2>
            </div>
            <p className="text-xs text-slate-400">Conteúdos assinados e curadorias editoriais</p>
          </div>

          {articles.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <BookOpen className="h-8 w-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium">Nenhum artigo publicado recentemente.</p>
              <p className="text-xs text-slate-500">
                Novas matérias e colunas deste autor serão adicionadas nas próximas edições da
                revista.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art) => (
                <Link
                  key={art.id}
                  to={art.link}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                >
                  <Card className="h-full bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col">
                    {art.imageUrl && (
                      <div className="aspect-[16/9] w-full overflow-hidden bg-slate-950 relative">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {art.tag && (
                          <Badge className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-primary border-slate-800 text-[10px] font-semibold">
                            {art.tag}
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-base text-slate-100 group-hover:text-primary transition-colors line-clamp-2">
                          {art.title}
                        </h3>
                        {art.description && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {art.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 group-hover:text-primary transition-colors">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {art.date
                              ? new Date(art.date).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'Recente'}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 font-medium">
                          Acessar
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
