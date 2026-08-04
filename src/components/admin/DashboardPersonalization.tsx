import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Settings2 } from 'lucide-react'
import type { CardPreference } from '@/services/user-preferences'

const CARD_LABELS: Record<string, string> = {
  metrics: 'Métricas',
  'quick-access': 'Acesso Rápido',
  charts: 'Gráficos',
  breakdowns: 'Breakdowns por Status',
  tabs: 'Stories e Conteúdo',
}

interface DashboardPersonalizationProps {
  cards: CardPreference[]
  onToggle: (cardId: string) => void
}

export function DashboardPersonalization({ cards, onToggle }: DashboardPersonalizationProps) {
  const sorted = [...cards].sort((a, b) => a.order - b.order)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline">Personalizar dashboard</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Visibilidade dos Cards</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sorted.map((card) => (
          <div key={card.id} className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm text-gray-700">{CARD_LABELS[card.id] || card.id}</span>
            <Switch checked={card.visible} onCheckedChange={() => onToggle(card.id)} />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
