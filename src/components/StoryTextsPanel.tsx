import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import type { StoryText } from '@/services/story-texts'
import { getScheduledStatus, truncate } from '@/services/story-texts'

export interface StoryTextFilters {
  dateFrom: string
  dateTo: string
  search: string
}

interface StoryTextsPanelProps {
  storyTexts: StoryText[]
  filters: StoryTextFilters
  onFiltersChange: (filters: StoryTextFilters) => void
  loading: boolean
}

export function StoryTextsPanel({
  storyTexts,
  filters,
  onFiltersChange,
  loading,
}: StoryTextsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Data inicial</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Data final</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Buscar por assunto</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assunto</TableHead>
              <TableHead>Opções</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agendado</TableHead>
              <TableHead>Criado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : storyTexts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum texto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              storyTexts.map((text) => {
                const status = getScheduledStatus(text.scheduled_date)
                const options = Array.isArray(text.options) ? text.options : []
                return (
                  <TableRow key={text.id}>
                    <TableCell className="font-medium max-w-xs">
                      {truncate(text.subject, 60)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {options.length} opção(ões)
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === 'today'
                            ? 'default'
                            : status === 'past'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {status === 'none'
                          ? 'Não agendado'
                          : status === 'today'
                            ? 'Hoje'
                            : status === 'past'
                              ? 'Atrasado'
                              : 'Agendado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {text.scheduled_date
                        ? new Date(text.scheduled_date).toLocaleDateString('pt-BR')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(text.created).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
