import { memo } from 'react'

interface SimpleMarkdownProps {
  content: string
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export const SimpleMarkdown = memo(function SimpleMarkdown({ content }: SimpleMarkdownProps) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let orderedList = false

  const flushList = (key: string) => {
    if (listItems.length === 0) return
    if (orderedList) {
      elements.push(
        <ol key={key} className="list-decimal pl-4 space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>,
      )
    } else {
      elements.push(
        <ul key={key} className="list-disc pl-4 space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      )
    }
    listItems = []
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('## ')) {
      flushList(`list-${idx}`)
      elements.push(
        <h3 key={idx} className="font-bold text-base mt-3 mb-1">
          {renderInline(trimmed.slice(3))}
        </h3>,
      )
    } else if (trimmed.startsWith('# ')) {
      flushList(`list-${idx}`)
      elements.push(
        <h2 key={idx} className="font-bold text-lg mt-3 mb-1">
          {renderInline(trimmed.slice(2))}
        </h2>,
      )
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!orderedList) {
        flushList(`list-${idx}`)
        orderedList = true
      }
      listItems.push(trimmed.replace(/^\d+\.\s/, ''))
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (orderedList) {
        flushList(`list-${idx}`)
        orderedList = false
      }
      listItems.push(trimmed.slice(2))
    } else if (trimmed === '') {
      flushList(`list-${idx}`)
    } else {
      flushList(`list-${idx}`)
      elements.push(
        <p key={idx} className="leading-relaxed">
          {renderInline(trimmed)}
        </p>,
      )
    }
  })
  flushList('list-final')

  return <div className="space-y-1.5">{elements}</div>
})
