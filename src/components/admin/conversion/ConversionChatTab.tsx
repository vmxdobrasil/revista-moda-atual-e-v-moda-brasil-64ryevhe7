import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { DisplayMessage } from '@/services/conversion'
import { streamConversionChat } from '@/services/conversion'

const SUGGESTED_PROMPTS = [
  'Quais conteúdos convertem mais para o marketplace?',
  'Qual variante de CTA tem melhor performance?',
  'Quais hotspots devo criar para aumentar conversões?',
  'Como melhorar o funil Revista → Marketplace?',
]

export function ConversionChatTab() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: DisplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      created: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const assistantId = Date.now().toString() + '-a'
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', created: new Date().toISOString() },
    ])

    try {
      const result = await streamConversionChat(text, conversationId, (_delta, full) => {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)))
      })
      setConversationId(result.conversationId)
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: 'Erro: ' + (err instanceof Error ? err.message : 'Falha na comunicação'),
              }
            : m,
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">
              Converse com o agente de conversão — pergunte sobre performance, CTAs e hotspots.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              {SUGGESTED_PROMPTS.map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  onClick={() => send(p)}
                  className="text-xs"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                m.role === 'user' ? 'bg-orange-500' : 'bg-gray-200'
              }`}
            >
              {m.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                m.role === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">
                {m.content || (loading && m.role === 'assistant' ? '...' : '')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4 flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          placeholder="Pergunte sobre conversões, CTAs, hotspots..."
          className="resize-none min-h-[44px] max-h-32"
          rows={1}
        />
        <Button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          size="icon"
          className="flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
