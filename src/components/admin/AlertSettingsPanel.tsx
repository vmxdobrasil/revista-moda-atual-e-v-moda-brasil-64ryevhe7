import { Settings, Eye, Heart } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { AlertSettings } from '@/hooks/use-alert-settings'

interface AlertSettingsPanelProps {
  settings: AlertSettings
  onUpdate: (partial: Partial<AlertSettings>) => void
}

export function AlertSettingsPanel({ settings, onUpdate }: AlertSettingsPanelProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="no-print">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-orange-500" />
            <h4 className="font-semibold text-sm text-gray-800">Configurar Alertas</h4>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs text-gray-600">
              <Eye className="w-3.5 h-3.5" /> Limite de Views (alto)
            </Label>
            <Input
              type="number"
              value={settings.viewThreshold}
              onChange={(e) => onUpdate({ viewThreshold: Number(e.target.value) || 0 })}
              min={0}
              step={10000}
            />
            <p className="text-xs text-gray-400">Alerta quando views excedem este valor</p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs text-gray-600">
              <Heart className="w-3.5 h-3.5" /> Engajamento Mínimo (%)
            </Label>
            <Input
              type="number"
              value={Number((settings.engagementThreshold * 100).toFixed(1))}
              onChange={(e) =>
                onUpdate({ engagementThreshold: (Number(e.target.value) || 0) / 100 })
              }
              min={0}
              max={100}
              step={0.5}
            />
            <p className="text-xs text-gray-400">
              Alerta quando engajamento cai abaixo (mín. 10K views)
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
