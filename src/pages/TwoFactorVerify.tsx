import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react'
import { verify2FA } from '@/services/auth-security'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function TwoFactorVerify() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const email = params.get('email') || ''
  const otp = params.get('otp') || ''

  const [code, setCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'code' | 'backup'>('code')

  if (!email) {
    navigate('/admin/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const value = mode === 'code' ? code : backupCode
    if (!value.trim()) {
      setError(mode === 'code' ? 'Código é obrigatório.' : 'Código de backup é obrigatório.')
      return
    }

    setLoading(true)

    try {
      const result = await verify2FA(email, value.trim(), mode === 'backup')
      pb.authStore.save(result.token, result.record)
      toast({ title: 'Login realizado com sucesso!' })
      navigate('/admin')
    } catch (err: any) {
      const msg = err?.response?.message || 'Código inválido. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <Link
          to="/admin/login"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para login
        </Link>

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-orange-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Verificação em Duas Etapas
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Digite o código de verificação para continuar.
        </p>

        {otp && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">
              Código de verificação (demonstração):
            </p>
            <p className="text-2xl font-bold text-blue-700 tracking-widest text-center">{otp}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'code' ? (
            <div className="space-y-2">
              <Label htmlFor="code">Código de verificação</Label>
              <Input
                id="code"
                type="text"
                required
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError('')
                }}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="backupCode">Código de backup</Label>
              <Input
                id="backupCode"
                type="text"
                required
                value={backupCode}
                onChange={(e) => {
                  setBackupCode(e.target.value)
                  setError('')
                }}
                placeholder="XXXXXXXX"
                className="text-center text-lg tracking-wider"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Verificando...' : 'Verificar'}
          </Button>

          <button
            type="button"
            className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
            onClick={() => {
              setMode(mode === 'code' ? 'backup' : 'code')
              setError('')
              setCode('')
              setBackupCode('')
            }}
          >
            <KeyRound className="w-3 h-3" />
            {mode === 'code' ? 'Usar código de backup' : 'Usar código de verificação'}
          </button>
        </form>
      </div>
    </div>
  )
}
