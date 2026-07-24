import pb from '@/lib/pocketbase/client'

const clickedHotspots = new Set<string>()

export async function trackPageView(pageId: string): Promise<void> {
  try {
    await pb.send('/backend/v1/analytics/page-view', {
      method: 'POST',
      body: JSON.stringify({ pageId }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Failed to track page view:', err)
  }
}

export async function trackHotspotClick(hotspotId: string): Promise<void> {
  if (clickedHotspots.has(hotspotId)) return
  clickedHotspots.add(hotspotId)
  try {
    await pb.send('/backend/v1/analytics/hotspot-click', {
      method: 'POST',
      body: JSON.stringify({ hotspotId }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    clickedHotspots.delete(hotspotId)
    console.error('Failed to track hotspot click:', err)
  }
}
