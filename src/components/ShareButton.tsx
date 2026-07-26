import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Link2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShareButtonProps {
  textId: string
}

export function ShareButton({ textId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    const url = `${window.location.origin}/texto/${textId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast({ title: 'Link copiado!', description: 'Compartilhe o texto com seus contatos.' })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 h-7">
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Link2 className="w-3.5 h-3.5" />
      )}
      <span className="text-xs">{copied ? 'Copiado!' : 'Copiar link'}</span>
    </Button>
  )
}
