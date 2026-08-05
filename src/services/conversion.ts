import pb from '@/lib/pocketbase/client'

export interface CtaSuggestion {
  cta_variant: string
  link_origin: string
  rationale: string
  expected_conversion_rate: number
}

export interface CtaResponse {
  content_id: string
  content_type: string
  data_context: {
    best_variant: string
    best_origin: string
    orders_by_origin: Record<string, number>
  }
  suggestions: CtaSuggestion[]
}

export interface FunilSummary {
  total_impressions: number
  total_clicks: number
  total_orders: number
  avg_conversion_rate: number
  click_through_rate: number
  order_conversion_rate: number
  metric_count: number
}

export interface FunilContentItem {
  content_id: string
  content_title: string
  content_type: string
  cta_variant: string
  link_origin: string
  period: string
  impressions: number
  clicks: number
  orders: number
  conversion_rate: number
}

export interface FunilBreakdown {
  impressions: number
  clicks: number
  orders: number
  avg_conversion_rate: number
  count: number
}

export interface FunilResponse {
  summary: FunilSummary
  top_10_content: FunilContentItem[]
  breakdowns: {
    by_link_origin: Record<string, FunilBreakdown>
    by_cta_variant: Record<string, FunilBreakdown>
    by_content_type: Record<string, FunilBreakdown>
    by_period: Record<string, FunilBreakdown>
  }
  hotspots: { total: number; totalClicks: number }
  orders: {
    total: number
    byOrigin: Record<string, number>
    byStatus: Record<string, number>
  }
  filters: {
    content_type: string | null
    link_origin: string | null
    cta_variant: string | null
    period: string | null
  }
}

export interface CtaParams {
  content_id: string
  content_type: string
  theme?: string
  link?: string
}

export interface FunilParams {
  content_type?: string
  link_origin?: string
  cta_variant?: string
  period?: string
}

export async function suggestCtas(params: CtaParams): Promise<CtaResponse> {
  return pb.send('/backend/v1/cta', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getFunilReport(params?: FunilParams): Promise<FunilResponse> {
  const query: string[] = []
  if (params?.content_type) query.push(`content_type=${encodeURIComponent(params.content_type)}`)
  if (params?.link_origin) query.push(`link_origin=${encodeURIComponent(params.link_origin)}`)
  if (params?.cta_variant) query.push(`cta_variant=${encodeURIComponent(params.cta_variant)}`)
  if (params?.period) query.push(`period=${encodeURIComponent(params.period)}`)
  const qs = query.length > 0 ? `?${query.join('&')}` : ''
  return pb.send(`/backend/v1/funil${qs}`, { method: 'GET' })
}
