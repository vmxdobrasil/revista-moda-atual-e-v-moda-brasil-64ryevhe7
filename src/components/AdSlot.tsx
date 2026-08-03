import { useEffect, useState } from 'react'
import { getActiveAds, getAdImageUrl, type Advertisement } from '@/services/advertisements'
import { Megaphone } from 'lucide-react'

export function AdSlot() {
  const [ads, setAds] = useState<Advertisement[]>([])

  useEffect(() => {
    getActiveAds()
      .then(setAds)
      .catch(() => {})
  }, [])

  if (ads.length === 0) return null

  const ad = ads[0]

  return (
    <div className="mb-8">
      <a
        href={ad.url || '#'}
        target={ad.url ? '_blank' : undefined}
        rel={ad.url ? 'noopener noreferrer' : undefined}
        className="block relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300 group"
      >
        {ad.image ? (
          <img
            src={getAdImageUrl(ad, ad.image)}
            alt={ad.title}
            className="w-full h-32 md:h-40 object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-32 md:h-40 flex items-center justify-center bg-gradient-to-r from-orange-50 to-gray-50">
            <div className="flex items-center gap-2 text-orange-500">
              <Megaphone className="w-6 h-6" />
              <span className="font-semibold">{ad.title}</span>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <p className="text-white font-medium text-sm">{ad.title}</p>
        </div>
      </a>
    </div>
  )
}
