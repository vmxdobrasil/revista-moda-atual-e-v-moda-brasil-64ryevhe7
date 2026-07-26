import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pencil, Trash2, CalendarClock, Youtube, Newspaper } from 'lucide-react'
import { type StoryText, getScheduledStatus, truncate } from '@/services/story-texts'

function getDescriptionText(options: unknown): string | null {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    const obj = options as Record<string, unknown>
    if (typeof obj.description === 'string') return obj.description
  }
  return null
}

function getMateriaContent(options: unknown): string | null {
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    const obj = options as Record<string, unknown>
    if (obj.type === 'materia-jornalistica' && typeof obj.content === 'string') return obj.content
  }
  return null
}

interface Props {
  items: StoryText[]
  onEdit: (item: StoryText) => void
  onSchedule: (item: StoryText) => void
  onDelete: (id: string) => void
  showScheduled?: boolean
}

function ScheduledBadge({ date }: { date: string | null }) {
  const status = getScheduledStatus(date)
  if (status === 'none') return null
  if (status === 'today')
    return (
      <Badge className="bg-orange-500 text-white hover:bg-orange-600">Previsto para hoje</Badge>
    )
  if (status === 'past')
    return <Badge variant="destructive">{new Date(date!).toLocaleDateString('pt-BR')}</Badge>
  return <Badge variant="secondary">{new Date(date!).toLocaleDateString('pt-BR')}</Badge>
}

export function StoriesTable({ items, onEdit, onSchedule, onDelete, showScheduled }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assunto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Opções</TableHead>
          <TableHead>Criado</TableHead>
          {showScheduled && <TableHead>Agendado</TableHead>}
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showScheduled ? 6 : 5} className="text-center text-gray-400 py-10">
              Nenhum registro encontrado.
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => {
            const description = getDescriptionText(item.options)
            const isDescricao = description !== null
            const materiaContent = getMateriaContent(item.options)
            const isMateria = materiaContent !== null
            const options = Array.isArray(item.options) ? item.options : []
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-gray-900 max-w-[180px] truncate">
                  {item.subject}
                </TableCell>
                <TableCell>
                  {isMateria ? (
                    <Badge className="gap-1 bg-blue-500 text-white hover:bg-blue-600">
                      <Newspaper className="w-3 h-3" />
                      Matéria
                    </Badge>
                  ) : isDescricao ? (
                    <Badge className="gap-1 bg-red-500 text-white hover:bg-red-600">
                      <Youtube className="w-3 h-3" />
                      YouTube
                    </Badge>
                  ) : (
                    <Badge variant="outline">Texto</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isMateria ? (
                    <span className="text-xs text-gray-600 italic">
                      {truncate(materiaContent, 40)}
                    </span>
                  ) : isDescricao ? (
                    <span className="text-xs text-gray-600 italic">
                      {truncate(description, 40)}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      {options.map((opt, i) => (
                        <span key={i} className="text-xs text-gray-600">
                          {i + 1}. {truncate(opt, 15)}
                        </span>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-gray-600 text-sm">
                  {new Date(item.created).toLocaleDateString('pt-BR')}
                </TableCell>
                {showScheduled && (
                  <TableCell>
                    <ScheduledBadge date={item.scheduled_date} />
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!isDescricao && (
                      <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => onSchedule(item)}>
                      <CalendarClock className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir texto?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(item.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
