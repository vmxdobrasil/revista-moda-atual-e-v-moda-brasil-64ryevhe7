import { useState } from 'react'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { loginAdvertiser } from '@/services/advertiser-portal'
import { useToast } from '@/hooks/use-toast'
import { Lock, FileText, CheckCircle2 } from 'lucide-react'

export default function PublicAdvertiser() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [proposalData, setProposalData] = useState<any>(null)
  const { toast } = useToast()

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) return

    setLoading(true)
    try {
      const result = await loginAdvertiser(token.trim(), '')
      setProposalData(result)
      toast({
        title: 'Acesso liberado',
        description: `Bem-vindo(a), ${result.advertiser || 'Anunciante'}!`,
      })
    } catch {
      toast({
        title: 'Código inválido',
        description: 'Verifique o código de acesso informado no seu contrato/proposta.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <BrandLogo size="hero" className="h-28 sm:h-36 w-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Portal do Anunciante
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Acompanhe suas propostas, contratos e entregas publicitárias na Revista MODA ATUAL
            Digital.
          </p>
        </div>

        {!proposalData ? (
          <Card className="border-slate-800 bg-slate-900/80 max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Acessar com Código</CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Digite o token de acesso exclusivo da sua proposta ou contrato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccess} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Cole seu token de acesso aqui..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold"
                >
                  {loading ? 'Validando...' : 'Visualizar Minha Proposta'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">{proposalData.advertiser}</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Campanha: {proposalData.campaign || 'Geral'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {proposalData.status?.toUpperCase()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-xs text-slate-500">Formato</p>
                  <p className="font-semibold text-slate-200">{proposalData.format || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Alcance Estimado</p>
                  <p className="font-semibold text-slate-200">
                    {proposalData.audience_reach
                      ? `${proposalData.audience_reach.toLocaleString()} leitores`
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
