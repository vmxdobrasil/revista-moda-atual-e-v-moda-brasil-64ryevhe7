import { useState, useRef, useCallback, useEffect } from 'react'
import { streamEditorialQaChat } from '@/services/editorial-qa'
import { streamAgentChat } from '@/lib/skipAi'
import type { AgentCitation } from '@/lib/skipAi'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Send, Loader2, ShieldCheck } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: AgentCitation[]
}

function createId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function EditorialQaChat() {
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
        const res = await streamEditorialQaChat(text, conversationId, controller.signal)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-white">
      <div className="border-b px-4 py-3 bg-gray-50">
        <h3 className="font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-orange-500" /> Chat com Editorial QA
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Envie conteúdo para revisão ou pergunte sobre critérios editoriais
        </p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <ShieldCheck className="w-10 h-10 mb-3 text-orange-300" />
            <p className="text-sm max-w-xs">
              Cole um artigo, legenda ou roteiro para revisão. Ou faça uma pergunta sobre os
              critérios de qualidade da revista.
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
                  'max-w-[80%] rounded-lg px-3 py-2',
                  msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100',
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
      <form onSubmit={handleSubmit} className="border-t px-4 py-3 flex gap-2">
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
