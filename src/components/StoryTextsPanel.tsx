import { useState, Fragment } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, ChevronDown, ChevronUp, Youtube, Factory } from 'lucide-react'
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

function getDescriptionText(options: unknown): string | null {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    const obj = options as Record<string, unknown>
    if (typeof obj.description === 'string') return obj.description
  }
  return null
}

function getAtacadistaData(options: unknown): { caption: string; hashtags: string[] } | null {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    const obj = options as Record<string, unknown>
    if (obj.type === 'legenda-atacadista' && typeof obj.caption === 'string') {
      const hashtags = Array.isArray(obj.hashtags)
        ? obj.hashtags.filter((h): h is string => typeof h === 'string')
        : []
      return { caption: obj.caption, hashtags }
    }
  }
  return null
}

export function StoryTextsPanel({
  storyTexts,
  filters,
  onFiltersChange,
  loading,
}: StoryTextsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
              <TableHead>Tipo</TableHead>
              <TableHead>Opções</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agendado</TableHead>
              <TableHead>Criado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : storyTexts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum texto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              storyTexts.map((text) => {
                const status = getScheduledStatus(text.scheduled_date)
                const description = getDescriptionText(text.options)
                const isDescricao = description !== null
                const atacadistaData = getAtacadistaData(text.options)
                const isAtacadista = atacadistaData !== null
                const options = Array.isArray(text.options) ? text.options : []
                const isExpanded = expandedId === text.id
                const isExpandable = isDescricao || isAtacadista
                return (
                  <Fragment key={text.id}>
                    <TableRow>
                      <TableCell className="font-medium max-w-xs">
                        {truncate(text.subject, 60)}
                      </TableCell>
                      <TableCell>
                        {isAtacadista ? (
                          <Badge className="gap-1 bg-orange-500 text-white hover:bg-orange-600">
                            <Factory className="w-3 h-3" />🏭 Atacado
                          </Badge>
                        ) : isDescricao ? (
                          <Badge className="gap-1 bg-red-500 text-white hover:bg-red-600">
                            <Youtube className="w-3 h-3" />
                            Descrição YouTube
                          </Badge>
                        ) : (
                          <Badge variant="outline">Texto</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {isExpandable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs"
                            onClick={() => setExpandedId(isExpanded ? null : text.id)}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3" /> Recolher
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />{' '}
                                {isAtacadista ? 'Ver legenda' : 'Ver descrição'}
                              </>
                            )}
                          </Button>
                        ) : (
                          `${options.length} opção(ões)`
                        )}
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
                    {isAtacadista && isExpanded && atacadistaData && (
                      <TableRow key={`${text.id}-atac`}>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="space-y-2 p-2">
                            <div className="text-sm leading-relaxed">{atacadistaData.caption}</div>
                            {atacadistaData.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {atacadistaData.hashtags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {isDescricao && isExpanded && (
                      <TableRow key={`${text.id}-desc`}>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed p-2">
                            {description}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
