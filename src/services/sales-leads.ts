/**
 * Serviço de gerenciamento de Leads de Vendas (`sales_leads`).
 * Base central compartilhada (Single Source of Truth) para o Agente de IA de Vendas
 * entre a Revista Moda Atual e o ecossistema V MODA BRASIL.
 */

import pb from '@/lib/pocketbase/client'

export type SalesLeadPriority = 'baixa' | 'media' | 'alta' | 'maxima'
export type SalesLeadStatus = 'novo' | 'abordado' | 'em_negociacao' | 'fechado' | 'perdido'

export interface ContactHistoryEntry {
  data: string
  canal: string
  resumo: string
  autor: string
}

export interface SalesLead {
  id: string
  marca: string
  categoria?: string
  porte?: string
  regiao?: string
  contato_nome?: string
  contato_email?: string
  contato_whatsapp?: string
  prioridade?: SalesLeadPriority
  status: SalesLeadStatus
  etapa_atual?: string
  canal?: string
  historico_contatos?: ContactHistoryEntry[]
  data_ultimo_contato?: string
  data_proximo_followup?: string
  id_top60?: string
  id_marketplace?: string
  created?: string
  updated?: string
}

export interface SalesLeadFilters {
  status?: string
  prioridade?: string
  categoria?: string
  etapa_atual?: string
  regiao?: string
  canal?: string
  data_proximo_followup?: string
  data_proximo_followup_from?: string
  data_proximo_followup_to?: string
  limit?: number
  offset?: number
  sort?: string
}

export interface SalesLeadCreateInput {
  marca: string
  categoria?: string
  porte?: string
  regiao?: string
  contato_nome?: string
  contato_email?: string
  contato_whatsapp?: string
  prioridade?: SalesLeadPriority
  status?: SalesLeadStatus
  etapa_atual?: string
  canal?: string
  historico_contatos?: ContactHistoryEntry[]
  data_ultimo_contato?: string
  data_proximo_followup?: string
  id_top60?: string
  id_marketplace?: string
}

export interface SalesLeadUpdateInput {
  status?: SalesLeadStatus
  etapa_atual?: string
  prioridade?: SalesLeadPriority
  canal?: string
  porte?: string
  regiao?: string
  contato_nome?: string
  contato_email?: string
  contato_whatsapp?: string
  data_ultimo_contato?: string
  data_proximo_followup?: string
  historico_contatos_add?: ContactHistoryEntry
}

/**
 * Mapeamento bidirecional de status entre Revista Moda Atual (sales_leads) e V MODA BRASIL (sales_brands):
 * - novo <-> novo (prospeccao)
 * - abordado <-> contatada
 * - em_negociacao <-> em_negociacao
 * - fechado <-> FECHADO
 * - perdido <-> perdido
 */
export const STATUS_MAPPING_REVISTA_TO_VMODA: Record<SalesLeadStatus, string> = {
  novo: 'novo',
  abordado: 'contatada',
  em_negociacao: 'em_negociacao',
  fechado: 'FECHADO',
  perdido: 'perdido',
}

export const STATUS_MAPPING_VMODA_TO_REVISTA: Record<string, SalesLeadStatus> = {
  novo: 'novo',
  prospeccao: 'novo',
  contatada: 'abordado',
  abordado: 'abordado',
  em_negociacao: 'em_negociacao',
  negociacao: 'em_negociacao',
  FECHADO: 'fechado',
  fechado: 'fechado',
  perdido: 'perdido',
}

/**
 * Consulta leads da base central sales_leads através do SDK autenticado ou rota sync
 */
export async function listSalesLeads(
  filters: SalesLeadFilters = {},
): Promise<{ items: SalesLead[]; total: number }> {
  try {
    const query = new URLSearchParams()
    if (filters.status && filters.status !== 'todas') query.set('status', filters.status)
    if (filters.prioridade && filters.prioridade !== 'todas')
      query.set('prioridade', filters.prioridade)
    if (filters.categoria && filters.categoria !== 'todas')
      query.set('categoria', filters.categoria)
    if (filters.etapa_atual && filters.etapa_atual !== 'todas')
      query.set('etapa_atual', filters.etapa_atual)
    if (filters.regiao && filters.regiao !== 'todas') query.set('regiao', filters.regiao)
    if (filters.canal && filters.canal !== 'todas') query.set('canal', filters.canal)
    if (filters.data_proximo_followup)
      query.set('data_proximo_followup', filters.data_proximo_followup)
    if (filters.data_proximo_followup_from)
      query.set('data_proximo_followup_from', filters.data_proximo_followup_from)
    if (filters.data_proximo_followup_to)
      query.set('data_proximo_followup_to', filters.data_proximo_followup_to)
    if (filters.limit) query.set('limit', String(filters.limit))
    if (filters.offset !== undefined) query.set('offset', String(filters.offset))
    if (filters.sort) query.set('sort', filters.sort)

    // Se temos usuário autenticado no app, podemos chamar via SDK direto na coleção sales_leads
    // como fallback se a rota sync exigir token externo
    const filterParts: string[] = []
    if (filters.status && filters.status !== 'todas')
      filterParts.push(`status = "${filters.status}"`)
    if (filters.prioridade && filters.prioridade !== 'todas')
      filterParts.push(`prioridade = "${filters.prioridade}"`)
    if (filters.categoria && filters.categoria !== 'todas')
      filterParts.push(`categoria = "${filters.categoria}"`)
    if (filters.etapa_atual && filters.etapa_atual !== 'todas')
      filterParts.push(`etapa_atual = "${filters.etapa_atual}"`)

    const res = await pb
      .collection('sales_leads')
      .getList<SalesLead>(
        (filters.offset ? Math.floor(filters.offset / (filters.limit || 50)) : 0) + 1,
        filters.limit || 50,
        {
          filter: filterParts.length > 0 ? filterParts.join(' && ') : '',
          sort: filters.sort || '-created',
          requestKey: null,
        },
      )

    return {
      items: res.items,
      total: res.totalItems,
    }
  } catch (err: any) {
    console.warn('listSalesLeads fallback error:', err?.message || err)
    return { items: [], total: 0 }
  }
}

/**
 * Upsert gracioso de um lead na base central sales_leads.
 * Se já existir lead com mesma marca + id_marketplace (ou marca + id_top60), atualiza os dados
 * ou cria novo registro sem gerar duplicidade.
 */
export async function upsertSalesLeadGraceful(data: SalesLeadCreateInput): Promise<{
  success: boolean
  lead?: SalesLead
  created?: boolean
  error?: string
}> {
  try {
    const marca = String(data.marca || '').trim()
    if (!marca) {
      return { success: false, error: 'Marca é obrigatória para upsert do lead' }
    }

    // Busca se já existe lead correspondente
    let existingLead: SalesLead | null = null

    try {
      if (data.id_marketplace) {
        const found = await pb.collection('sales_leads').getList<SalesLead>(1, 1, {
          filter: `marca = "${marca}" && id_marketplace = "${data.id_marketplace}"`,
          requestKey: null,
        })
        if (found.items.length > 0) existingLead = found.items[0]
      }

      if (!existingLead && data.id_top60) {
        const found = await pb.collection('sales_leads').getList<SalesLead>(1, 1, {
          filter: `marca = "${marca}" && id_top60 = "${data.id_top60}"`,
          requestKey: null,
        })
        if (found.items.length > 0) existingLead = found.items[0]
      }

      if (!existingLead && !data.id_marketplace && !data.id_top60) {
        const found = await pb.collection('sales_leads').getList<SalesLead>(1, 1, {
          filter: `marca = "${marca}"`,
          requestKey: null,
        })
        if (found.items.length > 0) existingLead = found.items[0]
      }
    } catch (checkErr) {
      console.warn('upsertSalesLeadGraceful check warning:', checkErr)
    }

    if (existingLead) {
      // Atualizar status e etapa do lead existente
      const patchData: Record<string, any> = {}
      if (data.status) patchData.status = data.status
      if (data.etapa_atual) patchData.etapa_atual = data.etapa_atual
      if (data.data_ultimo_contato) patchData.data_ultimo_contato = data.data_ultimo_contato
      if (data.data_proximo_followup) patchData.data_proximo_followup = data.data_proximo_followup
      if (data.canal) patchData.canal = data.canal
      if (data.contato_nome && !existingLead.contato_nome)
        patchData.contato_nome = data.contato_nome
      if (data.contato_email && !existingLead.contato_email)
        patchData.contato_email = data.contato_email
      if (data.contato_whatsapp && !existingLead.contato_whatsapp)
        patchData.contato_whatsapp = data.contato_whatsapp

      // Append no histórico se fornecido
      if (data.historico_contatos && data.historico_contatos.length > 0) {
        const currentHist = Array.isArray(existingLead.historico_contatos)
          ? existingLead.historico_contatos
          : []
        patchData.historico_contatos = [...currentHist, ...data.historico_contatos]
      }

      const updated = await pb
        .collection('sales_leads')
        .update<SalesLead>(existingLead.id, patchData)
      return {
        success: true,
        created: false,
        lead: updated,
      }
    }

    // Criar novo lead
    const created = await pb.collection('sales_leads').create<SalesLead>({
      marca: data.marca,
      categoria: data.categoria || '',
      porte: data.porte || '',
      regiao: data.regiao || '',
      contato_nome: data.contato_nome || '',
      contato_email: data.contato_email || '',
      contato_whatsapp: data.contato_whatsapp || '',
      prioridade: data.prioridade || 'media',
      status: data.status || 'novo',
      etapa_atual: data.etapa_atual || '',
      canal: data.canal || 'painel_vmoda',
      historico_contatos: data.historico_contatos || [],
      data_ultimo_contato: data.data_ultimo_contato || new Date().toISOString(),
      data_proximo_followup: data.data_proximo_followup || '',
      id_top60: data.id_top60 || '',
      id_marketplace: data.id_marketplace || '',
    })

    return {
      success: true,
      created: true,
      lead: created,
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Falha ao sincronizar lead de vendas'
    console.error('upsertSalesLeadGraceful failed (graceful):', msg)
    return {
      success: false,
      error: msg,
    }
  }
}
