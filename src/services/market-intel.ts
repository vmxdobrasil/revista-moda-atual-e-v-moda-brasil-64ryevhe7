import pb from '@/lib/pocketbase/client'
import { getAlertas, getConcorrentesReport } from '@/services/market-watch'

export interface MarketIntelSignal {
  id: string
  title: string
  signal_type: string
  severity: string
  competitor_name: string
  description: string
}

export interface MarketIntelCompetitor {
  name: string
  platform: string
  engagement_rate: number
  followers: number
  post_frequency: number
}

export interface MarketIntelSummary {
  recent_signals: MarketIntelSignal[]
  top_competitors: MarketIntelCompetitor[]
}

export interface PerPlatformEntry {
  magazine: { platform: string; avg_engagement: number; total_posts: number; has_data: boolean }
  competitors: {
    platform: string
    competitors: Array<{
      name: string
      engagement_rate: number
      followers: number
      post_frequency: number
    }>
    avg_engagement: number
  }
}

export interface PerPlatformData {
  platforms: PerPlatformEntry[]
}

export async function getMarketIntelSummary(): Promise<MarketIntelSummary> {
  const [alertas, concorrentes] = await Promise.all([
    getAlertas({ limit: 5 }),
    getConcorrentesReport({ sort: '-engagement_rate', limit: 5 }),
  ])
  return {
    recent_signals: alertas.signals.map((s) => ({
      id: s.id,
      title: s.title,
      signal_type: s.signal_type,
      severity: s.severity,
      competitor_name: s.competitor_name,
      description: s.description,
    })),
    top_competitors: concorrentes.competitors.map((c) => ({
      name: c.name,
      platform: c.platform,
      engagement_rate: c.engagement_rate,
      followers: c.followers,
      post_frequency: c.post_frequency,
    })),
  }
}

export async function getPerPlatformBenchmarks(): Promise<PerPlatformData> {
  return pb.send('/backend/v1/market-watch/per-platform', { method: 'GET' })
}

export async function getMarketSignalsByTrend(
  query: string,
  limit = 10,
): Promise<{ signals: MarketIntelSignal[] }> {
  return pb.send('/backend/v1/market-signals/search', {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
    headers: { 'Content-Type': 'application/json' },
  })
}
