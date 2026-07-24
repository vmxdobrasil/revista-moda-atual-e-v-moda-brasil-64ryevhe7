import { useEffect } from 'react'

export interface MetaTagConfig {
  title: string
  description: string
  image: string
  url: string
  type: string
}

function setMetaTag(attr: string, key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

export function useMetaTags(config: MetaTagConfig | null) {
  useEffect(() => {
    if (!config) return

    const fullUrl = config.url || window.location.href

    document.title = config.title

    setMetaTag('property', 'og:title', config.title)
    setMetaTag('property', 'og:description', config.description)
    setMetaTag('property', 'og:image', config.image)
    setMetaTag('property', 'og:url', fullUrl)
    setMetaTag('property', 'og:type', config.type)

    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', config.title)
    setMetaTag('name', 'twitter:description', config.description)
    setMetaTag('name', 'twitter:image', config.image)

    setMetaTag('name', 'description', config.description)
    setCanonical(fullUrl)
  }, [config])
}
