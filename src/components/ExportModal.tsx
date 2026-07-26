import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { StoryText } from '@/services/story-texts'
import {
  mapStoryTextsToExportRecords,
  exportToCSV,
  exportToPDF,
  generateFilename,
} from '@/lib/export-utils'

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  records: StoryText[]
}

export function ExportModal({ open, onOpenChange, records }: ExportModalProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [scheduledOnly, setScheduledOnly] = useState(false)

  const handleExport = async (format: 'csv' | 'pdf') => {
    let filtered = records
    if (scheduledOnly) {
      filtered = filtered.filter((r) => r.scheduled_date)
    }
    const exportRecords = mapStoryTextsToExportRecords(filtered)

    if (exportRecords.length === 0) {
      toast({
        title: 'Nenhum registro',
        description: 'Não há textos para exportar com os filtros atuais.',
        variant: 'destructive',
      })
      return
    }

    setIsExporting(true)
    await new Promise((r) => setTimeout(r, 100))

    try {
      const filename = generateFilename('textos_exportados', format)
      if (format === 'csv') {
        exportToCSV(exportRecords, filename)
      } else {
        exportToPDF(exportRecords, filename)
      }
      toast({
        title: 'Exportação concluída!',
        description: `${exportRecords.length} registro(s) exportado(s) como ${format.toUpperCase()}.`,
      })
      onOpenChange(false)
    } catch {
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao gerar o arquivo. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Textos</DialogTitle>
          <DialogDescription>
            Escolha o formato. {records.length} registro(s) disponível(is) com os filtros atuais.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="scheduled-only"
              checked={scheduledOnly}
              onCheckedChange={(checked) => setScheduledOnly(checked === true)}
            />
            <Label htmlFor="scheduled-only" className="text-sm cursor-pointer">
              Apenas agendados
            </Label>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            CSV
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
