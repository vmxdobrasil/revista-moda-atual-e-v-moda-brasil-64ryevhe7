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
  const navigate = useNavigate()
  const location = useLocation()

  const closeBar = useCallback(() => {
    setOpen(false)
    setInput('')
    setSelectedIndex(0)
    setLegendaPhase('idle')
    setLegendaCaption('')
    setLegendaError('')
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

  const isLegendaCmd = input.trim().toLowerCase().startsWith('/legenda')
  const legendaThemeArg = isLegendaCmd ? input.trim().slice('/legenda'.length).trim() : ''

  useEffect(() => {
    if (!isLegendaCmd && legendaPhase !== 'generating') setLegendaPhase('idle')
  }, [isLegendaCmd, legendaPhase])

  const items = useMemo<CommandItem[]>(() => {
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
  ])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (legendaPhase !== 'idle') return
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
              placeholder="Digite um comando (ex: /b tarefa, /a análise, /m objetivo, /super, /modulo 5, /legenda tema)"
              className="border-none focus-visible:ring-0"
            />
          </div>
          {legendaPhase !== 'idle' ? (
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
