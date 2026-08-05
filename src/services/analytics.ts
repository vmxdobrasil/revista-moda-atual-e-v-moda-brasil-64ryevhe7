import pb from '@/lib/pocketbase/client'

const clickedHotspots = new Set<string>()
const viewedPages = new Set<string>()

export async function trackPageView(pageId: string, editionId?: string): Promise<void> {
  if (viewedPages.has(pageId)) return
  viewedPages.add(pageId)
  try {
    await pb.send('/backend/v1/track/page-view', {
      method: 'POST',
      body: JSON.stringify({ page_id: pageId, edition_id: editionId || '' }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    viewedPages.delete(pageId)
    console.error('Failed to track page view:', err)
  }
}

export async function trackHotspotClick(hotspotId: string): Promise<void> {
  if (clickedHotspots.has(hotspotId)) return
  clickedHotspots.add(hotspotId)
  try {
    await pb.send('/backend/v1/analytics/hotspot-click', {
      method: 'POST',
      body: JSON.stringify({ hotspot_id: hotspotId }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    clickedHotspots.delete(hotspotId)
    console.error('Failed to track hotspot click:', err)
  }
}

export async function trackWhatsAppClick(hotspotId: string): Promise<void> {
  return trackHotspotClick(hotspotId)
}
