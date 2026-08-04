import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Instagram,
  Layers,
  ShieldCheck,
  Workflow,
  ClipboardList,
  Trophy,
  Search,
  Palette,
  BarChart3,
  Megaphone,
  Tag,
} from 'lucide-react'

interface QuickAccessItem {
  to: string
  label: string
  icon: LucideIcon
  color: string
}

const ITEMS: QuickAccessItem[] = [
  { to: '/admin/editions', label: 'Edições', icon: BookOpen, color: 'hsl(24, 95%, 53%)' },
  {
    to: '/admin/social-posts',
    label: 'Social Posts',
    icon: Instagram,
    color: 'hsl(280, 65%, 55%)',
  },
  {
    to: '/admin/multi-format-generator',
    label: 'Multi-Formato',
    icon: Layers,
    color: 'hsl(210, 80%, 50%)',
  },
  {
    to: '/admin/editorial-qa',
    label: 'Editorial QA',
    icon: ShieldCheck,
    color: 'hsl(140, 70%, 45%)',
  },
  { to: '/admin/content-workflow', label: 'Workflow', icon: Workflow, color: 'hsl(190, 80%, 45%)' },
  {
    to: '/admin/delivery-queue',
    label: 'Fila de Entrega',
    icon: ClipboardList,
    color: 'hsl(40, 90%, 50%)',
  },
  { to: '/admin/top60', label: 'Parceiros', icon: Trophy, color: 'hsl(45, 93%, 47%)' },
  { to: '/admin/seo-specialist', label: 'SEO', icon: Search, color: 'hsl(340, 75%, 55%)' },
  {
    to: '/admin/cover-art-director',
    label: 'Capa & Arte',
    icon: Palette,
    color: 'hsl(270, 60%, 55%)',
  },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, color: 'hsl(200, 70%, 50%)' },
  { to: '/admin/advertisements', label: 'Anúncios', icon: Megaphone, color: 'hsl(15, 80%, 50%)' },
  { to: '/admin/marketplace-products', label: 'Ofertas', icon: Tag, color: 'hsl(160, 70%, 40%)' },
]

export function QuickAccessCards() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Acesso Rápido</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {ITEMS.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="hover:shadow-lg transition-all border-none bg-white rounded-xl group cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-4 gap-2">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{ backgroundColor: item.color + '1a' }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center group-hover:text-gray-900 transition-colors">
                  {item.label}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
