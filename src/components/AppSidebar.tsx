import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { BookOpen, Store, Share2, BarChart2, Layers } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="inset" className="border-r border-border">
      <SidebarHeader className="p-6 flex flex-col items-center justify-center border-b border-border">
        <div className="font-serif text-2xl font-bold tracking-widest text-brand-gold text-center leading-tight">
          V MODA
          <br />
          <span className="text-xs text-foreground tracking-widest">BRASIL</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-6 px-2">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/'}>
              <Link to="/">
                <BarChart2 className="w-4 h-4" /> <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/editions'}>
              <Link to="/editions">
                <BookOpen className="w-4 h-4" /> <span>Edições</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/hub'}>
              <Link to="/hub">
                <Store className="w-4 h-4" /> <span>Marketplace</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/social'}>
              <Link to="/social">
                <Share2 className="w-4 h-4" /> <span>Automação Social</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="pt-8 pb-2">
            <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Demo Leitor
            </div>
          </div>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/reader/latest">
                <Layers className="w-4 h-4" /> <span>Ver Revista</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
