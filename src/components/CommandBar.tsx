import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Terminal, CornerDownLeft } from 'lucide-react'

const COMMANDS = [
  { cmd: '/top60', label: 'Top 60 Marcas', path: '/admin/top60' },
  { cmd: '/vmodebrasil', label: 'Marketplace V MODA BRASIL', path: '/admin/vmodebrasil' },
  {
    cmd: '/vmodebrasil/orders',
    label: 'Pedidos do Marketplace',
    path: '/admin/vmodebrasil/orders',
  },
]

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

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

  const matched = COMMANDS.filter(
    (c) =>
      c.cmd.includes(input.trim().toLowerCase()) ||
      c.label.toLowerCase().includes(input.trim().toLowerCase()),
  )

  const handleSelect = (path: string) => {
    navigate(path)
    setOpen(false)
    setInput('')
    setSelectedIndex(0)
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && matched.length > 0) handleSelect(matched[selectedIndex].path)
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, matched.length - 1))
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
              placeholder="Digite um comando (ex: /top60)"
              className="border-none focus-visible:ring-0"
            />
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {matched.length === 0 ? (
              <p className="text-center text-gray-400 py-4 text-sm">Nenhum comando encontrado</p>
            ) : (
              matched.map((c, i) => (
                <button
                  key={c.cmd}
                  onClick={() => handleSelect(c.path)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${i === selectedIndex ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-orange-500" />
                    <div>
                      <span className="font-mono text-sm font-medium">{c.cmd}</span>
                      <span className="text-xs text-gray-400 ml-2">{c.label}</span>
                    </div>
                  </div>
                  {i === selectedIndex && <CornerDownLeft className="w-3 h-3 text-gray-400" />}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
