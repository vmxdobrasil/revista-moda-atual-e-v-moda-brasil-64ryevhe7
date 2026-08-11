import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { BookOpen, Share2, BarChart2, Layers } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="inset" className="border-r border-border">
      <SidebarHeader className="p-6 flex flex-col items-center justify-center border-b border-border">
        <Link
          to="/admin"
          className="hover:opacity-95 transition-opacity flex flex-col items-center gap-2"
        >
          <BrandLogo variant="admin_sidebar" />
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
            HUB DE NEGÓCIOS
          </span>
        </Link>
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
