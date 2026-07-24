import { useState, type ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface ContentSectionCardProps {
  title: string
  icon: ReactNode
  children: ReactNode
  copyText: string
}

export function ContentSectionCard({ title, icon, children, copyText }: ContentSectionCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={handleCopy} className="gap-1.5 shrink-0">
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
