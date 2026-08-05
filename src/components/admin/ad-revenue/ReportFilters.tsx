import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { AD_FORMATS, FORMAT_LABELS, AD_POSITIONS } from '@/services/ad-proposals'

export interface ReportFilterState {
  period: string
  format: string
  position: string
}

const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo período' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'this_month', label: 'Este mês' },
]

interface Props {
  value: ReportFilterState
  onChange: (value: ReportFilterState) => void
}

export function ReportFilters({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Período</Label>
        <Select value={value.period} onValueChange={(v) => onChange({ ...value, period: v })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Formato</Label>
        <Select value={value.format} onValueChange={(v) => onChange({ ...value, format: v })}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {AD_FORMATS.map((f) => (
              <SelectItem key={f} value={f}>
                {FORMAT_LABELS[f]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Posição</Label>
        <Select value={value.position} onValueChange={(v) => onChange({ ...value, position: v })}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {AD_POSITIONS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
