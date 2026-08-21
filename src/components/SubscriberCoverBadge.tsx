import { useSubscriberProfile } from '@/hooks/use-subscriber-profile'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Sparkles, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubscriberCoverBadgeProps {
  variant?: 'floating' | 'embedded' | 'compact' | 'story'
  className?: string
  hideWhenAnonymous?: boolean
  labelPrefix?: string
}

export function SubscriberCoverBadge({
  variant = 'floating',
  className,
  hideWhenAnonymous = false,
  labelPrefix = 'Exemplar Exclusivo de',
}: SubscriberCoverBadgeProps) {
  const profile = useSubscriberProfile()

  if (!profile.isAuthenticated) {
    if (hideWhenAnonymous) return null
    return null
  }

  if (variant === 'story') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-orange-500/40 text-white shadow-xl max-w-full animate-fade-in',
          className,
        )}
      >
        <Avatar className="h-7 w-7 border border-orange-400 ring-2 ring-orange-500/30 shrink-0">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-orange-600 text-white text-[10px] font-bold">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[9px] uppercase tracking-wider text-orange-300 font-semibold flex items-center gap-1 leading-none">
            <Crown className="w-2.5 h-2.5 text-orange-400" />
            Assinante
          </span>
          <span className="text-xs font-bold text-white truncate max-w-[140px] leading-tight">
            {profile.name}
          </span>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-orange-500/40 text-white shadow-lg text-xs animate-fade-in',
          className,
        )}
      >
        <Avatar className="h-6 w-6 border border-orange-400 shrink-0">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-orange-600 text-white text-[9px] font-bold">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] text-orange-300 uppercase tracking-wider font-semibold">
            Assinante:
          </span>
          <span className="font-bold text-white truncate max-w-[120px] text-xs">
            {profile.name}
          </span>
        </div>
      </div>
    )
  }

  if (variant === 'embedded') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/75 backdrop-blur-md border border-orange-500/40 shadow-xl text-white max-w-sm animate-fade-in',
          className,
        )}
      >
        <Avatar className="h-10 w-10 border-2 border-orange-500 ring-2 ring-orange-500/30 shadow-md shrink-0">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-xs">
            {profile.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-400 shrink-0" />
            {labelPrefix}
          </span>
          <span className="text-sm font-bold text-white truncate drop-shadow-sm font-serif">
            {profile.name}
          </span>
          <span className="text-[10px] text-slate-300 tracking-wide font-light">
            Edição Personalizada & Certificada
          </span>
        </div>
      </div>
    )
  }

  // Default: 'floating' badge for top/bottom of magazine covers
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950/90 backdrop-blur-md border border-orange-500/50 shadow-2xl text-white transition-all duration-300 z-30 animate-fade-in',
        className,
      )}
    >
      <Avatar className="h-8 w-8 border-2 border-orange-500 shadow-md ring-2 ring-orange-500/30 shrink-0">
        {profile.avatarUrl ? (
          <AvatarImage src={profile.avatarUrl} alt={profile.name} className="object-cover" />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-xs">
          {profile.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-left min-w-0 pr-1">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-orange-400 flex items-center gap-1 leading-none">
          <Crown className="w-2.5 h-2.5 text-orange-400 shrink-0" />
          {labelPrefix}
        </span>
        <span className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[180px] leading-tight font-serif drop-shadow-sm">
          {profile.name}
        </span>
      </div>
    </div>
  )
}
