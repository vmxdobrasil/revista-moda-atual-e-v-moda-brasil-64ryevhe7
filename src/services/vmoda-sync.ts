/**
 * Serviço de integração com o sistema externo V MODA BRASIL
 * Sincronização de marcas da base compartilhada de vendas e prospecção.
 *
 * Implementa:
 * - listBrands(filtros)
 * - updateBrand(id, dados)
 * - Cache / throttle respeitando a regra de no máximo 1 consulta por minuto
 * - Proxy seguro pelo backend PocketBase para não vazar token no navegador
 * - Fallback graceful com dados simulados/cache em caso de indisponibilidade da API externa
 */

import pb from '@/lib/pocketbase/client'

export interface VModaBrand {
  id: string
  nome: string
  categoria: string
  prioridade?: 'baixa' | 'media' | 'alta' | 'maxima' | string
  status: 'prospeccao' | 'contatada' | 'em_negociacao' | 'FECHADO' | 'perdido' | string
  pipeline_etapa:
    | 'mapeamento'
    | 'abordagem'
    | 'apresentacao'
    | 'negociacao'
    | 'fechamento'
    | 'pos_venda'
    | string
  contato?: string
  observacoes?: string
  projects?: string[] | string
  origem?: string
  upgrade_vmoda?: boolean
  adesao_top60?: boolean
  created?: string
  updated?: string
}

export interface VModaFilters {
  categoria?: string
  prioridade?: string
  status?: string
  pipeline_etapa?: string
  projects?: string
  limit?: number
  offset?: number
}

export interface VModaUpdatePayload {
  status?: string
  pipeline_etapa?: string
  contato?: string
  observacoes?: string
}

export interface VModaBrandsResponse {
  brands: VModaBrand[]
  total?: number
  from_cache?: boolean
  is_live_connected: boolean
  last_sync_at: string
  error_message?: string
}

// Armazenamento em memória local para respeito ao limite de polling (1 min)
let cachedResponse: VModaBrandsResponse | null = null
let lastFetchTime = 0
let lastFetchKey = ''

// Base mock de demonstração de fallback caso a API externa ainda esteja sendo provisionada ou retorne 404
const DEMO_FALLBACK_BRANDS: VModaBrand[] = [
  {
    id: 'vm-brand-001',
    nome: 'Colcci Premium',
    categoria: 'moda-feminina',
    prioridade: 'maxima',
    status: 'em_negociacao',
    pipeline_etapa: 'negociacao',
    contato: 'juliana.costa@colcci.com.br / (11) 98765-4321',
    observacoes: 'Interesse conjunto no TOP 60 da Revista e Stand físico na V MODA BRASIL SP.',
    projects: ['revista', 'vmoda_brasil'],
    adesao_top60: true,
    upgrade_vmoda: false,
    updated: new Date().toISOString(),
  },
  {
    id: 'vm-brand-002',
    nome: 'Lança Perfume Concept',
    categoria: 'moda-feminina',
    prioridade: 'maxima',
    status: 'contatada',
    pipeline_etapa: 'abordagem',
    contato: 'diretoria.comercial@lancaperfume.com.br',
    observacoes:
      'Primeiro contato realizado pelo time da Revista. Aguardando retorno da proposta editorial.',
    projects: ['revista'],
    adesao_top60: false,
    upgrade_vmoda: false,
    updated: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'vm-brand-003',
    nome: 'Reserva Osklen Jeans',
    categoria: 'moda-masculina',
    prioridade: 'alta',
    status: 'FECHADO',
    pipeline_etapa: 'fechamento',
    contato: 'marcos.santos@grupoarzz.com.br',
    observacoes:
      'Fechamento concluído. Ativada adesão TOP 60 e aberta Oferta Upgrade V MODA BRASIL.',
    projects: ['revista', 'vmoda_brasil'],
    adesao_top60: true,
    upgrade_vmoda: true,
    updated: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'vm-brand-004',
    nome: 'Animale Atelier',
    categoria: 'alta-costura',
    prioridade: 'maxima',
    status: 'prospeccao',
    pipeline_etapa: 'mapeamento',
    contato: 'comercial@animale.com.br',
    observacoes: 'Mapeada para capa da próxima edição e estande principal.',
    projects: ['revista', 'vmoda_brasil'],
    adesao_top60: false,
    upgrade_vmoda: false,
    updated: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'vm-brand-005',
    nome: 'Farm Rio Atacado',
    categoria: 'moda-feminina',
    prioridade: 'alta',
    status: 'FECHADO',
    pipeline_etapa: 'fechamento',
    contato: 'expansao@farmrio.com.br',
    observacoes: 'Participação confirmada na vitrine dupla. Adesão TOP 60 aprovada com sucesso.',
    projects: ['revista', 'vmoda_brasil'],
    adesao_top60: true,
    upgrade_vmoda: true,
    updated: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'vm-brand-006',
    nome: 'Track & Field Fitness',
    categoria: 'fitness-beachwear',
    prioridade: 'media',
    status: 'em_negociacao',
    pipeline_etapa: 'apresentacao',
    contato: 'parcerias@tf.com.br',
    observacoes: 'Apresentação de métricas da revista enviada por e-mail.',
    projects: ['revista'],
    adesao_top60: false,
    upgrade_vmoda: false,
    updated: new Date(Date.now() - 250000000).toISOString(),
  },
]

// Armazenamento em localStorage para persistir edições no modo fallback
const LOCAL_STORAGE_KEY = 'vmoda_brands_local_state'

function getLocalState(): VModaBrand[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    /* intentionally ignored */
  }
  return DEMO_FALLBACK_BRANDS
}

function saveLocalState(brands: VModaBrand[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brands))
  } catch {
    /* intentionally ignored */
  }
}

/**
 * Retorna se o throttle de 1 minuto está ativo
 */
export function getThrottleRemainingSeconds(): number {
  const elapsed = Date.now() - lastFetchTime
  if (elapsed >= 60000) return 0
  return Math.ceil((60000 - elapsed) / 1000)
}

/**
 * Consulta a lista de marcas do V MODA BRASIL
 * Respeita cache de 60 segundos por padrão, a menos que forceRefresh seja explicitamente solicitado
 * respeitando os limites da API externa.
 */
export async function listBrands(
  filters: VModaFilters = {},
  forceRefresh = false,
): Promise<VModaBrandsResponse> {
  const filterKey = JSON.stringify(filters)
  const now = Date.now()
  const timeSinceLast = now - lastFetchTime

  // Se já temos cache e ainda não deu 60s, reaproveitar se não for forçado
  if (!forceRefresh && cachedResponse && lastFetchKey === filterKey && timeSinceLast < 60000) {
    return {
      ...cachedResponse,
      from_cache: true,
    }
  }

  // Monta querystring para os filtros
  const query = new URLSearchParams()
  if (filters.categoria && filters.categoria !== 'todas') {
    query.set('categoria', filters.categoria)
  }
  if (filters.prioridade && filters.prioridade !== 'todas') {
    query.set('prioridade', filters.prioridade)
  }
  if (filters.status && filters.status !== 'todas') {
    query.set('status', filters.status)
  }
  if (filters.pipeline_etapa && filters.pipeline_etapa !== 'todas') {
    query.set('pipeline_etapa', filters.pipeline_etapa)
  }
  if (filters.projects && filters.projects !== 'todos') {
    query.set('projects', filters.projects)
  }
  if (filters.limit) {
    query.set('limit', String(filters.limit))
  }
  if (filters.offset !== undefined) {
    query.set('offset', String(filters.offset))
  }

  const queryString = query.toString() ? `?${query.toString()}` : ''

  try {
    // Chama o hook proxy interno do PocketBase (mantém o x-sync-token seguro no backend)
    const res = await pb.send<{
      success: boolean
      data?:
        | {
            brands?: VModaBrand[]
            items?: VModaBrand[]
            total?: number
          }
        | VModaBrand[]
      cached?: boolean
      error?: string
    }>(`/backend/v1/vmoda/brands${queryString}`, {
      method: 'GET',
    })

    let brandList: VModaBrand[] = []

    if (Array.isArray(res.data)) {
      brandList = res.data
    } else if (res.data && Array.isArray(res.data.brands)) {
      brandList = res.data.brands
    } else if (res.data && Array.isArray(res.data.items)) {
      brandList = res.data.items
    }

    const response: VModaBrandsResponse = {
      brands: brandList,
      total: brandList.length,
      from_cache: !!res.cached,
      is_live_connected: true,
      last_sync_at: new Date().toISOString(),
    }

    cachedResponse = response
    lastFetchTime = Date.now()
    lastFetchKey = filterKey

    return response
  } catch (err: any) {
    // Se o backend retornou 500, 502 ou erro de rede
    const errorMessage =
      err?.data?.error ||
      err?.message ||
      'Conexão com a API externa V MODA BRASIL em fallback local.'

    // Carrega dados locais persistidos filtrados
    let localBrands = getLocalState()

    if (filters.categoria && filters.categoria !== 'todas') {
      localBrands = localBrands.filter((b) => b.categoria === filters.categoria)
    }
    if (filters.prioridade && filters.prioridade !== 'todas') {
      localBrands = localBrands.filter((b) => b.prioridade === filters.prioridade)
    }
    if (filters.status && filters.status !== 'todas') {
      localBrands = localBrands.filter((b) => b.status === filters.status)
    }
    if (filters.pipeline_etapa && filters.pipeline_etapa !== 'todas') {
      localBrands = localBrands.filter((b) => b.pipeline_etapa === filters.pipeline_etapa)
    }
    if (filters.projects && filters.projects !== 'todos') {
      localBrands = localBrands.filter((b) => {
        if (Array.isArray(b.projects)) return b.projects.includes(filters.projects!)
        return b.projects === filters.projects
      })
    }

    const fallbackResponse: VModaBrandsResponse = {
      brands: localBrands,
      total: localBrands.length,
      from_cache: false,
      is_live_connected: false,
      last_sync_at: new Date().toISOString(),
      error_message: errorMessage,
    }

    cachedResponse = fallbackResponse
    lastFetchTime = Date.now()
    lastFetchKey = filterKey

    return fallbackResponse
  }
}

/**
 * Atualiza status e etapa de uma marca no V MODA BRASIL
 * Campos aceitos: status, pipeline_etapa, contato, observacoes
 * Campos rejeitados preventivamente: nome, categoria, prioridade, projects
 */
export async function updateBrand(
  id: string,
  data: VModaUpdatePayload,
): Promise<{ success: boolean; data?: any; error?: string }> {
  // Validação estrita no cliente para feedback imediato ao usuário
  const forbiddenFields = ['nome', 'categoria', 'prioridade', 'projects'] as const
  for (const field of forbiddenFields) {
    if ((data as any)[field] !== undefined) {
      throw new Error(
        `O campo "${field}" não pode ser alterado pela Revista Moda Atual. Ele só é editável no painel V MODA BRASIL.`,
      )
    }
  }

  try {
    const res = await pb.send<{ success: boolean; data?: any; message?: string; error?: string }>(
      `/backend/v1/vmoda/brands/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: data,
      },
    )

    // Se a chamada ao backend teve sucesso, invalida cache
    cachedResponse = null
    lastFetchTime = 0

    // Também atualiza o armazenamento local para consistência
    const local = getLocalState()
    const idx = local.findIndex((b) => b.id === id)
    if (idx !== -1) {
      const isFechado = data.pipeline_etapa === 'fechamento' || data.status === 'FECHADO'
      local[idx] = {
        ...local[idx],
        ...data,
        adesao_top60: isFechado ? true : local[idx].adesao_top60,
        upgrade_vmoda: isFechado ? true : local[idx].upgrade_vmoda,
        updated: new Date().toISOString(),
      }
      saveLocalState(local)
    }

    return {
      success: true,
      data: res.data || data,
    }
  } catch (err: any) {
    const errorMessage =
      err?.data?.error || err?.message || 'Falha ao atualizar marca no sistema V MODA BRASIL.'

    // Se for erro de validação (ex: 400 ou campo não permitido), relança
    if (err?.status === 400 || err?.status === 401) {
      throw new Error(errorMessage)
    }

    // Em caso de falha de conexão com a API externa (502 / offline), aplica na persistência local
    const local = getLocalState()
    const idx = local.findIndex((b) => b.id === id)
    if (idx !== -1) {
      const isFechado = data.pipeline_etapa === 'fechamento' || data.status === 'FECHADO'
      local[idx] = {
        ...local[idx],
        ...data,
        adesao_top60: isFechado ? true : local[idx].adesao_top60,
        upgrade_vmoda: isFechado ? true : local[idx].upgrade_vmoda,
        updated: new Date().toISOString(),
      }
      saveLocalState(local)

      cachedResponse = null
      lastFetchTime = 0

      return {
        success: true,
        data: local[idx],
        error: `Alteração salva localmente (API externa offline: ${errorMessage})`,
      }
    }

    throw new Error(errorMessage)
  }
}

/**
 * Ação rápida: Marca como abordagem realizada
 */
export async function quickSetAbordagem(id: string) {
  return updateBrand(id, {
    pipeline_etapa: 'abordagem',
    status: 'contatada',
  })
}

/**
 * Ação rápida: Fechamento de marca (adesão TOP 60 + Oferta Upgrade V MODA BRASIL)
 */
export async function quickSetFechamento(id: string) {
  return updateBrand(id, {
    pipeline_etapa: 'fechamento',
    status: 'FECHADO',
  })
}
