import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { resetPassword } from '@/services/auth-security'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPasswordError('')
    setConfirmError('')

    let hasError = false

    if (!password) {
      setPasswordError('Senha é obrigatória.')
      hasError = true
    } else if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres.')
      hasError = true
    }

    if (!confirmPassword) {
      setConfirmError('Confirmação de senha é obrigatória.')
      hasError = true
    } else if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem.')
      hasError = true
    }

    if (hasError) return

    if (!token) {
      setError('Token de redefinição inválido ou ausente.')
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/admin/login'), 3000)
    } catch (err) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Link inválido</h1>
          <p className="text-sm text-gray-500 mb-6">
            O link de redefinição está ausente ou é inválido.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
            <Link to="/esqueci-senha">Solicitar novo link</Link>
          </Button>
        </div>
      </div>
    )
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

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Redefinir Senha</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Digite sua nova senha.</p>

        {success ? (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-2 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-700 font-medium">Senha redefinida com sucesso!</p>
              <p className="text-sm text-green-600 mt-1">Redirecionando para o login...</p>
            </div>
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
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                className={passwordError ? 'border-red-500' : ''}
                placeholder="Mínimo 8 caracteres"
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setConfirmError('')
                }}
                className={confirmError ? 'border-red-500' : ''}
              />
              {confirmError && <p className="text-sm text-red-500">{confirmError}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
