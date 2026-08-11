import pb from '@/lib/pocketbase/client'
import officialOrangeLogoUrl from '@/assets/editedimage1786408634881-d3703.png'

export interface SiteSettings {
  id: string
  logo_file: string
  created: string
  updated: string
  collectionId: string
  collectionName: string
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const records = await pb.collection('site_settings').getFullList({ sort: '-created' })
    return (records[0] as SiteSettings) || null
  } catch {
    return null
  }
}

export async function uploadLogo(file: File): Promise<SiteSettings> {
  const existing = await getSiteSettings()
  const formData = new FormData()
  formData.append('logo_file', file)
  if (existing) {
    return (await pb.collection('site_settings').update(existing.id, formData)) as SiteSettings
  }
  return (await pb.collection('site_settings').create(formData)) as SiteSettings
}

export async function removeLogo(): Promise<void> {
  const existing = await getSiteSettings()
  if (existing) {
    await pb.collection('site_settings').delete(existing.id)
  }
}

export function getLogoUrl(settings: SiteSettings | null): string {
  if (settings && settings.logo_file) {
    return pb.files.getURL(settings as any, settings.logo_file) as string
  }
  return officialOrangeLogoUrl
}
