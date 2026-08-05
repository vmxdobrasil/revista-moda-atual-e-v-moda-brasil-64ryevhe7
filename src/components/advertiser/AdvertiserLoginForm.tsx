import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Lock } from 'lucide-react'
import { loginAdvertiser } from '@/services/advertiser-portal'

interface Props {
  onLogin: (token: string, advertiser: string) => void
}

export function AdvertiserLoginForm({ onLogin }: Props) {
  const [advertiser, setAdvertiser] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!advertiser.trim() || !email.trim()) {
      setError('Preencha todos os campos')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await loginAdvertiser(advertiser.trim(), email.trim())
      onLogin(result.access_token, result.advertiser)
    } catch {
      setError('Anunciante ou e-mail não encontrado. Verifique seus dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-8">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
            <Lock className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Acesso do Anunciante</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Faça login para acompanhar o desempenho das suas campanhas
        </p>
        {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adv-name">Anunciante</Label>
            <Input
              id="adv-name"
              type="text"
              value={advertiser}
              onChange={(e) => setAdvertiser(e.target.value)}
              placeholder="Nome do anunciante"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adv-email">E-mail</Label>
            <Input
              id="adv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
