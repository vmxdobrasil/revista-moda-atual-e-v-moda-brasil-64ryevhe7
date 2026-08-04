import { Button } from '@/components/ui/button'
import { Share2, MessageCircle, Send, Link2, Check } from 'lucide-react'
import { useState, useCallback } from 'react'

interface SocialShareProps {
  title: string
  url: string
}

export function SocialShare({ title, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    const fallbackCopy = () => {
      try {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // ignore
      }
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(fallbackCopy)
    } else {
      fallbackCopy()
    }
  }, [url])

  const encUrl = encodeURIComponent(url)
  const encTitle = encodeURIComponent(title)

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild className="rounded-full p-2">
        <a
          href={`https://wa.me/?text=${encTitle}%20${encUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="w-4 h-4" />
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild className="rounded-full p-2">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Share2 className="w-4 h-4" />
        </a>
      </Button>
      <Button variant="outline" size="sm" asChild className="rounded-full p-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${encTitle}&url=${encUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Send className="w-4 h-4" />
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-full p-2">
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </Button>
    </div>
  )
}
