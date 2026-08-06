import pb from '@/lib/pocketbase/client'

export interface SimulationRow {
  type: 'comment' | 'dm'
  ig_username: string
  message_text: string
  intent: string
  response_text: string
  status: string
  forwarded_to: string
  media_id: string
  comment_id: string
  conversation_id: string
  lead_created: boolean
}

export interface SimulationStats {
  total: number
  comments: number
  dms: number
  leads: number
  responded: number
  forwarded: number
  response_rate: number
  avg_response_time: number
  intent_distribution: Record<string, number>
}

export interface SimulationResult {
  results: SimulationRow[]
  stats: SimulationStats
}

export interface ConfigStatus {
  is_configured: boolean
  is_validated: boolean
  mode: 'simulado' | 'ativo'
  account_name: string
  account_id: string
}

export interface ConfigSaveData {
  access_token: string
  app_secret: string
  page_id: string
  ig_user_id: string
}

export interface TestConnectionResult {
  success: boolean
  account_name?: string
  account_id?: string
  followers_count?: number
  media_count?: number
  error?: string
}

export const runSimulation = (): Promise<SimulationResult> =>
  pb.send('/backend/v1/social-engagement/simulate', { method: 'POST' })

export const saveConfig = (data: ConfigSaveData): Promise<{ success: boolean; message: string }> =>
  pb.send('/backend/v1/social-engagement/config', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const testConnection = (): Promise<TestConnectionResult> =>
  pb.send('/backend/v1/social-engagement/config/test', { method: 'POST' })

export const getConfigStatus = (): Promise<ConfigStatus> =>
  pb.send('/backend/v1/social-engagement/config/status', { method: 'GET' })

export const getSimulationLogs = () =>
  pb.collection('engagement_log').getFullList({
    filter: "comment_id ~ 'sim_v1' || conversation_id ~ 'sim_v1'",
    sort: '-created',
  })

export const getSimulationLeads = () =>
  pb.collection('dm_leads').getFullList({
    filter: "conversation_id ~ 'sim_v1'",
    sort: '-created',
  })

export const getAllLeads = () => pb.collection('dm_leads').getFullList({ sort: '-created' })

export const getAllLogs = () =>
  pb.collection('engagement_log').getFullList({ sort: '-created', perPage: 200 })
