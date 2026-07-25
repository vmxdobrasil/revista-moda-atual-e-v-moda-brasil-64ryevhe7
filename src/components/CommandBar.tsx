import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Terminal, CornerDownLeft, Hash, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { MODULES, getModuleByNumber } from '@/lib/commands/modules'
import { SUPER_PROMPTS } from '@/lib/commands/superPrompts'
import { setPendingPrompt } from '@/lib/commands/promptQueue'

const STATIC_COMMANDS = [
  { cmd: '/top60', label: 'Top 60 Marcas', path: '/admin/top60' },
  { cmd: '/vmodebrasil', label: 'Marketplace V MODA BRASIL', path: '/admin/vmodebrasil' },
  {
    cmd: '/vmodebrasil/orders',
    label: 'Pedidos do Marketplace',
    path: '/admin/vmodebrasil/orders',
  },
]

type ItemIcon = 'terminal' | 'hash' | 'sparkles' | 'alert'

interface CommandItem {
  id: string
  primary: string
  secondary: string
  icon: ItemIcon
  disabled?: boolean
  action: () => void
}

function buildModuleItems(navigate: (path: string) => void, closeBar: () => void): CommandItem[] {
  return MODULES.map((m) => ({
    id: `modulo-${m.number}`,
    primary: `/modulo ${m.number}`,
    secondary: m.label,
    icon: 'hash',
    action: () => {
      navigate(m.path)
      closeBar()
      toast({ title: `Navegando para Módulo ${m.number}`, description: m.label })
    },
  }))
}

function buildSuperItems(
  navigate: (path: string) => void,
  closeBar: () => void,
  currentPath: string,
): CommandItem[] {
  return SUPER_PROMPTS.map((s) => ({
    id: `super-${s.name}`,
    primary: `/super ${s.name}`,
    secondary: s.label,
    icon: 'sparkles',
    action: () => {
      setPendingPrompt(s.systemPrompt)
      if (currentPath !== '/admin/ai-persona/chat') {
        navigate('/admin/ai-persona/chat')
      }
      closeBar()
      toast({ title: `Super Prompt '${s.name}' ativado`, description: s.label })
    },
  }))
}

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

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

  const closeBar = () => {
    setOpen(false)
    setInput('')
    setSelectedIndex(0)
  }

  const items = useMemo<CommandItem[]>(() => {
    const trimmed = input.trim().toLowerCase()

    if (trimmed.startsWith('/modulo')) {
      const numPart = trimmed.replace('/modulo', '').trim()
      if (numPart === '' || !/^\d+$/.test(numPart)) {
        return buildModuleItems(navigate, closeBar)
      }
      const num = parseInt(numPart, 10)
      const mod = getModuleByNumber(num)
      if (mod) {
        return [
          {
            id: `modulo-${mod.number}`,
            primary: `/modulo ${mod.number}`,
            secondary: mod.label,
            icon: 'hash',
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
          id: 'modulo-error',
          primary: 'Módulo inválido',
          secondary: 'Use 1 a 7.',
          icon: 'alert',
          disabled: true,
          action: () => {},
        },
      ]
    }

    if (trimmed.startsWith('/super')) {
      const namePart = trimmed.replace('/super', '').trim()
      const matched = SUPER_PROMPTS.filter(
        (s) =>
          namePart === '' || s.name.includes(namePart) || s.label.toLowerCase().includes(namePart),
      )
      if (matched.length === 0) {
        return [
          {
            id: 'super-error',
            primary: 'Super prompt não encontrado',
            secondary: 'Use /super para listar disponíveis.',
            icon: 'alert',
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
      return buildSuperItems(navigate, closeBar, location.pathname)
    }

    return STATIC_COMMANDS.filter(
      (c) => c.cmd.includes(trimmed) || c.label.toLowerCase().includes(trimmed),
    ).map((c) => ({
      id: c.cmd,
      primary: c.cmd,
      secondary: c.label,
      icon: 'terminal' as ItemIcon,
      action: () => {
        navigate(c.path)
        closeBar()
      },
    }))
  }, [input, navigate, location.pathname])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && items.length > 0 && items[selectedIndex]) {
      const item = items[selectedIndex]
      if (!item.disabled) item.action()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    }
  }

  const renderIcon = (icon: ItemIcon) => {
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

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen(true)}>
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Comandos</span>
        <kbd className="hidden md:inline text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
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
              placeholder="Digite um comando (ex: /modulo 5, /super capa, /top60)"
              className="border-none focus-visible:ring-0"
            />
          </div>
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
                    <div>
                      <span className="font-mono text-sm font-medium">{item.primary}</span>
                      <span className="text-xs text-gray-400 ml-2">{item.secondary}</span>
                    </div>
                  </div>
                  {!item.disabled && i === selectedIndex && (
                    <CornerDownLeft className="w-3 h-3 text-gray-400 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
