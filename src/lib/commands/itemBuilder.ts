import { toast } from '@/hooks/use-toast'
import { MODULES, getModuleByNumber } from '@/lib/commands/modules'
import { SUPER_PROMPTS } from '@/lib/commands/superPrompts'
import { setPendingPrompt } from '@/lib/commands/promptQueue'
import {
  BASIC_EXAMPLES,
  ADVANCED_EXAMPLES,
  META_EXAMPLES,
  STORIES_EXAMPLES,
} from '@/lib/commands/examples'
import {
  executeBasic,
  executeAdvanced,
  executeMeta,
  executeStories,
} from '@/lib/commands/commandExecutor'
import type { PromptLibraryItem } from '@/services/prompt-library'

type ItemIcon = 'terminal' | 'hash' | 'sparkles' | 'alert'
type CommandLevel = 'B' | 'A' | 'S' | 'M' | null

export interface CommandItem {
  id: string
  primary: string
  secondary: string
  icon: ItemIcon
  level: CommandLevel
  disabled?: boolean
  action: () => void
}

const STATIC_COMMANDS = [
  { cmd: '/top60', label: 'Top 60 Marcas', path: '/admin/top60' },
  { cmd: '/vmodebrasil', label: 'Marketplace V MODA BRASIL', path: '/admin/vmodebrasil' },
  {
    cmd: '/vmodebrasil/orders',
    label: 'Pedidos do Marketplace',
    path: '/admin/vmodebrasil/orders',
  },
]

function isCmd(input: string, cmd: string): boolean {
  const t = input.trim().toLowerCase()
  return t === cmd || t.startsWith(cmd + ' ')
}

function arg(input: string, cmd: string): string {
  return input.trim().slice(cmd.length).trim()
}

export function buildItems(
  input: string,
  navigate: (p: string) => void,
  closeBar: () => void,
  currentPath: string,
  libraryPrompts: PromptLibraryItem[],
): CommandItem[] {
  const trimmed = input.trim().toLowerCase()

  if (isCmd(input, '/b')) {
    const task = arg(input, '/b')
    if (!task) {
      return BASIC_EXAMPLES.map((ex, i) => ({
        id: `b-ex-${i}`,
        primary: `/b ${ex}`,
        secondary: 'Prompt Básico',
        icon: 'terminal' as ItemIcon,
        level: 'B' as CommandLevel,
        action: () => {
          executeBasic(ex, navigate)
          closeBar()
        },
      }))
    }
    return [
      {
        id: 'b-run',
        primary: `/b ${task}`,
        secondary: 'Enviar como Prompt Básico',
        icon: 'terminal' as ItemIcon,
        level: 'B' as CommandLevel,
        action: () => {
          executeBasic(task, navigate)
          closeBar()
        },
      },
    ]
  }

  if (isCmd(input, '/s')) {
    const subject = arg(input, '/s')
    if (!subject) {
      return STORIES_EXAMPLES.map((ex, i) => ({
        id: `s-ex-${i}`,
        primary: ex,
        secondary: 'Stories On-Screen Text',
        icon: 'sparkles' as ItemIcon,
        level: 'S' as CommandLevel,
        action: () => {
          setPendingPrompt(ex)
          navigate('/admin/ai-persona/chat')
          closeBar()
          toast({
            title: 'Stories On-Screen Text',
            description: 'Template enviado para o Fashion Trend Advisor',
          })
        },
      }))
    }
    return [
      {
        id: 's-run',
        primary: `/s ${subject}`,
        secondary: 'Gerar 3 opções de texto para Stories',
        icon: 'sparkles' as ItemIcon,
        level: 'S' as CommandLevel,
        action: () => {
          executeStories(subject, navigate)
          closeBar()
        },
      },
    ]
  }

  if (isCmd(input, '/a')) {
    const task = arg(input, '/a')
    if (!task) {
      return ADVANCED_EXAMPLES.map((ex, i) => ({
        id: `a-ex-${i}`,
        primary: `/a ${ex}`,
        secondary: 'Prompt Avançado',
        icon: 'sparkles' as ItemIcon,
        level: 'A' as CommandLevel,
        action: () => {
          executeAdvanced(ex, navigate)
          closeBar()
        },
      }))
    }
    return [
      {
        id: 'a-run',
        primary: `/a ${task}`,
        secondary: 'Buscar contexto e enviar',
        icon: 'sparkles' as ItemIcon,
        level: 'A' as CommandLevel,
        action: () => {
          executeAdvanced(task, navigate)
          closeBar()
        },
      },
    ]
  }

  if (isCmd(input, '/m')) {
    const obj = arg(input, '/m')
    if (!obj) {
      return META_EXAMPLES.map((ex, i) => ({
        id: `m-ex-${i}`,
        primary: `/m ${ex}`,
        secondary: 'Prompt Meta',
        icon: 'sparkles' as ItemIcon,
        level: 'M' as CommandLevel,
        action: () => {
          executeMeta(ex)
          closeBar()
        },
      }))
    }
    return [
      {
        id: 'm-run',
        primary: `/m ${obj}`,
        secondary: 'Gerar novo Super prompt',
        icon: 'sparkles' as ItemIcon,
        level: 'M' as CommandLevel,
        action: () => {
          executeMeta(obj)
          closeBar()
        },
      },
    ]
  }

  if (trimmed.startsWith('/stories')) {
    const subject = arg(input, '/stories')
    if (!subject) {
      return [
        {
          id: 'stories-err',
          primary: '/stories',
          secondary: 'Informe o assunto (ex: /stories nova coleção de verão)',
          icon: 'alert' as ItemIcon,
          level: null,
          disabled: true,
          action: () => {
            toast({
              title: 'Assunto obrigatório',
              description:
                'Por favor, informe o assunto do Stories (ex: /super stories nova coleção de verão)',
              variant: 'destructive',
            })
          },
        },
      ]
    }
    const storiesPrompt =
      libraryPrompts.find((p) => p.slug === 'stories') ??
      SUPER_PROMPTS.find((s) => s.name === 'stories')
    const template = storiesPrompt
      ? 'prompt_content' in storiesPrompt
        ? storiesPrompt.prompt_content
        : storiesPrompt.systemPrompt
      : ''
    const filledPrompt = template.replace(/\[ASSUNTO\]/g, subject)
    return [
      {
        id: 'stories-run',
        primary: `/stories ${subject}`,
        secondary: 'Gerar 3 opções de texto on-screen para Stories',
        icon: 'sparkles' as ItemIcon,
        level: 'S' as CommandLevel,
        action: () => {
          if (!template) {
            toast({
              title: 'Super prompt não encontrado',
              description: 'O prompt "stories" não foi encontrado na biblioteca.',
              variant: 'destructive',
            })
            closeBar()
            return
          }
          setPendingPrompt(filledPrompt)
          if (currentPath !== '/admin/ai-persona/chat') navigate('/admin/ai-persona/chat')
          closeBar()
          toast({
            title: "Super Prompt 'Texto para Stories' ativado",
            description: `Assunto: ${subject}`,
          })
        },
      },
    ]
  }

  if (trimmed.startsWith('/super')) {
    const namePart = trimmed.replace('/super', '').trim()
    const prompts =
      libraryPrompts.length > 0
        ? libraryPrompts
        : SUPER_PROMPTS.map((s) => ({
            id: '',
            name: s.name,
            description: s.label,
            prompt_content: s.systemPrompt,
            slug: s.name,
            category: 'super' as const,
            created: '',
            updated: '',
          }))
    const matched = prompts.filter(
      (p) =>
        namePart === '' ||
        p.name.toLowerCase().includes(namePart) ||
        p.description.toLowerCase().includes(namePart),
    )
    if (matched.length === 0) {
      return [
        {
          id: 'super-err',
          primary: 'Super prompt não encontrado',
          secondary: 'Use /super para listar disponíveis.',
          icon: 'alert' as ItemIcon,
          level: null,
          disabled: true,
          action: () => {
            toast({
              title: 'Super prompt não encontrado',
              description: 'Use `/super` para listar disponíveis.',
              variant: 'destructive',
            })
          },
        },
      ]
    }
    return matched.map((p) => ({
      id: `super-${p.slug}`,
      primary: `/super ${p.name}`,
      secondary: p.description,
      icon: 'sparkles' as ItemIcon,
      level: 'S' as CommandLevel,
      action: () => {
        setPendingPrompt(p.prompt_content)
        if (currentPath !== '/admin/ai-persona/chat') navigate('/admin/ai-persona/chat')
        closeBar()
        toast({ title: `Super Prompt '${p.name}' ativado`, description: p.description })
      },
    }))
  }

  if (trimmed.startsWith('/modulo')) {
    const numPart = trimmed.replace('/modulo', '').trim()
    if (numPart === '' || !/^\d+$/.test(numPart)) {
      return MODULES.map((m) => ({
        id: `mod-${m.number}`,
        primary: `/modulo ${m.number}`,
        secondary: m.label,
        icon: 'hash' as ItemIcon,
        level: null,
        action: () => {
          navigate(m.path)
          closeBar()
          toast({ title: `Navegando para Módulo ${m.number}`, description: m.label })
        },
      }))
    }
    const num = parseInt(numPart, 10)
    const mod = getModuleByNumber(num)
    if (mod) {
      return [
        {
          id: `mod-${mod.number}`,
          primary: `/modulo ${mod.number}`,
          secondary: mod.label,
          icon: 'hash' as ItemIcon,
          level: null,
          action: () => {
            navigate(mod.path)
            closeBar()
            toast({ title: `Navegando para Módulo ${mod.number}`, description: mod.label })
          },
        },
      ]
    }
    return [
      {
        id: 'mod-err',
        primary: 'Módulo inválido',
        secondary: 'Use 1 a 7.',
        icon: 'alert' as ItemIcon,
        level: null,
        disabled: true,
        action: () => {},
      },
    ]
  }

  return STATIC_COMMANDS.filter(
    (c) => c.cmd.includes(trimmed) || c.label.toLowerCase().includes(trimmed),
  ).map((c) => ({
    id: c.cmd,
    primary: c.cmd,
    secondary: c.label,
    icon: 'terminal' as ItemIcon,
    level: null,
    action: () => {
      navigate(c.path)
      closeBar()
    },
  }))
}
