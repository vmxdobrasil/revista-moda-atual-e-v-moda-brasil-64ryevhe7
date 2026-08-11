import { Link, useLocation } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Share2,
  Award,
  Megaphone,
  Truck,
  Layers,
  Search,
  CheckCircle2,
  Mail,
  DollarSign,
  TrendingUp,
  BarChart2,
  Bot,
  Settings,
  Shield,
  FileText,
} from 'lucide-react'

export function AppSidebar() {
  const location = useLocation()

  const sections = [
    {
      title: 'Principal',
      items: [
        { label: 'Visão Geral', path: '/admin', icon: LayoutDashboard },
        { label: 'Edições Digitais', path: '/admin/editions', icon: BookOpen },
        { label: 'TOP 60 Marcas', path: '/admin/top60', icon: Award },
        { label: 'Gerador de Conteúdo', path: '/admin/content-generator', icon: Sparkles },
      ],
    },
    {
      title: 'Marketing & Mídia',
      items: [
        { label: 'Redes Sociais', path: '/admin/social-posts', icon: Share2 },
        { label: 'Anúncios & Banners', path: '/admin/advertisements', icon: Megaphone },
        { label: 'Fila de Entregas', path: '/admin/delivery-queue', icon: Truck },
        { label: 'Multi-Formatos', path: '/admin/multi-format-generator', icon: Layers },
      ],
    },
    {
      title: 'Agentes de IA',
      items: [
        { label: 'Especialista SEO', path: '/admin/seo-specialist', icon: Search },
        { label: 'Direção de Arte', path: '/admin/cover-art-director', icon: Sparkles },
        { label: 'QA Editorial', path: '/admin/editorial-qa', icon: CheckCircle2 },
        { label: 'Atendimento Instagram', path: '/admin/social-engagement', icon: Bot },
        { label: 'Inteligência de Mercado', path: '/admin/market-watch', icon: BarChart2 },
      ],
    },
    {
      title: 'Negócios & Performance',
      items: [
        { label: 'Newsletter & CRM', path: '/admin/newsletter', icon: Mail },
        { label: 'Receita de Anúncios', path: '/admin/ad-revenue', icon: DollarSign },
        { label: 'Funil de Conversão', path: '/admin/conversion', icon: TrendingUp },
        { label: 'Habilidades & Playbook', path: '/admin/skills', icon: FileText },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { label: 'Identidade da Marca', path: '/admin/logo-settings', icon: Settings },
        { label: 'Segurança & 2FA', path: '/admin/security', icon: Shield },
      ],
    },
  ]

  return (
    <aside className="w-64 border-r border-border bg-slate-950 text-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      <div className="p-4 border-b border-slate-800 flex items-center justify-center">
        <Link to="/admin" className="block py-1">
          <BrandLogo size="md" className="h-12 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h5 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {section.title}
            </h5>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-orange-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
