import { Button } from '@/components/ui/button'
import { PERIOD_LABELS, type PeriodFilter } from '@/services/dashboard-metrics'
import { Calendar } from 'lucide-react'

const PERIOD_OPTIONS: PeriodFilter[] = ['7d', '30d', 'this_month', 'all']

interface PeriodFilterProps {
  value: PeriodFilter
  onChange: (value: PeriodFilter) => void
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-500 hidden sm:block" />
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {PERIOD_OPTIONS.map((opt) => (
          <Button
            key={opt}
            size="sm"
            variant={value === opt ? 'default' : 'ghost'}
            className={
              value === opt ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'text-gray-600'
            }
            onClick={() => onChange(opt)}
          >
            {PERIOD_LABELS[opt]}
          </Button>
        ))}
      </div>
    </div>
  )
}
