import { useEffect } from 'react'

export type MetaTagConfig = {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

function setOrCreateMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return
  try {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  } catch {
    // ignore
  }
}

export function useMetaTags(config: MetaTagConfig = {}) {
  const { title, description, image, url, type } = config
  useEffect(() => {
    try {
      if (title) document.title = title
      setOrCreateMeta('name', 'description', description || '')
      setOrCreateMeta('property', 'og:title', title || '')
      setOrCreateMeta('property', 'og:description', description || '')
      setOrCreateMeta('property', 'og:image', image || '')
      setOrCreateMeta('property', 'og:url', url || '')
      setOrCreateMeta('property', 'og:type', type || 'website')
    } catch {
      // ignore
    }
  }, [title, description, image, url, type])
}
