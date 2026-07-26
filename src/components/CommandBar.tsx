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
import { generateReel } from '@/services/reel'
import { generateTitulos } from '@/services/titulos'
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
    trimmedLower.startsWith('/legenda') || trimmedLower.startsWith('/c ') || trimmedLower === '/c'
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

  useEffect(() => {
    if (!isLegendaCmd && legendaPhase !== 'generating') setLegendaPhase('idle')
  }, [isLegendaCmd, legendaPhase])

  useEffect(() => {
    if (!isReelCmd && reelPhase !== 'generating') setReelPhase('idle')
  }, [isReelCmd, reelPhase])

  useEffect(() => {
    if (!isTitulosCmd && titulosPhase !== 'generating') setTitulosPhase('idle')
  }, [isTitulosCmd, titulosPhase])

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
  ])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (legendaPhase !== 'idle' || reelPhase !== 'idle' || titulosPhase !== 'idle') return
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
              placeholder="Digite um comando (ex: /b tarefa, /a análise, /m objetivo, /super, /modulo 5, /legenda tema, /c tema, /s assunto, /stories tema, /reel tema, /r tema, /titulos tema, /seo tema)"
              className="border-none focus-visible:ring-0"
            />
          </div>
          {titulosPhase !== 'idle' ? (
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
