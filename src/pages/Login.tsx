import { useState } from 'react'
import { useNavigate, Navigate, Link, useSearchParams } from 'react-router-dom'
import { ClientResponseError } from 'pocketbase'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { logAuthFailure } from '@/services/auth-audit'
import { Loader2, AlertCircle } from 'lucide-react'

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão de internet e tente novamente.'
    }
    if (error.status === 401) {
      return 'E-mail ou senha inválidos.'
    }
    if (error.status === 400) {
      return 'Dados inválidos. Verifique o formato do e-mail e a senha.'
    }
    return getErrorMessage(error)
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'E-mail é obrigatório'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Formato de e-mail inválido'
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return 'Senha é obrigatória'
  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres'
  return null
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const { signIn, isAuthenticated, loading, checkBackendHealth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const safeRedirect = redirectTo && redirectTo.startsWith('/admin') ? redirectTo : '/admin'
  const { toast } = useToast()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={safeRedirect} replace />
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setEmailError('')
    setErrorMessage('')
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setPasswordError('')
    setErrorMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)

    if (emailErr) setEmailError(emailErr)
    if (passwordErr) setPasswordError(passwordErr)

    if (emailErr || passwordErr) {
      setErrorMessage('Por favor, corrija os campos destacados.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    const isBackendReachable = await checkBackendHealth()
    if (!isBackendReachable) {
      const msg =
        'Não foi possível conectar ao servidor. Verifique sua conexão de internet e tente novamente.'
      setErrorMessage(msg)
      toast({ title: 'Erro de Conexão', description: msg, variant: 'destructive' })
      await logAuthFailure(msg, email)
      setIsSubmitting(false)
      return
    }

    const result = await signIn(email, password)

    if (result.error) {
      const msg = getAuthErrorMessage(result.error)
      setErrorMessage(msg)
      toast({ title: 'Erro de Autenticação', description: msg, variant: 'destructive' })
      await logAuthFailure(msg, email)
    } else if (result.requires2FA) {
      const params = new URLSearchParams({ email: result.email || '' })
      if (result.otp) params.set('otp', result.otp)
      navigate(`/admin/2fa-verify?${params.toString()}`)
    } else {
      navigate(safeRedirect)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-8">
          <BrandLogo variant="primary" className="h-14 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Acesso Restrito</h1>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              placeholder="admin@exemplo.com"
              className={emailError ? 'border-red-500' : ''}
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                to="/esqueci-senha"
                className="text-xs text-orange-500 hover:text-orange-600 hover:underline"
              >
                Esqueci minha senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={handlePasswordChange}
              className={passwordError ? 'border-red-500' : ''}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  )
}
