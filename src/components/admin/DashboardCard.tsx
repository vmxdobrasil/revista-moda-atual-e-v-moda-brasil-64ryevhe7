import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, EyeOff } from 'lucide-react'

interface DashboardSectionProps {
  title: string
  icon?: ReactNode
  actions?: ReactNode
  onMoveUp?: () => void
  onMoveDown?: () => void
  onHide?: () => void
  isFirst?: boolean
  isLast?: boolean
  children: ReactNode
}

export function DashboardSection({
  title,
  icon,
  actions,
  onMoveUp,
  onMoveDown,
  onHide,
  isFirst,
  isLast,
  children,
}: DashboardSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="flex items-center gap-1">
          {actions}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isFirst}
            onClick={onMoveUp}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isLast}
            onClick={onMoveDown}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onHide}>
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}
