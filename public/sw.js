/**
 * Service Worker — Revista MODA ATUAL Digital
 * Estratégia de cache seguro:
 * - Assets estáticos públicos e tela offline
 * - NUNCA faz cache de dados sensíveis: credenciais, tokens (x-sync-token, JWTs),
 *   respostas autenticadas, leads comerciais (sales_leads, leads), propostas,
 *   assinantes ou rotas administrativas (/admin, /backend, /api).
 */

const CACHE_VERSION = 'moda-atual-v3'
const STATIC_CACHE_NAME = `static-${CACHE_VERSION}`
const OFFLINE_URL = '/offline.html'

// Assets estáticos públicos essenciais para boot offline da casca do app
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/og-image.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512-maskable.png',
]

// Instalação: pré-carrega casca da aplicação estática
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Falha parcial no pré-cache:', err)
      })
    }),
  )
  self.skipWaiting()
})

// Ativação: limpa versões legadas de cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((k) => k !== STATIC_CACHE_NAME).map((k) => caches.delete(k)))
    }),
  )
  self.clients.claim()
})

// Estratégia de Fetch com auditoria rigorosa de segurança
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Apenas requisições GET
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // 1. REGRAS DE SEGURANÇA E NÃO-CACHE:
  // Nunca interceptar nem armazenar rotas admin, autenticação, tokens ou APIs de dados
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/backend') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/auth') ||
    url.pathname.includes('/sync') ||
    url.pathname.includes('/sales-leads') ||
    url.pathname.includes('/subscribers') ||
    url.pathname.includes('/store-assets') ||
    url.pathname.includes('/2fa')
  ) {
    // Tráfego direto de rede — nunca entra no cache
    return
  }

  // Requisições com headers de autenticação explícitos nunca são cacheadas
  if (
    request.headers.has('Authorization') ||
    request.headers.has('x-sync-token') ||
    request.headers.has('X-Sync-Token')
  ) {
    return
  }

  // 2. Navegações de página (SPA): Network-first com fallback para index.html precacheado
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Se obteve resposta válida da rede, atualiza a cópia da casca
          if (response && response.status === 200) {
            const copy = response.clone()
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          const indexCached = await caches.match('/')
          return (
            indexCached ||
            new Response('Offline - Revista Moda Atual', {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
          )
        }),
    )
    return
  }

  // 3. Assets estáticos (scripts, styles, fontes, ícones, imagens públicas)
  if (
    url.origin === location.origin &&
    (url.pathname.startsWith('/icons/') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.webp') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.woff2'))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone()
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return networkResponse
        })
      }),
    )
  }
})
