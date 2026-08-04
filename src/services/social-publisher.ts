import pb from '@/lib/pocketbase/client'

export interface ScheduleRequest {
  postIds: string[]
  platform: string
  scheduledAt?: string
}

export interface ScheduleResponse {
  success: boolean
  scheduled: Array<{ id: string; scheduled_at: string; platform: string }>
  recommended_time?: string
  rationale?: string
  error?: string
}

export interface PublishRequest {
  postId: string
  platform?: string
}

export interface PublishResponse {
  success: boolean
  published?: { id: string; published_at: string; platform: string; attempts: number }
  error?: string
}

export async function schedulePosts(data: ScheduleRequest): Promise<ScheduleResponse> {
  const body: Record<string, unknown> = {
    postIds: data.postIds,
    platform: data.platform,
  }
  if (data.scheduledAt) {
    body.scheduledAt = new Date(data.scheduledAt).toISOString()
  }
  return pb.send('/backend/v1/agendar', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function publishPost(data: PublishRequest): Promise<PublishResponse> {
  return pb.send('/backend/v1/publicar', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
}

export interface StatusConfig {
  label: string
  color: string
  badgeClass: string
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  published: {
    label: 'Publicado',
    color: 'text-green-600',
    badgeClass: 'bg-green-100 text-green-700',
  },
  scheduled: { label: 'Agendado', color: 'text-blue-600', badgeClass: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Pendente', color: 'text-gray-500', badgeClass: 'bg-gray-100 text-gray-600' },
  failed: { label: 'Falhou', color: 'text-red-500', badgeClass: 'bg-red-100 text-red-700' },
}

export const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
]
