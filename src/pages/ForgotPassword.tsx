import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react'
import { requestPasswordReset } from '@/services/auth-security'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetUrl, setResetUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('E-mail é obrigatório.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Formato de e-mail inválido.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await requestPasswordReset(email)
      setSuccess(true)
      setResetUrl(result.resetUrl)
    } catch {
      setSuccess(true)
      setResetUrl(null)
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

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Esqueci minha senha</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Digite seu e-mail para receber um link de redefinição.
        </p>

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                Se o e-mail existir, você receberá um link de redefinição.
              </p>
            </div>
            {resetUrl && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-600 mb-2 font-medium">
                  Link de redefinição (demonstração):
                </p>
                <a
                  href={resetUrl}
                  className="text-sm text-blue-700 hover:underline flex items-center gap-1 break-all"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  Abrir página de redefinição
                </a>
              </div>
            )}
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              <Link to="/admin/login">Voltar para login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="admin@exemplo.com"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
