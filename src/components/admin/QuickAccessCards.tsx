import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import {
  BookOpen,
  Instagram,
  Layers,
  ShieldCheck,
  BarChart3,
  Sparkles,
  MessageCircle,
  Trophy,
  Megaphone,
  Tag,
  ClipboardList,
  Wand2,
  Wrench,
  FileSearch,
  Library,
  BookHeart,
  Search,
  Palette,
  Lock,
  Workflow,
} from 'lucide-react'

const QUICK_ACCESS = [
  {
    to: '/admin/editions',
    label: 'Edições',
    description: 'Gerenciar publicações',
    icon: BookOpen,
    color: 'hsl(24, 95%, 53%)',
  },
  {
    to: '/admin/social-posts',
    label: 'Social Posts',
    description: 'Posts e conteúdo',
    icon: Instagram,
    color: 'hsl(280, 65%, 55%)',
  },
  {
    to: '/admin/multi-format-generator',
    label: 'Multi-Formato',
    description: 'Gerador de conteúdo',
    icon: Layers,
    color: 'hsl(190, 80%, 45%)',
  },
  {
    to: '/admin/editorial-qa',
    label: 'QA Editorial',
    description: 'Controle de qualidade',
    icon: ShieldCheck,
    color: 'hsl(140, 70%, 45%)',
  },
]

const MANAGEMENT_MODULES = [
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/content-generator', label: 'Gerador', icon: Sparkles },
  { to: '/admin/content-workflow', label: 'Workflow', icon: Workflow },
  { to: '/admin/social-analytics', label: 'Social Analytics', icon: BarChart3 },
  { to: '/admin/ai-persona/chat', label: 'AI Persona', icon: MessageCircle },
  { to: '/admin/top60', label: 'Parceiros', icon: Trophy },
  { to: '/admin/advertisements', label: 'Anúncios', icon: Megaphone },
  { to: '/admin/marketplace-products', label: 'Marketplace', icon: Tag },
  { to: '/admin/delivery-queue', label: 'Fila Entrega', icon: ClipboardList },
  { to: '/admin/arquiteto-workflow', label: 'Arquiteto', icon: Wand2 },
  { to: '/admin/engenheiro-refinamento', label: 'Engenheiro', icon: Wrench },
  { to: '/admin/prompt-refinement', label: 'Refinamento', icon: FileSearch },
  { to: '/admin/prompts', label: 'Prompts', icon: Library },
  { to: '/admin/about', label: 'Sobre', icon: BookHeart },
  { to: '/admin/audit', label: 'Auditoria', icon: ShieldCheck },
  { to: '/admin/seo-specialist', label: 'SEO', icon: Search },
  { to: '/admin/cover-art-director', label: 'Capa & Arte', icon: Palette },
  { to: '/admin/security', label: 'Segurança', icon: Lock },
]

export function QuickAccessCards() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Acesso Rápido</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACCESS.map((item) => (
            <Link key={item.to} to={item.to}>
              <Card className="rounded-xl border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: item.color + '1a' }}
                  >
                    <item.icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Gestão & Controle</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MANAGEMENT_MODULES.map((item) => (
            <Link key={item.to} to={item.to}>
              <Card className="rounded-lg border-none bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-3 flex flex-col items-center gap-2 text-center">
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
