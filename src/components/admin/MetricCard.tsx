import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color: string
}

export function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
          style={{ backgroundColor: color + '1a' }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
