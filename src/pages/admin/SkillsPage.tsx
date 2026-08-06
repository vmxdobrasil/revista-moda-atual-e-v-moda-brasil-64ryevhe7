import { useState, useEffect, useMemo } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getSkills,
  deleteSkill,
  SKILL_CATEGORIES,
  SKILL_STATUSES,
  type Skill,
} from '@/services/skills'
import { SkillCard } from '@/components/admin/skills/SkillCard'
import { SkillDetailView } from '@/components/admin/skills/SkillDetailView'
import { SkillEditor } from '@/components/admin/skills/SkillEditor'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type View = { mode: 'list' } | { mode: 'detail'; skill: Skill } | { mode: 'editor'; skill?: Skill }

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>({ mode: 'list' })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null)

  const loadData = async () => {
    try {
      const data = await getSkills()
      setSkills(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('skills', () => {
    loadData()
  })

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (
        search &&
        !s.title.toLowerCase().includes(search.toLowerCase()) &&
        !(s.summary || '').toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [skills, search, categoryFilter, statusFilter])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteSkill(deleteTarget.id)
      toast.success('Skill excluída')
      setDeleteTarget(null)
      setView({ mode: 'list' })
      loadData()
    } catch (e) {
      toast.error('Erro ao excluir skill')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (view.mode === 'detail') {
    return (
      <SkillDetailView
        skill={view.skill}
        onBack={() => setView({ mode: 'list' })}
        onEdit={() => setView({ mode: 'editor', skill: view.skill })}
        onDelete={() => setDeleteTarget(view.skill)}
      />
    )
  }

  if (view.mode === 'editor') {
    return (
      <SkillEditor
        skill={view.skill}
        onBack={() => setView({ mode: 'list' })}
        onSaved={() => {
          loadData()
          setView({ mode: 'list' })
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Skills & Playbooks</h1>
          <p className="text-sm text-gray-500">
            Fluxos operacionais padronizados da Revista MODA ATUAL
          </p>
        </div>
        <Button onClick={() => setView({ mode: 'editor' })} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Skill
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {SKILL_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {SKILL_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>Nenhuma skill encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onClick={() => setView({ mode: 'detail', skill })}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.title}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
