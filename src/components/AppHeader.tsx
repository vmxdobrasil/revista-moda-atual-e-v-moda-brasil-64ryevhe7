import { Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { BrandLogo } from '@/components/BrandLogo'

export function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-6 bg-card sticky top-0 z-30">
      <SidebarTrigger />
      <div className="hidden sm:flex items-center gap-2">
        <BrandLogo variant="primary" className="h-8 w-auto" />
      </div>
      <div className="flex-1 flex items-center px-4 bg-muted/50 rounded-md h-10 max-w-md ml-2 md:ml-4">
        <Search className="w-4 h-4 text-muted-foreground mr-2" />
        <input
          type="text"
          placeholder="Buscar edições, marcas ou relatórios..."
          className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full"></span>
        </Button>
        <div className="w-9 h-9 bg-brand-gold rounded-full flex items-center justify-center text-black font-bold text-sm shadow-md">
          EA
        </div>
      </div>
    </header>
  )
}
