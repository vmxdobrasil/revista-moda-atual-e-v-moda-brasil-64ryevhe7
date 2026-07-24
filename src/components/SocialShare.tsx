import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, Facebook, Twitter, Share2 } from 'lucide-react'

interface SocialShareProps {
  title: string
  url: string
}

export function SocialShare({ title, url }: SocialShareProps) {
  const shareText = `Confira a edição "${title}" da Revista Moda Atual!`
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(shareText)

  const handleWhatsApp = useCallback(() => {
    window.open(
      `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [encodedText, encodedUrl])

  const handleFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [encodedUrl])

  const handleTwitter = useCallback(() => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [encodedText, encodedUrl])

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url })
      } catch {
        // user cancelled
      }
    }
  }, [title, shareText, url])

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="gap-2 bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366]"
        onClick={handleWhatsApp}
      >
        <MessageCircle className="w-4 h-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-2 bg-[#1877F2]/10 border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20 hover:text-[#1877F2]"
        onClick={handleFacebook}
      >
        <Facebook className="w-4 h-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-2 bg-gray-800/10 border-gray-800/30 text-gray-800 hover:bg-gray-800/20 hover:text-gray-800"
        onClick={handleTwitter}
      >
        <Twitter className="w-4 h-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>
      {typeof navigator !== 'undefined' && !!navigator.share && (
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-gray-700"
          onClick={handleNativeShare}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
