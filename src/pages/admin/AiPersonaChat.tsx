import { useState, useRef, useEffect, useCallback } from 'react'
import { streamAgentChat } from '@/lib/skipAi'
import { streamFashionAdvisorChat } from '@/services/fashion-advisor'
import { SimpleMarkdown } from '@/components/SimpleMarkdown'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sparkles, Send, Trash2, ChevronDown, Loader2, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created: string
}

const STORAGE_KEY = 'fashion-advisor-chat-messages'
const CONV_KEY = 'fashion-advisor-conversation-id'

const SUGGESTED_PROMPTS = [
  'Analyze my top 3 posts by engagement rate and summarize patterns.',
  'What content themes are most effective for growing followers?',
  'Compare the performance of my posts from last month vs this month.',
]

const NON_USE_GUIDELINES = [
  '🚫 This persona is NOT designed for personal wardrobe advice. Use a different assistant for that.',
  '🚫 Do not use this persona to create legal or financial recommendations.',
  '🚫 Do not use this persona to interact with external APIs or services.',
]

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function AiPersonaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(() =>
    localStorage.getItem(CONV_KEY),
  )
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])
  useEffect(() => {
    if (conversationId) localStorage.setItem(CONV_KEY, conversationId)
    else localStorage.removeItem(CONV_KEY)
  }, [conversationId])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim()
      if (!content || streaming) return
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        created: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setStreaming(true)
      setStreamingContent('')
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await streamFashionAdvisorChat(content, conversationId, controller.signal)
        const result = await streamAgentChat(res, {
          onChunk: (_delta, full) => setStreamingContent(full),
          signal: controller.signal,
        })
        setMessages((prev) => [
          ...prev,
          {
            id: result.message_id || crypto.randomUUID(),
            role: 'assistant',
            content: result.content,
            created: new Date().toISOString(),
          },
        ])
        const newConvId = res.headers.get('X-Conversation-Id') ?? result.conversation_id
        if (newConvId) setConversationId(newConvId)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Erro: ${err.message || 'Falha ao comunicar com o assistente.'}`,
              created: new Date().toISOString(),
            },
          ])
        }
      } finally {
        setStreaming(false)
        setStreamingContent('')
        abortRef.current = null
      }
    },
    [input, streaming, conversationId],
  )

  const handleClear = () => {
    setMessages([])
    setConversationId(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CONV_KEY)
  }

  const hasMessages = messages.length > 0

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" /> Fashion Trend Advisor
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Análise de tendências e marketing de moda</p>
        </div>
        {hasMessages && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-2 text-gray-500">
            <Trash2 className="w-4 h-4" /> Limpar
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {!hasMessages && !streaming && (
          <div className="space-y-2 pt-4">
            <p className="text-sm text-gray-400 mb-3">Sugestões de perguntas:</p>
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-sm text-gray-700"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-orange-500" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800',
              )}
            >
              {msg.role === 'assistant' ? <SimpleMarkdown content={msg.content} /> : msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
        ))}
        {streaming && (
          <div className="flex gap-3 justify-start">
            <div className="shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              {streamingContent ? (
                <Bot className="w-5 h-5 text-orange-500" />
              ) : (
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              )}
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-white border border-gray-200 text-gray-800">
              {streamingContent ? (
                <SimpleMarkdown content={streamingContent} />
              ) : (
                <span className="text-gray-400">Pensando...</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t pt-3 shrink-0">
        <Collapsible open={guidelinesOpen} onOpenChange={setGuidelinesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <ChevronDown
                className={cn('w-3 h-3 transition-transform', guidelinesOpen && 'rotate-180')}
              />
              Quando não usar esta persona
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pt-1">
            {NON_USE_GUIDELINES.map((g, i) => (
              <p key={i} className="text-xs text-gray-400">
                {g}
              </p>
            ))}
          </CollapsibleContent>
        </Collapsible>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Pergunte sobre tendências, performance de posts, recomendações..."
            rows={1}
            className="resize-none min-h-[44px] max-h-32"
          />
          <Button
            onClick={() => handleSend()}
            disabled={streaming || !input.trim()}
            className="bg-orange-500 hover:bg-orange-600 shrink-0 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
