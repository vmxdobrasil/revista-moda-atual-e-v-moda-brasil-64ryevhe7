import pb from '@/lib/pocketbase/client'

export interface SiteSettings {
  id: string
  logo_file: string | null
  created: string
  updated: string
  collectionId: string
  collectionName: string
  logo_visual_params?: Record<string, any>
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const records = await pb.collection('site_settings').getFullList<SiteSettings>({
      sort: '-created',
      requestKey: null,
    })
    return records[0] || null
  } catch {
    return null
  }
}

export async function uploadLogo(file: File): Promise<SiteSettings> {
  const settings = await getSiteSettings()
  const formData = new FormData()
  formData.append('logo_file', file)

  if (settings) {
    return pb.collection('site_settings').update<SiteSettings>(settings.id, formData)
  }
  return pb.collection('site_settings').create<SiteSettings>(formData)
}

export async function removeLogo(): Promise<void> {
  const settings = await getSiteSettings()
  if (settings && settings.logo_file) {
    await pb.collection('site_settings').update(settings.id, { logo_file: null })
  }
}

export function getLogoUrl(settings: SiteSettings | null): string | null {
  if (settings && settings.logo_file) {
    return pb.files.getURL(settings, settings.logo_file)
  }
  return null
}
