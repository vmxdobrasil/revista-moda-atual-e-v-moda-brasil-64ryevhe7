import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Eye,
  EyeOff,
  Save,
  Plug,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getConfigStatus,
  saveConfig,
  testConnection,
  type ConfigStatus,
} from '@/services/social-engagement-config'

export function ConfigTab() {
  const [status, setStatus] = useState<ConfigStatus | null>(null)
  const [form, setForm] = useState({
    access_token: '',
    app_secret: '',
    page_id: '',
    ig_user_id: '',
  })
  const [show, setShow] = useState({ access_token: false, app_secret: false })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    getConfigStatus()
      .then(setStatus)
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    if (!form.access_token || !form.app_secret || !form.page_id || !form.ig_user_id) {
      toast.error('Preencha todos os campos')
      return
    }
    setSaving(true)
    try {
      await saveConfig(form)
      toast.success('Credenciais salvas com sucesso')
      setForm({ access_token: '', app_secret: '', page_id: '', ig_user_id: '' })
      const s = await getConfigStatus()
      setStatus(s)
      setTestResult(null)
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar credenciais')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await testConnection()
      if (result.success) {
        setTestResult({
          success: true,
          message: `Conectado: @${result.account_name} (${result.account_id}) — ${result.followers_count} seguidores`,
        })
        const s = await getConfigStatus()
        setStatus(s)
      } else {
        setTestResult({ success: false, message: result.error || 'Erro ao testar conexão' })
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Erro ao testar conexão' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {status?.mode === 'ativo' ? (
          <Badge className="bg-green-100 text-green-800">
            <ShieldCheck className="mr-1 h-3 w-3" /> Modo ativo
          </Badge>
        ) : (
          <Badge className="bg-yellow-100 text-yellow-800">
            <FlaskConical className="mr-1 h-3 w-3" /> Modo simulado
          </Badge>
        )}
        {status?.account_name && (
          <span className="text-sm text-muted-foreground">
            Conta: <strong>@{status.account_name}</strong>
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Credenciais do Instagram</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access_token">Long-Lived Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="access_token"
                type={show.access_token ? 'text' : 'password'}
                value={form.access_token}
                onChange={(e) => setForm({ ...form, access_token: e.target.value })}
                placeholder="EAAG..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShow({ ...show, access_token: !show.access_token })}
              >
                {show.access_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="app_secret">App Secret</Label>
            <div className="flex gap-2">
              <Input
                id="app_secret"
                type={show.app_secret ? 'text' : 'password'}
                value={form.app_secret}
                onChange={(e) => setForm({ ...form, app_secret: e.target.value })}
                placeholder="a1b2c3..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShow({ ...show, app_secret: !show.app_secret })}
              >
                {show.app_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page_id">Facebook Page ID</Label>
              <Input
                id="page_id"
                value={form.page_id}
                onChange={(e) => setForm({ ...form, page_id: e.target.value })}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ig_user_id">Instagram User ID</Label>
              <Input
                id="ig_user_id"
                value={form.ig_user_id}
                onChange={(e) => setForm({ ...form, ig_user_id: e.target.value })}
                placeholder="178414..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Salvando...' : 'Salvar credenciais'}
            </Button>
            <Button
              onClick={handleTest}
              disabled={testing || !status?.is_configured}
              variant="secondary"
            >
              <Plug className="mr-2 h-4 w-4" />
              {testing ? 'Testando...' : 'Testar conexão'}
            </Button>
          </div>
          {testResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 mt-0.5" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Guia de configuração — Instagram Graph API</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="step1">
              <AccordionTrigger>1. Criar App no Meta Developer</AccordionTrigger>
              <AccordionContent className="text-sm space-y-2">
                <p>
                  Acesse{' '}
                  <a
                    href="https://developers.facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    developers.facebook.com
                  </a>{' '}
                  e crie um novo App do tipo "Business".
                </p>
                <p>Após criar, adicione o produto "Instagram" e "Facebook Login" ao App.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="step2">
              <AccordionTrigger>2. Adicionar Scopes necessários</AccordionTrigger>
              <AccordionContent className="text-sm space-y-1">
                <p>Os seguintes scopes devem ser concedidos ao token:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    <code>instagram_basic</code>
                  </li>
                  <li>
                    <code>instagram_manage_comments</code>
                  </li>
                  <li>
                    <code>instagram_manage_messages</code>
                  </li>
                  <li>
                    <code>pages_read_engagement</code>
                  </li>
                  <li>
                    <code>pages_manage_metadata</code>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="step3">
              <AccordionTrigger>3. Gerar Long-Lived Token</AccordionTrigger>
              <AccordionContent className="text-sm space-y-2">
                <p>1. Obtenha um short-lived token via Facebook Login.</p>
                <p>
                  2. Troque por long-lived:{' '}
                  <code>
                    GET
                    https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN
                  </code>
                </p>
                <p>
                  3. Obtenha o token do Instagram Business:{' '}
                  <code>
                    GET https://graph.facebook.com/v18.0/{'{page_id}'}
                    ?fields=access_token&access_token=LONG_LIVED
                  </code>
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="step4">
              <AccordionTrigger>4. Vincular @revistamodaatual à Facebook Page</AccordionTrigger>
              <AccordionContent className="text-sm">
                <p>
                  No Meta Business Suite, vincule a conta @revistamodaatual a uma Facebook Page
                  Business. O Instagram User ID será o ID da conta de negócio do Instagram, obtível
                  via{' '}
                  <code>
                    GET https://graph.facebook.com/v18.0/{'{page_id}'}
                    ?fields=instagram_business_account
                  </code>
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="step5">
              <AccordionTrigger>5. Configurar Webhook</AccordionTrigger>
              <AccordionContent className="text-sm space-y-2">
                <p>No Meta Developer Dashboard → Webhooks:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    <strong>Callback URL:</strong>{' '}
                    <code>{'{backend_url}'}/backend/v1/webhook/instagram</code>
                  </li>
                  <li>
                    <strong>Verify Token:</strong> <code>revista_moda_atual_webhook_2024</code>
                  </li>
                  <li>
                    <strong>Subscriptions:</strong> <code>comment.add</code> e <code>message</code>
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  Após salvar as credenciais e validar a conexão, o agente passará automaticamente
                  para "Modo ativo".
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
