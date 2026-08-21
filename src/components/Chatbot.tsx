import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou a Editora Virtual da Revista Moda Atual. Como posso ajudar você hoje com tendências, eventos de moda ou conexão com marcas atacadistas?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await pb.send('/backend/v1/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: history }),
      })

      if (res?.message?.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: res.message.role || 'assistant',
            content: res.message.content,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Como posso te auxiliar com as coleções e novidades do atacado de moda?',
          },
        ])
      }
    } catch (err) {
      console.error('Chatbot error:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'A Revista Moda Atual traz os principais lançamentos e matérias de moda. Conheça nossas edições digitais e desfiles na página de Eventos!',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const quickPrompts = [
    'Quais as cores em alta no atacado?',
    'Como anunciar na Revista Moda Atual?',
    'Quais são os próximos eventos de moda?',
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-white/15 backdrop-blur-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif font-bold text-base flex items-center gap-1.5 leading-none">
                  Editora de Moda IA
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                </span>
                <p className="text-[11px] text-orange-100/90 mt-1">
                  Revista Moda Atual • Atendimento Inteligente
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages Feed */}
          <div
            className="flex-1 p-4 overflow-y-auto bg-muted/20 space-y-3.5 text-sm"
            ref={scrollRef}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-orange-600 text-white ml-auto rounded-br-xs font-normal'
                    : 'bg-card border border-border/70 text-foreground mr-auto rounded-bl-xs',
                )}
              >
                {m.content}
              </div>
            ))}

            {isLoading && (
              <div className="bg-card border border-border/70 text-foreground max-w-[85%] p-3.5 rounded-2xl rounded-bl-xs text-sm mr-auto animate-pulse flex items-center gap-2.5 shadow-xs">
                <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                <span className="text-muted-foreground text-xs font-medium">
                  Digitando resposta...
                </span>
              </div>
            )}
          </div>

          {/* Suggested Quick Prompts if few messages */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-3 py-2 bg-muted/10 border-t border-border/40 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(prompt)
                  }}
                  className="text-[11px] bg-background hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-border/60 text-muted-foreground rounded-full px-2.5 py-1 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 border-t bg-card shrink-0 flex items-center gap-2">
            <Input
              placeholder="Digite sua dúvida sobre moda ou a revista..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 h-10 text-sm bg-background/80"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="h-10 w-10 shrink-0 bg-orange-600 hover:bg-orange-500 text-white shadow-md transition-transform active:scale-95"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl bg-orange-600 hover:bg-orange-500 text-white transition-all duration-300 hover:scale-110 flex items-center justify-center relative group"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir assistente virtual"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white"></span>
          </span>
          {/* Tooltip on hover */}
          <div className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Fale com a Editora IA
          </div>
        </Button>
      )}
    </div>
  )
}
export default Chatbot
