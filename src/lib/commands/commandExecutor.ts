import { toast } from '@/hooks/use-toast'
import { setPendingPrompt } from '@/lib/commands/promptQueue'
import { fetchAdvancedContext } from '@/services/advanced-context'
import { generateMetaPrompt } from '@/services/prompt-library'
import { buildStoriesPrompt } from '@/lib/commands/examples'

export function executeBasic(task: string, navigate: (p: string) => void): void {
  setPendingPrompt(task)
  navigate('/admin/ai-persona/chat')
  toast({ title: 'Prompt Básico ativado', description: task.slice(0, 60) })
}

export async function executeAdvanced(task: string, navigate: (p: string) => void): Promise<void> {
  toast({ title: 'Buscando contexto...', description: 'Preparando prompt avançado' })
  try {
    const prompt = await fetchAdvancedContext(task)
    setPendingPrompt(prompt)
    navigate('/admin/ai-persona/chat')
    toast({ title: 'Prompt Avançado ativado', description: task.slice(0, 60) })
  } catch (err: any) {
    toast({
      title: 'Erro ao buscar contexto',
      description: err?.message || 'Contexto não encontrado para o módulo especificado',
      variant: 'destructive',
    })
  }
}

export function executeStories(subject: string, navigate: (p: string) => void): void {
  const prompt = buildStoriesPrompt(subject)
  setPendingPrompt(prompt)
  navigate('/admin/ai-persona/chat')
  toast({ title: 'Stories On-Screen Text ativado', description: `Assunto: ${subject}` })
}

export async function executeMeta(objective: string): Promise<void> {
  toast({
    title: 'Gerando Meta prompt...',
    description: 'O assistente está criando um novo prompt',
  })
  try {
    const result = await generateMetaPrompt(objective)
    toast({
      title: `Novo Super prompt criado: ${result.name}`,
      description: result.description,
    })
  } catch (err: any) {
    toast({
      title: 'Erro ao criar Meta prompt',
      description: err?.message || 'Falha ao gerar o prompt',
      variant: 'destructive',
    })
  }
}
