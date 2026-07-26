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
import { Search, ChevronDown, ChevronUp, Youtube, Factory, Newspaper } from 'lucide-react'
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

const MATERIA_SECTION_LABELS: Record<string, string> = {
  titulo: 'TÍTULO PRINCIPAL',
  subtitulo: 'SUBTÍTULO',
  olho: 'OLHO',
  corpo: 'CORPO DA MATÉRIA',
  cta: 'CALL TO ACTION',
  tags: 'TAGS DE SEO',
  social: 'SUGESTÃO DE REDES SOCIAIS',
}

function getMateriaData(
  options: unknown,
): { content: string; sections: Record<string, string> } | null {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    const obj = options as Record<string, unknown>
    if (obj.type === 'materia-jornalistica' && typeof obj.content === 'string') {
      const sectionsRaw = obj.sections
      const sections =
        sectionsRaw && typeof sectionsRaw === 'object' && !Array.isArray(sectionsRaw)
          ? (sectionsRaw as Record<string, string>)
          : {}
      return { content: obj.content, sections }
    }
  }
  return null
}

interface MateriaCompletaContent {
  titulo_principal: string
  subtitulo: string
  olho: string
  corpo: string
  call_to_action: string[]
  tags_seo: string[]
  sugestao_redes: { instagram_text: string; arte_description: string }
}

function getMateriaCompletaData(options: unknown): MateriaCompletaContent | null {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    const obj = options as Record<string, unknown>
    if (obj.type === 'materia_completa' && obj.content && typeof obj.content === 'object') {
      return obj.content as MateriaCompletaContent
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
                const materiaData = getMateriaData(text.options)
                const materiaCompletaData = getMateriaCompletaData(text.options)
                const isMateria = materiaData !== null || materiaCompletaData !== null
                const options = Array.isArray(text.options) ? text.options : []
                const isExpanded = expandedId === text.id
                const isExpandable = isDescricao || isAtacadista || isMateria
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
                        ) : isMateria ? (
                          <Badge className="gap-1 bg-blue-500 text-white hover:bg-blue-600">
                            <Newspaper className="w-3 h-3" />📰 Matéria
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
                                {isMateria
                                  ? 'Ver matéria'
                                  : isAtacadista
                                    ? 'Ver legenda'
                                    : 'Ver descrição'}
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
                    {isMateria && isExpanded && materiaData && (
                      <TableRow key={`${text.id}-mat`}>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="max-h-64 overflow-y-auto space-y-3 p-2">
                            {Object.entries(MATERIA_SECTION_LABELS).map(([key, label]) => {
                              const value = materiaData.sections[key]
                              if (!value) return null
                              return (
                                <div key={key} className="text-sm">
                                  <span className="font-bold text-orange-600 text-xs">{label}</span>
                                  <p className="whitespace-pre-wrap leading-relaxed mt-1">
                                    {value}
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {isMateria && isExpanded && !materiaData && materiaCompletaData && (
                      <TableRow key={`${text.id}-matc`}>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="max-h-64 overflow-y-auto space-y-3 p-2">
                            <div className="text-sm">
                              <span className="font-bold text-orange-600 text-xs">
                                TÍTULO PRINCIPAL
                              </span>
                              <p className="whitespace-pre-wrap leading-relaxed mt-1">
                                {materiaCompletaData.titulo_principal}
                              </p>
                            </div>
                            <div className="text-sm">
                              <span className="font-bold text-orange-600 text-xs">SUBTÍTULO</span>
                              <p className="whitespace-pre-wrap leading-relaxed mt-1">
                                {materiaCompletaData.subtitulo}
                              </p>
                            </div>
                            <div className="text-sm">
                              <span className="font-bold text-orange-600 text-xs">OLHO</span>
                              <p className="whitespace-pre-wrap leading-relaxed mt-1">
                                {materiaCompletaData.olho}
                              </p>
                            </div>
                            <div className="text-sm">
                              <span className="font-bold text-orange-600 text-xs">
                                CORPO DA MATÉRIA
                              </span>
                              <p className="whitespace-pre-wrap leading-relaxed mt-1">
                                {materiaCompletaData.corpo}
                              </p>
                            </div>
                            <div className="text-sm">
                              <span className="font-bold text-orange-600 text-xs">
                                CALL TO ACTION
                              </span>
                              <ol className="list-decimal list-inside mt-1 space-y-0.5">
                                {materiaCompletaData.call_to_action.map((cta, i) => (
                                  <li key={i}>{cta}</li>
                                ))}
                              </ol>
                            </div>
                            <div className="text-sm">
                              <span className="font-bold text-orange-600 text-xs">TAGS DE SEO</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {materiaCompletaData.tags_seo.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="font-bold text-orange-600 text-xs">
                                SUGESTÃO DE REDES SOCIAIS
                              </span>
                              <p className="leading-relaxed mt-1">
                                <span className="font-semibold text-gray-500 text-xs">
                                  Texto Instagram:
                                </span>{' '}
                                {materiaCompletaData.sugestao_redes.instagram_text}
                              </p>
                              <p className="leading-relaxed mt-1">
                                <span className="font-semibold text-gray-500 text-xs">
                                  Sugestão de arte:
                                </span>{' '}
                                {materiaCompletaData.sugestao_redes.arte_description}
                              </p>
                            </div>
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
