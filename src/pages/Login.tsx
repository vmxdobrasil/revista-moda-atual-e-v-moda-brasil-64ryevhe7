import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Lock, Mail, ArrowLeft, Sparkles, UserPlus } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      toast({
        title: 'Falha no login',
        description: 'E-mail ou senha incorretos. Tente novamente.',
        variant: 'destructive',
      })
      setLoading(false)
    } else {
      toast({
        title: 'Bem-vindo(a)!',
        description: 'Login realizado com sucesso.',
      })
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-900 gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </Button>
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="flex justify-center py-2 bg-transparent">
          <BrandLogo size="hero" className="h-28 sm:h-36 md:h-40 w-auto" />
        </div>

        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Entre com suas credenciais para gerenciar a Revista MODA ATUAL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-xs font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-300 text-xs font-medium">
                    Senha
                  </Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs text-orange-400 hover:text-orange-300"
                    onClick={() => navigate('/esqueci-senha')}
                  >
                    Esqueceu?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-lg shadow-orange-600/20 py-5"
              >
                {loading ? 'Autenticando...' : 'Entrar no Painel'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400 space-y-2 border-t border-slate-800/80 pt-4">
              <p className="text-slate-300 font-medium">Ainda não é assinante?</p>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => navigate('/cadastro')}
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 gap-1.5 w-full text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                Cadastrar-se & Colocar Minha Foto na Capa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
