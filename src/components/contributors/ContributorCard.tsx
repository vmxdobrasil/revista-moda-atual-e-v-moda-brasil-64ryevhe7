import { Link } from 'react-router-dom'
import { Contributor, getContributorPhotoUrl } from '@/services/contributors'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles } from 'lucide-react'

interface ContributorCardProps {
  contributor: Contributor
  variant?: 'compact' | 'featured' | 'detailed'
  className?: string
}

export function ContributorCard({
  contributor,
  variant = 'compact',
  className = '',
}: ContributorCardProps) {
  const photoUrl = getContributorPhotoUrl(contributor, 300)
  const initials = contributor.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  if (variant === 'featured') {
    return (
      <Link
        to={`/contributor/${contributor.slug}`}
        className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-all duration-300 ${className}`}
      >
        <Card className="h-full bg-slate-900/90 border-slate-800 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <Avatar className="h-20 w-20 ring-2 ring-primary/40 group-hover:ring-primary transition-all duration-300">
                  <AvatarImage
                    src={photoUrl}
                    alt={contributor.name}
                    className="object-cover"
                    loading="lazy"
                  />
                  <AvatarFallback className="bg-slate-800 text-primary font-semibold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {contributor.featured && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 border-primary/30 text-primary text-xs font-medium gap-1 shrink-0"
                  >
                    <Sparkles className="h-3 w-3" />
                    Destaque
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                {contributor.name}
              </h3>
              {contributor.role && (
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/90 mt-1 mb-3">
                  {contributor.role}
                </p>
              )}
              {contributor.bio && (
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {contributor.bio}
                </p>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-primary transition-colors">
              <span>Ver perfil & matérias</span>
              <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link
      to={`/contributor/${contributor.slug}`}
      className={`group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl transition-all duration-300 ${className}`}
    >
      <Card className="h-full bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 hover:shadow-md transition-all duration-300">
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-1 ring-slate-700 group-hover:ring-primary transition-all duration-300 shrink-0">
            <AvatarImage
              src={photoUrl}
              alt={contributor.name}
              className="object-cover"
              loading="lazy"
            />
            <AvatarFallback className="bg-slate-800 text-primary font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-100 group-hover:text-primary transition-colors truncate text-sm sm:text-base">
                {contributor.name}
              </h4>
              {contributor.featured && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              )}
            </div>
            {contributor.role && (
              <p className="text-xs text-primary/90 truncate font-medium mt-0.5">
                {contributor.role}
              </p>
            )}
          </div>

          <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}
