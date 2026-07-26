import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Terminal, CornerDownLeft, Hash, Sparkles, AlertCircle } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { getAllPrompts, type PromptLibraryItem } from '@/services/prompt-library'
import { generateCaption } from '@/services/caption'
import { buildItems, type CommandItem } from '@/lib/commands/itemBuilder'
import { LEVEL_BADGES } from '@/lib/commands/examples'
import { LegendaPanel, type LegendaPhase } from '@/components/commands/LegendaPanel'
import { ReelPanel, type ReelPhase } from '@/components/commands/ReelPanel'
import { TitulosPanel, type TitulosPhase } from '@/components/commands/TitulosPanel'
import { DescricaoPanel, type DescricaoPhase } from '@/components/commands/DescricaoPanel'
import {
  LegendaAtacadistaPanel,
  type LegendaAtacadistaPhase,
} from '@/components/commands/LegendaAtacadistaPanel'
import { generateReel } from '@/services/reel'
import { generateLegendaAtacadista } from '@/services/legenda-atacadista'
import { generateTitulos } from '@/services/titulos'
import { generateDescricao } from '@/services/descricao'
import { generateMateria } from '@/services/materia'
import type { MateriaArticle } from '@/services/materia'
import { MateriaPanel, type MateriaPhase } from '@/components/commands/MateriaPanel'
import { generateWeeklyPlan } from '@/services/weekly-plan'
import type { WeeklyPlanResult } from '@/services/weekly-plan'
import { WeeklyPlanPanel, type WeeklyPlanPhase } from '@/components/commands/WeeklyPlanPanel'
import { toast } from '@/hooks/use-toast'

function renderIcon(icon: string) {
  switch (icon) {
    case 'hash':
      return <Hash className="w-4 h-4 text-orange-500 shrink-0" />
    case 'sparkles':
      return <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
    case 'alert':
      return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
    default:
      return <Terminal className="w-4 h-4 text-orange-500 shrink-0" />
  }
}

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [libraryPrompts, setLibraryPrompts] = useState<PromptLibraryItem[]>([])
  const [legendaPhase, setLegendaPhase] = useState<LegendaPhase>('idle')
  const [legendaCaption, setLegendaCaption] = useState('')
  const [legendaError, setLegendaError] = useState('')
  const [reelPhase, setReelPhase] = useState<ReelPhase>('idle')
  const [reelOptions, setReelOptions] = useState<string[]>([])
  const [reelError, setReelError] = useState('')
  const [titulosPhase, setTitulosPhase] = useState<TitulosPhase>('idle')
  const [titulosOptions, setTitulosOptions] = useState<string[]>([])
  const [titulosError, setTitulosError] = useState('')
  const [descricaoPhase, setDescricaoPhase] = useState<DescricaoPhase>('idle')
  const [descricaoText, setDescricaoText] = useState('')
  const [descricaoError, setDescricaoError] = useState('')
  const [legendaAtacadistaPhase, setLegendaAtacadistaPhase] =
    useState<LegendaAtacadistaPhase>('idle')
  const [legendaAtacadistaCaption, setLegendaAtacadistaCaption] = useState('')
  const [legendaAtacadistaHashtags, setLegendaAtacadistaHashtags] = useState<string[]>([])
  const [legendaAtacadistaError, setLegendaAtacadistaError] = useState('')
  const [materiaPhase, setMateriaPhase] = useState<MateriaPhase>('idle')
  const [materiaContent, setMateriaContent] = useState('')
  const [materiaArticle, setMateriaArticle] = useState<MateriaArticle | null>(null)
  const [materiaError, setMateriaError] = useState('')
  const [weeklyPlanPhase, setWeeklyPlanPhase] = useState<WeeklyPlanPhase>('idle')
  const [weeklyPlanResult, setWeeklyPlanResult] = useState<WeeklyPlanResult | null>(null)
  const [weeklyPlanError, setWeeklyPlanError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const closeBar = useCallback(() => {
    setOpen(false)
    setInput('')
    setSelectedIndex(0)
    setLegendaPhase('idle')
    setLegendaCaption('')
    setLegendaError('')
    setReelPhase('idle')
    setReelOptions([])
    setReelError('')
    setTitulosPhase('idle')
    setTitulosOptions([])
    setTitulosError('')
    setDescricaoPhase('idle')
    setDescricaoText('')
    setDescricaoError('')
    setLegendaAtacadistaPhase('idle')
    setLegendaAtacadistaCaption('')
    setLegendaAtacadistaHashtags([])
    setLegendaAtacadistaError('')
    setMateriaPhase('idle')
    setMateriaContent('')
    setMateriaArticle(null)
    setMateriaError('')
    setWeeklyPlanPhase('idle')
    setWeeklyPlanResult(null)
    setWeeklyPlanError('')
  }, [])

  const handleLegendaGenerate = useCallback(async (theme: string) => {
    setLegendaPhase('generating')
    try {
      const result = await generateCaption(theme)
      setLegendaCaption(result.caption)
      setLegendaPhase('result')
    } catch (err: any) {
      setLegendaError(err?.message || 'Falha ao gerar legenda')
      setLegendaPhase('error')
    }
  }, [])

  const handleReelGenerate = useCallback(async (subject: string) => {
    setReelPhase('generating')
    try {
      const result = await generateReel(subject)
      setReelOptions(result.options)
      setReelPhase('result')
      toast({ title: 'Roteiro de Reel gerado e salvo!' })
    } catch (err: any) {
      setReelError(err?.message || 'Erro ao gerar roteiro. Tente novamente.')
      setReelPhase('error')
    }
  }, [])

  const handleTitulosGenerate = useCallback(async (tema: string) => {
    setTitulosPhase('generating')
    try {
      const result = await generateTitulos(tema)
      setTitulosOptions(result.titulos)
      setTitulosPhase('result')
      toast({ title: 'Títulos SEO gerados e salvos!' })
    } catch (err: any) {
      setTitulosError(err?.message || 'Erro ao gerar títulos. Tente novamente.')
      setTitulosPhase('error')
    }
  }, [])

  const handleDescricaoGenerate = useCallback(async (tema: string) => {
    setDescricaoPhase('generating')
    try {
      const result = await generateDescricao(tema)
      setDescricaoText(result.description)
      setDescricaoPhase('result')
      toast({ title: 'Descrição gerada com sucesso!' })
    } catch (err: any) {
      setDescricaoError(err?.message || 'Erro ao gerar descrição. Tente novamente.')
      setDescricaoPhase('error')
    }
  }, [])

  const handleLegendaAtacadistaGenerate = useCallback(async (marca: string, produto: string) => {
    setLegendaAtacadistaPhase('generating')
    try {
      const result = await generateLegendaAtacadista(marca, produto)
      setLegendaAtacadistaCaption(result.caption)
      setLegendaAtacadistaHashtags(result.hashtags)
      setLegendaAtacadistaPhase('result')
      toast({ title: 'Legenda salva no Dashboard!' })
    } catch (err: any) {
      setLegendaAtacadistaError(err?.message || 'Erro ao gerar legenda atacadista')
      setLegendaAtacadistaPhase('error')
    }
  }, [])

  const handleMateriaGenerate = useCallback(async (tema: string) => {
    setMateriaPhase('generating')
    try {
      const result = await generateMateria(tema)
      setMateriaContent(result.content)
      setMateriaArticle(result.article)
      setMateriaPhase('result')
      toast({ title: 'Matéria salva com sucesso!' })
    } catch (err: any) {
      setMateriaError(err?.message || 'Erro ao gerar matéria. Tente novamente.')
      setMateriaPhase('error')
    }
  }, [])

  const handleWeeklyPlanGenerate = useCallback(
    async (dataInicio: string, dataFim: string, tema1: string, tema2: string, tema3: string) => {
      setWeeklyPlanPhase('generating')
      try {
        const result = await generateWeeklyPlan(dataInicio, dataFim, tema1, tema2, tema3)
        setWeeklyPlanResult(result)
        setWeeklyPlanPhase('result')
        toast({ title: 'Plano semanal gerado e salvo!' })
      } catch (err: any) {
        console.error('Weekly plan generation error:', err)
        setWeeklyPlanError(err?.message || 'Erro ao gerar plano. Tente novamente.')
        setWeeklyPlanPhase('error')
      }
    },
    [],
  )

  const parseWeeklyPlanArgs = useCallback(
    (args: string): { dataInicio: string; dataFim: string; temas: string[] } | null => {
      const parts = args.split(' - ')
      if (parts.length < 5) return null
      const dataInicio = parts[0].trim()
      const dataFim = parts[1].trim()
      const temas = parts.slice(2).map((p) => p.trim())
      if (!dataInicio || !dataFim || temas.length < 3 || temas.some((t) => !t)) return null
      return { dataInicio, dataFim, temas }
    },
    [],
  )

  const loadLibrary = useCallback(async () => {
    try {
      const prompts = await getAllPrompts()
      setLibraryPrompts(prompts)
    } catch {
      /* fallback to static */
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    loadLibrary()
  }, [loadLibrary])
  useRealtime('prompt_library', () => {
    loadLibrary()
  })

  const trimmedLower = input.trim().toLowerCase()
  const isLegendaCmd =
    (trimmedLower.startsWith('/legenda') && !trimmedLower.startsWith('/legenda-atacadista')) ||
    trimmedLower.startsWith('/c ') ||
    trimmedLower === '/c'
  const legendaThemeArg = isLegendaCmd
    ? trimmedLower.startsWith('/legenda')
      ? input.trim().slice('/legenda'.length).trim()
      : input.trim().slice('/c'.length).trim()
    : ''
  const isReelCmd =
    trimmedLower.startsWith('/reel') || trimmedLower.startsWith('/r ') || trimmedLower === '/r'
  const reelSubjectArg = isReelCmd
    ? trimmedLower.startsWith('/reel')
      ? input.trim().slice(5).trim()
      : input.trim().slice(2).trim()
    : ''
  const isTitulosCmd =
    trimmedLower.startsWith('/titulos') ||
    trimmedLower.startsWith('/seo ') ||
    trimmedLower === '/seo'
  const titulosTemaArg = isTitulosCmd
    ? trimmedLower.startsWith('/titulos')
      ? input.trim().slice('/titulos'.length).trim()
      : input.trim().slice('/seo'.length).trim()
    : ''
  const isDescricaoCmd =
    trimmedLower.startsWith('/descricao') ||
    trimmedLower.startsWith('/yt ') ||
    trimmedLower === '/yt'
  const descricaoTemaArg = isDescricaoCmd
    ? trimmedLower.startsWith('/descricao')
      ? input.trim().slice('/descricao'.length).trim()
      : input.trim().slice('/yt'.length).trim()
    : ''

  const isLegendaAtacadistaCmd =
    trimmedLower.startsWith('/legenda-atacadista') ||
    trimmedLower.startsWith('/atacado ') ||
    trimmedLower === '/atacado'
  const legendaAtacadistaArgs = isLegendaAtacadistaCmd
    ? trimmedLower.startsWith('/legenda-atacadista')
      ? input.trim().slice('/legenda-atacadista'.length).trim()
      : input.trim().slice('/atacado'.length).trim()
    : ''
  const isMateriaCmd =
    trimmedLower.startsWith('/materia ') ||
    trimmedLower === '/materia' ||
    trimmedLower.startsWith('/artigo ') ||
    trimmedLower === '/artigo'
  const materiaTemaArg = isMateriaCmd
    ? trimmedLower.startsWith('/materia')
      ? input.trim().slice('/materia'.length).trim()
      : input.trim().slice('/artigo'.length).trim()
    : ''
  const isWeeklyPlanCmd =
    trimmedLower.startsWith('/plano ') ||
    trimmedLower === '/plano' ||
    trimmedLower.startsWith('/semana ') ||
    trimmedLower === '/semana'
  const weeklyPlanArgs = isWeeklyPlanCmd
    ? trimmedLower.startsWith('/plano')
      ? input.trim().slice('/plano'.length).trim()
      : input.trim().slice('/semana'.length).trim()
    : ''
  const weeklyPlanParsed = isWeeklyPlanCmd ? parseWeeklyPlanArgs(weeklyPlanArgs) : null

  useEffect(() => {
    if (!isLegendaCmd && legendaPhase !== 'generating') setLegendaPhase('idle')
  }, [isLegendaCmd, legendaPhase])

  useEffect(() => {
    if (!isReelCmd && reelPhase !== 'generating') setReelPhase('idle')
  }, [isReelCmd, reelPhase])

  useEffect(() => {
    if (!isTitulosCmd && titulosPhase !== 'generating') setTitulosPhase('idle')
  }, [isTitulosCmd, titulosPhase])

  useEffect(() => {
    if (!isDescricaoCmd && descricaoPhase !== 'generating') setDescricaoPhase('idle')
  }, [isDescricaoCmd, descricaoPhase])

  useEffect(() => {
    if (!isLegendaAtacadistaCmd && legendaAtacadistaPhase !== 'generating')
      setLegendaAtacadistaPhase('idle')
  }, [isLegendaAtacadistaCmd, legendaAtacadistaPhase])

  useEffect(() => {
    if (!isMateriaCmd && materiaPhase !== 'generating') setMateriaPhase('idle')
  }, [isMateriaCmd, materiaPhase])

  useEffect(() => {
    if (!isWeeklyPlanCmd && weeklyPlanPhase !== 'generating') setWeeklyPlanPhase('idle')
  }, [isWeeklyPlanCmd, weeklyPlanPhase])

  const items = useMemo<CommandItem[]>(() => {
    if (isReelCmd && reelPhase === 'idle') {
      if (reelSubjectArg) {
        return [
          {
            id: 'reel-run',
            primary: `/reel ${reelSubjectArg}`,
            secondary: 'Gerar roteiro para Instagram Reel',
            icon: 'sparkles' as const,
            level: 'S' as const,
            action: () => handleReelGenerate(reelSubjectArg),
          },
        ]
      }
      return [
        {
          id: 'reel-need-subject',
          primary: '/reel',
          secondary: 'Qual o tema do Reel?',
          icon: 'terminal' as const,
          level: null,
          action: () => {
            toast({
              description: 'Informe o tema do Reel (ex: /reel tendências de maquiagem 2026)',
            })
            setReelPhase('need-subject')
          },
        },
      ]
    }
    if (isLegendaCmd && legendaPhase === 'idle') {
      if (legendaThemeArg) {
        return [
          {
            id: 'legenda-run',
            primary: `/legenda ${legendaThemeArg}`,
            secondary: 'Gerar legenda para Instagram',
            icon: 'sparkles' as const,
            level: 'S' as const,
            action: () => handleLegendaGenerate(legendaThemeArg),
          },
        ]
      }
      return [
        {
          id: 'legenda-need-theme',
          primary: '/legenda',
          secondary: 'Qual o tema do post?',
          icon: 'terminal' as const,
          level: null,
          action: () => setLegendaPhase('need-theme'),
        },
      ]
    }
    if (isDescricaoCmd && descricaoPhase === 'idle') {
      if (descricaoTemaArg) {
        return [
          {
            id: 'descricao-run',
            primary: `/descricao ${descricaoTemaArg}`,
            secondary: 'Gerar descrição SEO para YouTube',
            icon: 'sparkles' as const,
            level: 'S' as const,
            action: () => handleDescricaoGenerate(descricaoTemaArg),
          },
        ]
      }
      return [
        {
          id: 'descricao-need-tema',
          primary: '/descricao',
          secondary: 'Qual o título do vídeo?',
          icon: 'terminal' as const,
          level: null,
          action: () => {
            toast({
              description:
                'Por favor, informe o título do vídeo (ex: /descricao Tendências de moda inverno 2026)',
            })
            setDescricaoPhase('need-tema')
          },
        },
      ]
    }
    if (isTitulosCmd && titulosPhase === 'idle') {
      if (titulosTemaArg) {
        return [
          {
            id: 'titulos-run',
            primary: `/titulos ${titulosTemaArg}`,
            secondary: 'Gerar 5 títulos SEO para matéria',
            icon: 'sparkles' as const,
            level: 'S' as const,
            action: () => handleTitulosGenerate(titulosTemaArg),
          },
        ]
      }
      return [
        {
          id: 'titulos-need-tema',
          primary: '/titulos',
          secondary: 'Qual o tema da matéria?',
          icon: 'terminal' as const,
          level: null,
          action: () => {
            toast({
              description:
                'Por favor, informe o tema da matéria (ex: /titulos tendências de moda outono)',
            })
            setTitulosPhase('need-tema')
          },
        },
      ]
    }
    if (isLegendaAtacadistaCmd && legendaAtacadistaPhase === 'idle') {
      if (legendaAtacadistaArgs) {
        const sepIndex = legendaAtacadistaArgs.indexOf(' - ')
        if (sepIndex === -1) {
          return [
            {
              id: 'atacado-need-sep',
              primary: `/${trimmedLower.startsWith('/legenda-atacadista') ? 'legenda-atacadista' : 'atacado'} ${legendaAtacadistaArgs}`,
              secondary: 'Use o formato: MARCA - PRODUTO (ex: Dona Fifi - vestidos)',
              icon: 'alert' as const,
              level: null,
              disabled: true,
              action: () => {
                toast({
                  description:
                    'Use o formato: /atacado MARCA - PRODUTO (ex: /atacado Dona Fifi - vestidos)',
                })
              },
            },
          ]
        }
        const marca = legendaAtacadistaArgs.slice(0, sepIndex).trim()
        const produto = legendaAtacadistaArgs.slice(sepIndex + 3).trim()
        return [
          {
            id: 'atacado-run',
            primary: `/${trimmedLower.startsWith('/legenda-atacadista') ? 'legenda-atacadista' : 'atacado'} ${marca} - ${produto}`,
            secondary: 'Gerar legenda atacadista para Instagram',
            icon: 'sparkles' as const,
            level: 'S' as const,
            action: () => handleLegendaAtacadistaGenerate(marca, produto),
          },
        ]
      }
      return [
        {
          id: 'atacado-need-args',
          primary: trimmedLower.startsWith('/legenda-atacadista')
            ? '/legenda-atacadista'
            : '/atacado',
          secondary: 'Digite: MARCA - PRODUTO (ex: Dona Fifi - vestidos)',
          icon: 'terminal' as const,
          level: null,
          action: () => setLegendaAtacadistaPhase('need-input'),
        },
      ]
    }
    if (isMateriaCmd && materiaPhase === 'idle') {
      if (materiaTemaArg) {
        return [
          {
            id: 'materia-run',
            primary: `/${trimmedLower.startsWith('/materia') ? 'materia' : 'artigo'} ${materiaTemaArg}`,
            secondary: 'Gerar matéria jornalística completa',
            icon: 'sparkles' as const,
            level: 'S' as const,
            action: () => handleMateriaGenerate(materiaTemaArg),
          },
        ]
      }
      return [
        {
          id: 'materia-need-tema',
          primary: trimmedLower.startsWith('/materia') ? '/materia' : '/artigo',
          secondary: 'Qual o tema da matéria?',
          icon: 'terminal' as const,
          level: null,
          action: () => {
            toast({
              description: 'Informe o tema da matéria (ex: /materia tendências de moda verão 2026)',
            })
            setMateriaPhase('need-tema')
          },
        },
      ]
    }
    if (isWeeklyPlanCmd && weeklyPlanPhase === 'idle') {
      if (weeklyPlanParsed) {
        const cmdLabel = trimmedLower.startsWith('/plano') ? 'plano' : 'semana'
        return [
          {
            id: 'weekly-plan-run',
            primary: `/${cmdLabel} ${weeklyPlanArgs}`,
            secondary: 'Gerar plano de conteúdo semanal',
            icon: 'sparkles' as const,
            level: 'S' as const,
            action: () =>
              handleWeeklyPlanGenerate(
                weeklyPlanParsed.dataInicio,
                weeklyPlanParsed.dataFim,
                weeklyPlanParsed.temas[0],
                weeklyPlanParsed.temas[1],
                weeklyPlanParsed.temas[2],
              ),
          },
        ]
      }
      return [
        {
          id: 'weekly-plan-need-input',
          primary: trimmedLower.startsWith('/plano') ? '/plano' : '/semana',
          secondary: 'Formato: /plano DATA_INÍCIO - DATA_FIM - TEMA1 - TEMA2 - TEMA3',
          icon: 'terminal' as const,
          level: null,
          action: () => setWeeklyPlanPhase('need-input'),
        },
      ]
    }
    return buildItems(input, navigate, closeBar, location.pathname, libraryPrompts)
  }, [
    input,
    navigate,
    closeBar,
    location.pathname,
    libraryPrompts,
    isLegendaCmd,
    legendaPhase,
    legendaThemeArg,
    handleLegendaGenerate,
    isReelCmd,
    reelPhase,
    reelSubjectArg,
    handleReelGenerate,
    isTitulosCmd,
    titulosPhase,
    titulosTemaArg,
    handleTitulosGenerate,
    isDescricaoCmd,
    descricaoPhase,
    descricaoTemaArg,
    handleDescricaoGenerate,
    isLegendaAtacadistaCmd,
    legendaAtacadistaPhase,
    legendaAtacadistaArgs,
    handleLegendaAtacadistaGenerate,
    isMateriaCmd,
    materiaPhase,
    materiaTemaArg,
    handleMateriaGenerate,
    isWeeklyPlanCmd,
    weeklyPlanPhase,
    weeklyPlanArgs,
    weeklyPlanParsed,
    handleWeeklyPlanGenerate,
    parseWeeklyPlanArgs,
  ])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      legendaPhase !== 'idle' ||
      reelPhase !== 'idle' ||
      titulosPhase !== 'idle' ||
      descricaoPhase !== 'idle' ||
      legendaAtacadistaPhase !== 'idle' ||
      materiaPhase !== 'idle' ||
      weeklyPlanPhase !== 'idle'
    )
      return
    if (
      e.key === 'Enter' &&
      items.length > 0 &&
      items[selectedIndex] &&
      !items[selectedIndex].disabled
    ) {
      items[selectedIndex].action()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Comandos</span>
        <kbd className="hidden md:inline text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) closeBar()
          setOpen(o)
        }}
      >
        <DialogContent className="max-w-lg p-0 gap-0" showCloseButton={false}>
          <div className="flex items-center border-b px-4 py-3">
            <Terminal className="w-4 h-4 text-orange-500 mr-2 shrink-0" />
            <Input
              autoFocus
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setSelectedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Digite um comando (ex: /b tarefa, /a análise, /m objetivo, /super, /modulo 5, /legenda tema, /c tema, /s assunto, /stories tema, /reel tema, /r tema, /titulos tema, /seo tema, /descricao título, /yt título, /atacado MARCA - PRODUTO, /materia tema, /artigo tema, /plano DATA - DATA - TEMA1 - TEMA2 - TEMA3, /semana DATA - DATA - TEMA1 - TEMA2 - TEMA3)"
              className="border-none focus-visible:ring-0"
            />
          </div>
          {weeklyPlanPhase !== 'idle' ? (
            <WeeklyPlanPanel
              phase={weeklyPlanPhase}
              result={weeklyPlanResult}
              error={weeklyPlanError}
              onGenerate={handleWeeklyPlanGenerate}
              onNewSearch={() => {
                setWeeklyPlanPhase('idle')
                setInput('')
              }}
              onClose={closeBar}
            />
          ) : materiaPhase !== 'idle' ? (
            <MateriaPanel
              phase={materiaPhase}
              content={materiaContent}
              article={materiaArticle}
              error={materiaError}
              onGenerate={handleMateriaGenerate}
              onNewSearch={() => {
                setMateriaPhase('idle')
                setInput('')
              }}
              onClose={closeBar}
            />
          ) : legendaAtacadistaPhase !== 'idle' ? (
            <LegendaAtacadistaPanel
              phase={legendaAtacadistaPhase}
              caption={legendaAtacadistaCaption}
              hashtags={legendaAtacadistaHashtags}
              error={legendaAtacadistaError}
              onGenerate={handleLegendaAtacadistaGenerate}
              onNewSearch={() => {
                setLegendaAtacadistaPhase('idle')
                setInput('')
              }}
              onClose={closeBar}
            />
          ) : descricaoPhase !== 'idle' ? (
            <DescricaoPanel
              phase={descricaoPhase}
              description={descricaoText}
              error={descricaoError}
              onGenerate={handleDescricaoGenerate}
              onNewSearch={() => {
                setDescricaoPhase('idle')
                setInput('')
              }}
            />
          ) : titulosPhase !== 'idle' ? (
            <TitulosPanel
              phase={titulosPhase}
              titulos={titulosOptions}
              error={titulosError}
              onGenerate={handleTitulosGenerate}
              onNewSearch={() => {
                setTitulosPhase('idle')
                setInput('')
              }}
            />
          ) : reelPhase !== 'idle' ? (
            <ReelPanel
              phase={reelPhase}
              options={reelOptions}
              error={reelError}
              onGenerate={handleReelGenerate}
              onNewSearch={() => {
                setReelPhase('idle')
                setInput('')
              }}
            />
          ) : legendaPhase !== 'idle' ? (
            <LegendaPanel
              phase={legendaPhase}
              caption={legendaCaption}
              error={legendaError}
              onGenerate={handleLegendaGenerate}
              onNewSearch={() => {
                setLegendaPhase('idle')
                setInput('')
              }}
            />
          ) : (
            <div className="p-2 max-h-64 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-center text-gray-400 py-4 text-sm">Nenhum comando encontrado</p>
              ) : (
                items.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(i)}
                    disabled={item.disabled}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                      i === selectedIndex ? 'bg-orange-50' : 'hover:bg-gray-50'
                    } ${item.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {renderIcon(item.icon)}
                      <div className="flex items-center gap-2">
                        {item.level && LEVEL_BADGES[item.level] && (
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${LEVEL_BADGES[item.level].className}`}
                          >
                            {LEVEL_BADGES[item.level].label}
                          </span>
                        )}
                        <span className="font-mono text-sm font-medium">{item.primary}</span>
                        <span className="text-xs text-gray-400">{item.secondary}</span>
                      </div>
                    </div>
                    {!item.disabled && i === selectedIndex && (
                      <CornerDownLeft className="w-3 h-3 text-gray-400 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
