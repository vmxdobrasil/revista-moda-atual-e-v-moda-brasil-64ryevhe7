import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { streamFashionAdvisorChat } from '@/services/fashion-advisor'
import { streamAgentChat, type AgentCitation } from '@/lib/skipAi'
import { consumePendingPrompt, subscribePendingPrompt } from '@/lib/commands/promptQueue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Send, Loader2, Sparkles } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: AgentCitation[]
}

function createId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function AiPersonaChat() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMsg: ChatMessage = { id: createId(), role: 'user', content: text }
      const assistantId = createId()
      setMessages((prev) => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }])
      setInput('')
      setIsLoading(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await streamFashionAdvisorChat(text, conversationId, controller.signal)
        const result = await streamAgentChat(res, {
          signal: controller.signal,
          onChunk: (_delta, full) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
            )
          },
          onCitations: (citations) => {
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, citations } : m)))
          },
        })
        setConversationId(result.conversation_id)
      } catch (err: unknown) {
        const errorObj = err as { name?: string; message?: string }
        if (errorObj?.name === 'AbortError') return
        const errorMsg = errorObj?.message || 'Falha ao comunicar com o Fashion Trend Advisor'
        toast({
          title: 'Erro ao gerar resposta',
          description: errorMsg,
          variant: 'destructive',
        })
        console.error('[AiPersonaChat] Agent error:', err)
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [conversationId, isLoading],
  )

  useEffect(() => {
    const pending = consumePendingPrompt()
    if (pending) sendMessage(pending)
  }, [sendMessage])

  useEffect(() => {
    return subscribePendingPrompt((prompt) => {
      if (prompt) {
        consumePendingPrompt()
        sendMessage(prompt)
      }
    })
  }, [sendMessage])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
        Faça login para usar o Fashion Trend Advisor.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          Fashion Trend Advisor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI persona especializada em análise de moda e tendências
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="w-12 h-12 text-orange-500 mb-4" />
            <p className="text-muted-foreground">
              Envie uma mensagem ou use <code className="text-orange-500">/b</code> na barra de
              comandos
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-4 py-2',
                  msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-muted',
                )}
              >
                {msg.content ? (
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {msg.citations?.map((c) => (
                  <p key={c.n} className="text-xs opacity-70 mt-1">
                    [{c.n}] {c.excerpt}
                  </p>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t px-6 py-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage(input)
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
