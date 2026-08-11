import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { LogOut, ExternalLink, ShieldCheck } from 'lucide-react'

export function AppHeader() {
  const { user, signOut } = useAuth()

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-xs px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link to="/admin" className="flex items-center gap-2">
          <BrandLogo size="md" className="h-10 md:h-12 w-auto" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/" target="_blank">
          <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground">
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Site
          </Button>
        </Link>

        {user && (
          <div className="flex items-center gap-3 border-l pl-3 border-border">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-foreground">{user.name || user.email}</p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" /> Administrador
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={signOut}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
