import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getDmLeads, updateLeadStatus, type DmLead } from '@/services/social-engagement'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Users, Phone, Mail, MapPin } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const INTENT_LABELS: Record<string, string> = {
  produto: 'Produto',
  anuncio: 'Anúncio',
  consultoria: 'Consultoria',
  parceria: 'Parceria',
}

const STATUS_CONFIG: Record<string, string> = {
  novo: 'bg-blue-100 text-blue-700',
  contatado: 'bg-yellow-100 text-yellow-700',
  convertido: 'bg-green-100 text-green-700',
  arquivado: 'bg-gray-100 text-gray-500',
}

export function LeadsPanel() {
  const [leads, setLeads] = useState<DmLead[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await getDmLeads()
      setLeads(data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('dm_leads', () => loadData())

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateLeadStatus(id, status)
      toast.success('Status do lead atualizado!')
      loadData()
    } catch {
      toast.error('Erro ao atualizar status.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-800">Leads Comerciais ({leads.length})</h3>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            Nenhum lead capturado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {lead.name || lead.ig_username || 'Lead'}
                    </p>
                    <p className="text-xs text-gray-400">{lead.ig_username}</p>
                  </div>
                  <Badge className={STATUS_CONFIG[lead.status] || ''}>{lead.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <Badge variant="outline">{INTENT_LABELS[lead.intent] || lead.intent}</Badge>
                  {lead.whatsapp && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {lead.whatsapp}
                    </span>
                  )}
                  {lead.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {lead.email}
                    </span>
                  )}
                  {lead.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {lead.city}
                    </span>
                  )}
                </div>
                {lead.notes && <p className="text-sm text-gray-500">{lead.notes}</p>}
                <div className="flex gap-2 pt-1">
                  <Select onValueChange={(v) => handleStatusChange(lead.id, v)}>
                    <SelectTrigger className="h-8 text-xs w-[130px]">
                      <SelectValue placeholder="Mudar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="contatado">Contatado</SelectItem>
                      <SelectItem value="convertido">Convertido</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                  {lead.whatsapp && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() =>
                        window.open(`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`, '_blank')
                      }
                    >
                      WhatsApp
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
