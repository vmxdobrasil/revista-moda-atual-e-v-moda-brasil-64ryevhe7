import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'

interface SmartImageProps {
  src?: string | null
  alt: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
}

export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  loading = 'lazy',
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const handleRetry = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setError(false)
    setLoaded(false)
    setRetryKey((k) => k + 1)
  }, [])

  // If src is falsy (empty string, null, undefined), do not render <img> or error reload button.
  // Render a clean editorial gradient placeholder.
  if (!src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200',
          className,
        )}
      />
    )
  }

  return (
    <div className={cn('relative overflow-hidden bg-gray-100', className)}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <button
            onClick={handleRetry}
            className="pointer-events-auto flex flex-col items-center gap-1 text-gray-600 active:scale-95 transition-transform duration-100"
            aria-label="Recarregar imagem"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="text-xs font-medium">↻ Tap to reload</span>
          </button>
        </div>
      )}
      {!error && (
        <img
          key={retryKey}
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'transition-opacity duration-300 ease-in-out',
            loaded ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
        />
      )}
    </div>
  )
}
