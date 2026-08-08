import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Smartphone } from 'lucide-react'
import { TemplateRenderer } from './TemplateRenderer'
import type { EditionPage } from '@/services/magazine'
import { FORMAT_CONFIG, ALL_FORMATS, type TemplateFormat } from './templates/format-context'

export function SocialFormatPreview({ page }: { page: EditionPage }) {
  const [open, setOpen] = useState(false)
  const [format, setFormat] = useState<TemplateFormat>('a4')
  const current = FORMAT_CONFIG[format]

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Smartphone className="w-4 h-4 mr-2" /> Formatos
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Pre-visualizacao por Formato</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 flex-wrap mb-3 flex-shrink-0">
            {ALL_FORMATS.map((f) => (
              <Button
                key={f}
                variant={format === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat(f)}
              >
                {FORMAT_CONFIG[f].label}
              </Button>
            ))}
          </div>
          <div className="flex justify-center bg-gray-100 rounded-lg p-4 overflow-auto flex-1">
            <div
              className="bg-white shadow-lg overflow-hidden"
              style={{ aspectRatio: current.aspect, width: '100%', maxWidth: current.maxW }}
            >
              <div className="w-full h-full">
                <TemplateRenderer page={page} format={format} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
