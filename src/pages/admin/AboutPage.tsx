import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { getAboutContent, updateAboutContent, type AboutContent } from '@/services/about-content'

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getAboutContent()
      setContent(data)
      setTitle(data.title)
      setBody(data.body)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar conteúdo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    if (!content?.id) {
      toast.error('Nenhum registro encontrado para atualizar.')
      return
    }
    if (!title.trim() || !body.trim()) {
      toast.error('Título e corpo são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      const updated = await updateAboutContent(content.id, {
        title: title.trim(),
        body: body.trim(),
      })
      setContent(updated)
      toast.success('Conteúdo atualizado com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar conteúdo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Página Sobre</h2>
        <p className="text-gray-500 mt-1">Edite o conteúdo exibido na página pública /sobre.</p>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da página"
              className="rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Corpo do Texto</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Conteúdo da página sobre..."
              rows={14}
              className="resize-y"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Use quebras de linha para separar parágrafos.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim() || !body.trim()}
              className="bg-orange-500 hover:bg-orange-600 gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
