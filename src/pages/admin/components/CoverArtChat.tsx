import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { streamCoverArtChat } from '@/services/cover-art-director'
import { streamAgentChat, type AgentCitation } from '@/lib/skipAi'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Send, Loader2, Palette } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: AgentCitation[]
}

function createId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function CoverArtChat() {
  const { isAuthenticated } = useAuth()
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
        const res = await streamCoverArtChat(text, conversationId, controller.signal)
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
        toast({
          title: 'Erro',
          description: errorObj?.message || 'Falha ao comunicar com o Art Director',
          variant: 'destructive',
        })
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [conversationId, isLoading],
  )

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Faça login para usar o Cover & Editorial Art Director.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Palette className="w-12 h-12 text-orange-500 mb-4" />
            <p className="text-muted-foreground">
              Converse com o Art Director sobre capas, layouts e thumbnails.
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
              </div>
            </div>
          ))
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage(input)
        }}
        className="border-t p-4 flex gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Descreva o briefing da capa..."
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
