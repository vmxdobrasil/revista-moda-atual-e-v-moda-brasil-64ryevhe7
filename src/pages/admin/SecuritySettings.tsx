import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, ShieldOff, Loader2, AlertCircle, Copy, Check, KeyRound } from 'lucide-react'
import { setup2FA, disable2FA } from '@/services/auth-security'

export default function SecuritySettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const is2FAEnabled = user?.twofa_enabled || false

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showDisable, setShowDisable] = useState(false)

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Senha é obrigatória.')
      return
    }

    setLoading(true)
    try {
      const result = await setup2FA(password)
      setBackupCodes(result.backupCodes)
      setPassword('')
      toast({ title: '2FA ativado com sucesso!', description: 'Salve seus códigos de backup.' })
    } catch (err: any) {
      setError(err?.response?.message || 'Falha ao ativar 2FA. Verifique sua senha.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Senha é obrigatória.')
      return
    }

    setLoading(true)
    try {
      await disable2FA(password)
      setPassword('')
      setShowDisable(false)
      toast({ title: '2FA desativado.' })
    } catch (err: any) {
      setError(err?.response?.message || 'Falha ao desativar 2FA. Verifique sua senha.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCodes = () => {
    if (backupCodes) {
      navigator.clipboard.writeText(backupCodes.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-orange-500" />
          Segurança
        </h2>
        <p className="text-gray-500 mt-1">Gerencie a segurança da sua conta.</p>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Autenticação em Duas Etapas (2FA)
              </h3>
              <p className="text-sm text-gray-500">
                Adicione uma camada extra de segurança ao seu login.
              </p>
            </div>
            <Badge
              className={is2FAEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
            >
              {is2FAEnabled ? 'Ativado' : 'Desativado'}
            </Badge>
          </div>

          {backupCodes && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-yellow-600" />
                <p className="font-semibold text-yellow-800">Códigos de Backup</p>
              </div>
              <p className="text-sm text-yellow-700">
                Salve estes códigos em um local seguro. Cada código pode ser usado uma vez para
                acessar sua conta se você não tiver o código de verificação.
              </p>
              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded border">
                {backupCodes.map((code, i) => (
                  <code key={i} className="text-sm font-mono text-gray-700">
                    {code}
                  </code>
                ))}
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyCodes}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar códigos'}
              </Button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!is2FAEnabled && !backupCodes && (
            <form onSubmit={handleEnable} className="space-y-3">
              <p className="text-sm text-gray-600">
                Para ativar a verificação em duas etapas, confirme sua senha atual.
              </p>
              <div className="space-y-2">
                <Label htmlFor="enable-password">Senha atual</Label>
                <Input
                  id="enable-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="Digite sua senha"
                />
              </div>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'Ativando...' : 'Ativar 2FA'}
              </Button>
            </form>
          )}

          {is2FAEnabled && !showDisable && (
            <Button
              variant="outline"
              className="gap-2 text-red-600 hover:bg-red-50"
              onClick={() => setShowDisable(true)}
            >
              <ShieldOff className="w-4 h-4" />
              Desativar 2FA
            </Button>
          )}

          {is2FAEnabled && showDisable && (
            <form onSubmit={handleDisable} className="space-y-3 animate-fade-in">
              <p className="text-sm text-gray-600">
                Para desativar a verificação em duas etapas, confirme sua senha atual.
              </p>
              <div className="space-y-2">
                <Label htmlFor="disable-password">Senha atual</Label>
                <Input
                  id="disable-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="Digite sua senha"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="destructive" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirmar desativação
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowDisable(false)
                    setPassword('')
                    setError('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
