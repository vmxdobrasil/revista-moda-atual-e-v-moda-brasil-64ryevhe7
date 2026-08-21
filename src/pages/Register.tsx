import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createSubscriber } from '@/services/newsletter'
import { createLead } from '@/services/leads'
import {
  Lock,
  Mail,
  User,
  Upload,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  Camera,
} from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [segmento, setSegmento] = useState<'atacado' | 'varejo' | 'consumidora'>('atacado')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast({
          title: 'Arquivo muito grande',
          description: 'A foto deve ter até 5MB.',
          variant: 'destructive',
        })
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação obrigatória conforme CEO: foto pequena e nome obrigatórios
    if (!name.trim()) {
      return toast({
        title: 'Nome Obrigatório',
        description: 'Por favor, informe seu nome completo para a capa da revista.',
        variant: 'destructive',
      })
    }

    if (!avatarFile && !avatarPreview) {
      return toast({
        title: 'Foto Obrigatória',
        description: 'Por favor, envie sua foto para estampar a capa da revista digital.',
        variant: 'destructive',
      })
    }

    if (!email.trim() || !password) {
      return toast({
        title: 'E-mail e Senha Obrigatórios',
        description: 'Preencha o e-mail e senha de acesso.',
        variant: 'destructive',
      })
    }

    if (password.length < 8) {
      return toast({
        title: 'Senha Curta',
        description: 'A senha deve conter no mínimo 8 caracteres.',
        variant: 'destructive',
      })
    }

    setLoading(true)

    try {
      // 1. Cria conta de usuário com avatar e nome
      const res = await signUp(email, password, {
        name: name.trim(),
        avatar: avatarFile,
      })

      if (res.error) {
        toast({
          title: 'Erro no Cadastro',
          description:
            res.error?.message || 'Não foi possível completar o cadastro. Verifique os dados.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      // 2. Salva também na coleção de assinantes (subscribers)
      try {
        const subFormData = new FormData()
        subFormData.append('name', name.trim())
        subFormData.append('email', email.trim().toLowerCase())
        subFormData.append('segment', segmento)
        subFormData.append('status', 'ativo')
        subFormData.append('source', 'site')
        subFormData.append('engagement_score', '100')
        if (avatarFile) {
          subFormData.append('avatar', avatarFile)
        }
        await createSubscriber(subFormData)
      } catch (subErr) {
        console.warn('Subscriber save warning:', subErr)
      }

      // 3. Registra lead para analytics editorial
      try {
        await createLead({
          nome: name.trim(),
          email: email.trim().toLowerCase(),
          segmento: segmento as any,
          origem: 'cadastro_assinante_capa',
          type: 'subscribe',
        })
      } catch {
        /* intentionally ignored */
      }

      setSuccess(true)
      toast({
        title: 'Assinatura Concluída com Sucesso!',
        description: 'Sua foto e nome agora aparecem na capa da Revista Digital!',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao cadastrar',
        description: err?.message || 'Ocorreu um imprevisto. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-white selection:bg-orange-600">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

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

      <div className="w-full max-w-lg z-10 space-y-6 py-8">
        <div className="flex justify-center py-2 bg-transparent">
          <BrandLogo size="hero" className="h-24 sm:h-32 w-auto" />
        </div>

        <Card className="border-slate-800 bg-slate-900/90 text-slate-100 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/30">
                <Sparkles className="w-3 h-3 text-orange-400" />
                Edição Personalizada com sua Foto
              </span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight font-serif text-white">
              Cadastro de Assinante VIP
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              Preencha seus dados para estampar seu nome e foto na capa da Revista Moda Atual
              Digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-5 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 mx-auto flex items-center justify-center ring-4 ring-orange-500/20">
                  <CheckCircle2 className="w-9 h-9 text-orange-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-white">Parabéns, {name}!</h3>
                  <p className="text-sm text-slate-300">
                    Sua assinatura VIP está ativa. Sua foto e nome já estão personalizados na capa
                    da revista.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/70 border border-orange-500/30 flex items-center justify-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-orange-500 ring-2 ring-orange-500/30">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-orange-600 text-white font-bold">
                      {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold text-orange-400">
                      Exemplar Exclusivo de
                    </div>
                    <div className="text-sm font-bold text-white">{name}</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/reader/latest')}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-600/30"
                  >
                    Ver Minha Capa na Revista
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/editions')}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Explorar Edições
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Upload de Avatar / Foto Pequena Obrigatória */}
                <div className="space-y-2 text-center pb-2">
                  <Label className="text-slate-300 text-xs font-semibold uppercase tracking-wider block">
                    Sua Foto na Capa * (Obrigatória)
                  </Label>
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative group cursor-pointer"
                      title="Clique para escolher uma foto"
                    >
                      <Avatar className="h-24 w-24 border-2 border-dashed border-orange-500/80 group-hover:border-orange-400 group-hover:scale-105 transition-all shadow-xl ring-4 ring-orange-500/10">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} alt="Preview" className="object-cover" />
                        ) : null}
                        <AvatarFallback className="bg-slate-950 text-slate-400 flex flex-col items-center justify-center">
                          <Camera className="w-6 h-6 text-orange-400 mb-1" />
                          <span className="text-[10px] text-slate-400">Enviar Foto</span>
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs border-slate-700 hover:border-orange-500 text-slate-300 gap-1.5 h-8"
                    >
                      <Upload className="w-3.5 h-3.5 text-orange-400" />
                      {avatarFile ? 'Trocar Foto Selecionada' : 'Escolher Foto do Assinante'}
                    </Button>
                    <p className="text-[11px] text-slate-400">
                      Foto estilo avatar (JPG, PNG ou WebP até 5MB). Esta foto estampará a capa
                      digital.
                    </p>
                  </div>
                </div>

                {/* Nome Completo do Assinante */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-300 text-xs font-medium">
                    Nome Completo do Assinante *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ex: Valter Mendonça"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500 h-10"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    O nome que será impresso junto à foto na capa da revista.
                  </p>
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-300 text-xs font-medium">
                    E-mail do Assinante *
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
                      className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500 h-10"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-300 text-xs font-medium">
                    Senha de Acesso * (mínimo 8 caracteres)
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-orange-500 h-10"
                    />
                  </div>
                </div>

                {/* Segmento */}
                <div className="space-y-1.5">
                  <Label htmlFor="segmento" className="text-slate-300 text-xs font-medium">
                    Segmento de Atuação
                  </Label>
                  <select
                    id="segmento"
                    value={segmento}
                    onChange={(e) => setSegmento(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="atacado">Moda Atacado / Distribuição</option>
                    <option value="varejo">Lojista / Varejo</option>
                    <option value="consumidora">Leitor(a) & Consumidora VIP</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-600/30 py-5 text-sm gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cadastrando e Personalizando Capa...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Cadastrar e Ativar Minha Foto na Capa
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Já possui cadastro?{' '}
                    <Link
                      to="/admin/login"
                      className="text-orange-400 hover:underline font-semibold"
                    >
                      Fazer Login
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
