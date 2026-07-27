import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, ArrowLeft, Search } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAllPrompts,
  getPromptsByCategory,
  type PromptLibraryItem,
} from '@/services/prompt-library'
import pb from '@/lib/pocketbase/client'

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Básico',
  advanced: 'Avançado',
  super: 'Super',
}

const CATEGORY_COLORS: Record<string, string> = {
  basic: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  super: 'bg-orange-100 text-orange-700',
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptLibraryItem | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const loadData = useCallback(async () => {
    try {
      let data: PromptLibraryItem[]
      if (categoryFilter === 'all') {
        data = await getAllPrompts()
      } else {
        data = await getPromptsByCategory(categoryFilter)
      }
      setPrompts(data)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar prompts.')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSelect = (prompt: PromptLibraryItem) => {
    setSelectedPrompt(prompt)
    setEditContent(prompt.prompt_content)
  }

  const handleBack = () => {
    setSelectedPrompt(null)
    setEditContent('')
  }

  const handleSave = async () => {
    if (!selectedPrompt) return
    if (!editContent.trim()) {
      toast.error('O conteúdo do prompt não pode estar vazio.')
      return
    }
    setSaving(true)
    try {
      const updated = await pb
        .collection('prompt_library')
        .update(selectedPrompt.id, { prompt_content: editContent })
      const updatedPrompt = { ...selectedPrompt, prompt_content: editContent } as PromptLibraryItem
      setSelectedPrompt(updatedPrompt)
      setPrompts((prev) => prev.map((p) => (p.id === selectedPrompt.id ? updatedPrompt : p)))
      toast.success('Prompt atualizado com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar prompt.')
    } finally {
      setSaving(false)
    }
  }

  const filteredPrompts = prompts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (selectedPrompt) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
              {selectedPrompt.name}
            </h2>
            <p className="text-sm text-gray-500">{selectedPrompt.slug}</p>
          </div>
          <Badge
            className={CATEGORY_COLORS[selectedPrompt.category] || 'bg-gray-100 text-gray-700'}
          >
            {CATEGORY_LABELS[selectedPrompt.category] || selectedPrompt.category}
          </Badge>
        </div>

        {selectedPrompt.description && (
          <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-4 border border-gray-100">
            {selectedPrompt.description}
          </p>
        )}

        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Conteúdo do Prompt
              </label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={20}
                className="resize-y font-mono text-sm"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleBack}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !editContent.trim()}
                className="bg-orange-500 hover:bg-orange-600 gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar Prompt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Prompts</h2>
        <p className="text-gray-500 mt-1">
          Visualize e edite os templates de geração de conteúdo usados pelos hooks.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, slug ou descrição..."
            className="pl-9 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'basic', 'advanced', 'super'].map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              {cat === 'all' ? 'Todos' : CATEGORY_LABELS[cat] || cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Nenhum prompt encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelect(prompt)}
            >
              <CardContent className="p-5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-base">{prompt.name}</h3>
                  <Badge
                    className={CATEGORY_COLORS[prompt.category] || 'bg-gray-100 text-gray-700'}
                  >
                    {CATEGORY_LABELS[prompt.category] || prompt.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                  {prompt.description || 'Sem descrição.'}
                </p>
                <p className="text-xs text-gray-400 font-mono">{prompt.slug}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
