import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, BookOpen } from 'lucide-react'
import { getSkills, type Skill } from '@/services/skills'
import { InteractivePlaybook } from '@/components/admin/skills/InteractivePlaybook'
import { AdherenceReport } from '@/components/admin/skills/AdherenceReport'
import { useRealtime } from '@/hooks/use-realtime'

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await getSkills()
      setSkills(data)
      if (data.length > 0) {
        setSelectedSkill((prev) =>
          prev && data.find((s) => s.id === prev.id)
            ? data.find((s) => s.id === prev.id)!
            : data[0],
        )
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('skills', () => load())

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-orange-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Skills & Playbooks</h2>
          <p className="text-gray-500 mt-1">
            Playbooks interativos para a equipe editorial e comercial
          </p>
        </div>
      </div>

      <Tabs defaultValue="playbooks">
        <TabsList className="bg-gray-100 rounded-lg">
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          <TabsTrigger value="adherence">Relatório de Adesão</TabsTrigger>
        </TabsList>
        <TabsContent value="playbooks" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              {skills.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSkill(s)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedSkill?.id === s.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-800">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.category}</p>
                </button>
              ))}
            </div>
            <div className="lg:col-span-2">
              {selectedSkill ? (
                <InteractivePlaybook skill={selectedSkill} />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Selecione um Skill para visualizar o playbook
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="adherence" className="mt-4">
          <AdherenceReport skills={skills} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
