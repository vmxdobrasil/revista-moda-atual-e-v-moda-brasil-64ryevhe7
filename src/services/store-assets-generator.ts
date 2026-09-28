/**
 * Gerador de Canvas 2D nativo para Google Play Store Assets
 * - Feature Graphic (1024x500)
 * - App Icon (512x512)
 * - 8 Mockups de Smartphone 9:16 (1080x1920) representando as telas reais do app:
 *   1) Onboarding / Login seguro
 *   2) Leitor de Revista Flipbook
 *   3) TOP 60 Melhores Marcas
 *   4) Pipeline V MODA (gestão comercial)
 *   5) Eventos de Moda & Coluna Social
 *   6) Painel Administrativo / Dashboard
 *   7) Link na Bio / Perfil
 *   8) Segurança, LGPD & Privacidade
 */

export interface GeneratedAsset {
  id: string
  name: string
  filename: string
  category: 'feature' | 'icon' | 'screenshot'
  width: number
  height: number
  description: string
  render: () => Promise<string> // Retorna Data URL base64 PNG
}

// Helpers Canvas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawBrandLogoBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rx = 18,
) {
  ctx.save()
  roundRect(ctx, x, y, w, h, rx)
  ctx.fillStyle = '#EA580C'
  ctx.fill()

  const scale = w / 380

  ctx.fillStyle = '#FFFFFF'
  ctx.font = `800 ${Math.round(13 * scale)}px sans-serif`
  ctx.fillText('REVISTA', x + 24 * scale, y + 32 * scale)

  ctx.font = `900 ${Math.round(44 * scale)}px 'Playfair Display', Didot, Georgia, serif`
  ctx.fillText('MODA ATUAL', x + 22 * scale, y + 86 * scale)

  ctx.font = `800 ${Math.round(14 * scale)}px sans-serif`
  ctx.fillText('DIGITAL', x + 245 * scale, y + 122 * scale)

  ctx.restore()
}

/**
 * 1. Feature Graphic (1024 x 500)
 */
export async function renderFeatureGraphic(): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 500
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível obter contexto Canvas 2D')

  // Fundo gradiente luxo moda
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 500)
  bgGrad.addColorStop(0, '#020617') // Slate 950
  bgGrad.addColorStop(0.55, '#0B0F17')
  bgGrad.addColorStop(1, '#1E1B18') // Toque bronze
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 500)

  // Halo de iluminação laranja
  const glow = ctx.createRadialGradient(880, 250, 20, 880, 250, 480)
  glow.addColorStop(0, 'rgba(234, 88, 12, 0.45)')
  glow.addColorStop(0.4, 'rgba(234, 88, 12, 0.15)')
  glow.addColorStop(1, 'rgba(2, 6, 23, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1024, 500)

  // Linhas decorativas sutis de alta-costura
  ctx.strokeStyle = 'rgba(234, 88, 12, 0.18)'
  ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(0, 80 + i * 80)
    ctx.lineTo(1024, 80 + i * 80)
    ctx.stroke()
  }

  // Tag editorial
  ctx.fillStyle = '#EA580C'
  ctx.font = '700 13px sans-serif'
  ctx.fillText('★  A MAIOR REVISTA DE MODA ATACADISTA DO BRASIL', 80, 95)

  // Logomarca oficial da marca em caixa laranja
  drawBrandLogoBox(ctx, 80, 120, 360, 132, 16)

  // Tagline e Headline
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 28px sans-serif'
  ctx.fillText('Hub B2B de Negócios & Estilo', 80, 295)

  ctx.fillStyle = '#94A3B8' // Slate 400
  ctx.font = '400 16px sans-serif'
  ctx.fillText('Conectando compradores, confecções e as melhores marcas do atacado.', 80, 330)

  // 3 Selos de valor em pílulas luxuosas
  const selos = [
    { title: 'Edições Flipbook', sub: 'Interativo com Hotspots' },
    { title: 'TOP 60 Melhores Marcas', sub: 'Ranking Oficial Atacado' },
    { title: 'Pipeline V MODA', sub: 'Gestão Comercial B2B' },
  ]

  selos.forEach((selo, i) => {
    const bx = 80 + i * 190
    const by = 375
    roundRect(ctx, bx, by, 175, 68, 10)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)'
    ctx.lineWidth = 1.2
    ctx.stroke()

    // Bullet laranja
    ctx.fillStyle = '#EA580C'
    ctx.beginPath()
    ctx.arc(bx + 18, by + 24, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 12px sans-serif'
    ctx.fillText(selo.title, bx + 30, by + 28)

    ctx.fillStyle = '#94A3B8'
    ctx.font = '400 10.5px sans-serif'
    ctx.fillText(selo.sub, bx + 16, by + 50)
  })

  // Representação visual de smartphone à direita
  drawPhoneDeviceFrame(ctx, 700, 45, 255, 420, () => {
    // Tela interior mockup leitor flipbook
    const pgrad = ctx.createLinearGradient(700, 45, 955, 465)
    pgrad.addColorStop(0, '#0F172A')
    pgrad.addColorStop(1, '#1E293B')
    ctx.fillStyle = pgrad
    ctx.fillRect(715, 65, 225, 380)

    // Capa de moda simulada
    roundRect(ctx, 725, 80, 205, 250, 8)
    ctx.fillStyle = '#18181B'
    ctx.fill()
    ctx.strokeStyle = '#EA580C'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Imagem estilizada
    const cgrad = ctx.createLinearGradient(725, 80, 930, 330)
    cgrad.addColorStop(0, '#7C2D12')
    cgrad.addColorStop(0.5, '#C2410C')
    cgrad.addColorStop(1, '#EA580C')
    ctx.fillStyle = cgrad
    roundRect(ctx, 733, 90, 189, 230, 6)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 16px "Playfair Display", serif'
    ctx.fillText('COLEÇÃO ALTO VERÃO', 742, 130)

    ctx.font = '700 10px sans-serif'
    ctx.fillStyle = '#FED7AA'
    ctx.fillText('POLO DE MODA BRASIL', 742, 150)

    // Hotspot interativo
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(880, 240, 12, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#EA580C'
    ctx.beginPath()
    ctx.arc(880, 240, 7, 0, Math.PI * 2)
    ctx.fill()

    // Badge inferior no celular
    roundRect(ctx, 735, 345, 185, 35, 6)
    ctx.fillStyle = '#EA580C'
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 11px sans-serif'
    ctx.fillText('LER REVISTA DIGITAL →', 760, 367)
  })

  return canvas.toDataURL('image/png')
}

/**
 * 2. App Icon (512 x 512)
 */
export async function renderAppIcon(): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível obter contexto Canvas 2D')

  // Fundo moderno escuro com textura e cantos arredondados suaves
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 512)
  bgGrad.addColorStop(0, '#020617')
  bgGrad.addColorStop(1, '#0F172A')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 512, 512)

  // Caixa de destaque em tom da marca
  const boxMargin = 36
  const boxW = 512 - boxMargin * 2
  const boxH = 512 - boxMargin * 2
  const boxGrad = ctx.createLinearGradient(boxMargin, boxMargin, 512 - boxMargin, 512 - boxMargin)
  boxGrad.addColorStop(0, '#EA580C')
  boxGrad.addColorStop(1, '#C2410C')

  roundRect(ctx, boxMargin, boxMargin, boxW, boxH, 88)
  ctx.fillStyle = boxGrad
  ctx.fill()

  // Borda elegante interna de brilho
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
  ctx.lineWidth = 4
  roundRect(ctx, boxMargin + 4, boxMargin + 4, boxW - 8, boxH - 8, 84)
  ctx.stroke()

  // Monograma / Tipografia oficial centralizada
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '800 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('REVISTA', 256, 170)

  ctx.font = '900 54px "Playfair Display", Didot, serif'
  ctx.fillText('MODA ATUAL', 256, 260)

  ctx.font = '800 22px sans-serif'
  ctx.letterSpacing = '6px'
  ctx.fillText('DIGITAL', 256, 330)

  // Linha de alta costura
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(130, 365)
  ctx.lineTo(382, 365)
  ctx.stroke()

  // Subtítulo B2B
  ctx.letterSpacing = '2px'
  ctx.font = '700 13px sans-serif'
  ctx.fillStyle = '#FED7AA'
  ctx.fillText('HUB DE NEGÓCIOS DE MODA', 256, 400)
  ctx.textAlign = 'left'

  return canvas.toDataURL('image/png')
}

/**
 * Moldura genérica de smartphone 9:16 (1080 x 1920)
 */
function drawPhoneDeviceFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  drawScreenContent: () => void,
) {
  ctx.save()

  // Sombra suave do telefone
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 15

  // Corpo externo do aparelho
  roundRect(ctx, x, y, w, h, 36)
  ctx.fillStyle = '#0F172A'
  ctx.fill()
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.restore()

  // Área da tela
  const border = 12
  const screenX = x + border
  const screenY = y + border
  const screenW = w - border * 2
  const screenH = h - border * 2

  ctx.save()
  roundRect(ctx, screenX, screenY, screenW, screenH, 26)
  ctx.clip()

  // Renderiza conteúdo da tela
  drawScreenContent()

  // Notch / Ilha dinâmica
  roundRect(ctx, x + w / 2 - 40, screenY + 6, 80, 16, 8)
  ctx.fillStyle = '#000000'
  ctx.fill()

  // Barra de status
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.font = '700 10px sans-serif'
  ctx.fillText('09:41', screenX + 18, screenY + 18)
  ctx.fillText('5G  100%', screenX + screenW - 65, screenY + 18)

  ctx.restore()
}

/**
 * Gerador genérico para Captura 9:16 (1080x1920)
 */
function createScreenshotCanvas(
  title: string,
  subtitle: string,
  drawAppScreen: (
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
  ) => void,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível obter contexto Canvas')

  // Fundo com gradiente elegante moda escuro
  const bg = ctx.createLinearGradient(0, 0, 1080, 1920)
  bg.addColorStop(0, '#020617')
  bg.addColorStop(0.3, '#0B0F17')
  bg.addColorStop(1, '#18110D')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 1080, 1920)

  // Glow laranja no topo
  const glow = ctx.createRadialGradient(540, 300, 50, 540, 300, 600)
  glow.addColorStop(0, 'rgba(234, 88, 12, 0.28)')
  glow.addColorStop(1, 'rgba(2, 6, 23, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1080, 800)

  // Marca no topo
  drawBrandLogoBox(ctx, 70, 70, 240, 88, 12)

  // Badge da Play Store / Categoria
  roundRect(ctx, 770, 85, 240, 50, 25)
  ctx.fillStyle = 'rgba(234, 88, 12, 0.15)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = '#EA580C'
  ctx.font = '700 16px sans-serif'
  ctx.fillText('★ B2B MODA BRASIL', 805, 116)

  // Headline chamativa no topo
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '900 48px sans-serif'
  ctx.fillText(title, 70, 230)

  ctx.fillStyle = '#94A3B8'
  ctx.font = '500 24px sans-serif'
  ctx.fillText(subtitle, 70, 280)

  // Mockup do Smartphone centralizado
  const phoneX = 135
  const phoneY = 340
  const phoneW = 810
  const phoneH = 1520

  ctx.save()
  // Sombra gigante e realista
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
  ctx.shadowBlur = 60
  ctx.shadowOffsetY = 25
  roundRect(ctx, phoneX, phoneY, phoneW, phoneH, 56)
  ctx.fillStyle = '#0F172A'
  ctx.fill()
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 6
  ctx.stroke()
  ctx.restore()

  // Tela interior do Smartphone
  const border = 18
  const sx = phoneX + border
  const sy = phoneY + border
  const sw = phoneW - border * 2
  const sh = phoneH - border * 2

  ctx.save()
  roundRect(ctx, sx, sy, sw, sh, 42)
  ctx.clip()

  // Fundo padrão da tela
  ctx.fillStyle = '#020617'
  ctx.fillRect(sx, sy, sw, sh)

  // Status Bar
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 18px sans-serif'
  ctx.fillText('09:41', sx + 35, sy + 38)
  ctx.fillText('5G  ●●● 100%', sx + sw - 140, sy + 38)

  // Ilha dinâmica
  roundRect(ctx, sx + sw / 2 - 75, sy + 14, 150, 28, 14)
  ctx.fillStyle = '#000000'
  ctx.fill()

  // App Bar superior do aplicativo
  roundRect(ctx, sx + 20, sy + 60, sw - 40, 75, 16)
  ctx.fillStyle = '#0F172A'
  ctx.fill()
  drawBrandLogoBox(ctx, sx + 35, sy + 75, 130, 48, 8)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 18px sans-serif'
  ctx.fillText('MODA ATUAL DIGITAL', sx + 185, sy + 105)

  // Conteúdo da tela do app
  drawAppScreen(ctx, sx, sy + 145, sw, sh - 235)

  // Bottom Navigation Bar do App
  roundRect(ctx, sx + 20, sy + sh - 85, sw - 40, 68, 20)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
  ctx.fill()
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 1.5
  ctx.stroke()

  const tabs = ['Revista', 'TOP 60', 'Eventos', 'Pipeline', 'Bio']
  tabs.forEach((tab, idx) => {
    const tx = sx + 40 + idx * ((sw - 80) / tabs.length)
    if (idx === 0) {
      ctx.fillStyle = '#EA580C'
      ctx.font = '800 15px sans-serif'
    } else {
      ctx.fillStyle = '#94A3B8'
      ctx.font = '600 14px sans-serif'
    }
    ctx.fillText(tab, tx, sy + sh - 45)
  })

  // Home indicator do iPhone/Android
  roundRect(ctx, sx + sw / 2 - 70, sy + sh - 12, 140, 5, 3)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()

  ctx.restore()

  return canvas.toDataURL('image/png')
}

/**
 * 8 Capturas de tela individuais
 */

// 1. Onboarding / Login Seguro
export async function renderScreen1(): Promise<string> {
  return createScreenshotCanvas(
    'Acesso Exclusivo & Onboarding',
    'Login seguro, cadastro de assinantes e autenticação multifator 2FA.',
    (ctx, sx, sy, sw, sh) => {
      // Card central de login
      roundRect(ctx, sx + 35, sy + 60, sw - 70, sh - 120, 24)
      ctx.fillStyle = '#0F172A'
      ctx.fill()
      ctx.strokeStyle = '#1E293B'
      ctx.lineWidth = 2
      ctx.stroke()

      // Header do card
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 28px sans-serif'
      ctx.fillText('Acesso Administrativo', sx + 65, sy + 130)

      ctx.fillStyle = '#94A3B8'
      ctx.font = '400 18px sans-serif'
      ctx.fillText('Gerencie a Revista MODA ATUAL & Hub V MODA', sx + 65, sy + 170)

      // Campo E-mail
      ctx.fillStyle = '#E2E8F0'
      ctx.font = '700 16px sans-serif'
      ctx.fillText('E-mail Corporativo', sx + 65, sy + 240)

      roundRect(ctx, sx + 65, sy + 260, sw - 130, 68, 14)
      ctx.fillStyle = '#020617'
      ctx.fill()
      ctx.strokeStyle = '#334155'
      ctx.stroke()
      ctx.fillStyle = '#94A3B8'
      ctx.font = '400 18px sans-serif'
      ctx.fillText('seu@email.com', sx + 90, sy + 302)

      // Campo Senha
      ctx.fillStyle = '#E2E8F0'
      ctx.font = '700 16px sans-serif'
      ctx.fillText('Senha', sx + 65, sy + 375)

      roundRect(ctx, sx + 65, sy + 395, sw - 130, 68, 14)
      ctx.fillStyle = '#020617'
      ctx.fill()
      ctx.strokeStyle = '#334155'
      ctx.stroke()
      ctx.fillStyle = '#94A3B8'
      ctx.font = '400 22px sans-serif'
      ctx.fillText('••••••••••••', sx + 90, sy + 438)

      // Botão Entrar
      roundRect(ctx, sx + 65, sy + 510, sw - 130, 72, 16)
      ctx.fillStyle = '#EA580C'
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 20px sans-serif'
      ctx.fillText('Entrar no Painel Seguro', sx + sw / 2 - 120, sy + 555)

      // Selos de segurança
      roundRect(ctx, sx + 65, sy + 630, sw - 130, 130, 16)
      ctx.fillStyle = 'rgba(234, 88, 12, 0.08)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.3)'
      ctx.stroke()

      ctx.fillStyle = '#EA580C'
      ctx.font = '700 17px sans-serif'
      ctx.fillText('🔒 Criptografia Forte & Proteção LGPD', sx + 90, sy + 675)

      ctx.fillStyle = '#94A3B8'
      ctx.font = '400 15px sans-serif'
      ctx.fillText(
        'Credenciais isoladas, sem tokens em cache local e com suporte a 2FA.',
        sx + 90,
        sy + 715,
      )
    },
  )
}

// 2. Leitor Flipbook Interativo
export async function renderScreen2(): Promise<string> {
  return createScreenshotCanvas(
    'Leitor de Revista Flipbook',
    'Edições digitais interativas, virada de página suave e hotspots de compra.',
    (ctx, sx, sy, sw, sh) => {
      // Toolbar superior do flipbook
      roundRect(ctx, sx + 30, sy + 20, sw - 60, 60, 14)
      ctx.fillStyle = '#0F172A'
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '700 18px sans-serif'
      ctx.fillText('Páginas 12-13 de 48  •  Edição Alto Verão', sx + 50, sy + 56)

      // Páginas do Flipbook lado a lado
      const pageW = (sw - 90) / 2
      const pageH = sh - 220

      // Página esquerda
      roundRect(ctx, sx + 35, sy + 100, pageW, pageH, 12)
      ctx.fillStyle = '#1E1B18'
      ctx.fill()
      ctx.strokeStyle = '#334155'
      ctx.stroke()

      // Arte editorial página esquerda
      const gLeft = ctx.createLinearGradient(sx + 35, sy + 100, sx + 35 + pageW, sy + 100 + pageH)
      gLeft.addColorStop(0, '#7C2D12')
      gLeft.addColorStop(1, '#1E293B')
      ctx.fillStyle = gLeft
      roundRect(ctx, sx + 45, sy + 115, pageW - 20, pageH * 0.6, 8)
      ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '900 24px "Playfair Display", serif'
      ctx.fillText('ALFAIATARIA B2B', sx + 60, sy + 160)
      ctx.font = '500 14px sans-serif'
      ctx.fillStyle = '#FED7AA'
      ctx.fillText('Tendências de Venda Imediata', sx + 60, sy + 190)

      // Página direita
      roundRect(ctx, sx + 45 + pageW, sy + 100, pageW, pageH, 12)
      ctx.fillStyle = '#111827'
      ctx.fill()
      ctx.strokeStyle = '#334155'
      ctx.stroke()

      // Lookbook e hotspots na página direita
      roundRect(ctx, sx + 55 + pageW, sy + 115, pageW - 20, pageH * 0.6, 8)
      ctx.fillStyle = '#1E293B'
      ctx.fill()

      // Hotspot Interativo 1
      const hx = sx + 55 + pageW + 80
      const hy = sy + 260
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(hx, hy, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#EA580C'
      ctx.beginPath()
      ctx.arc(hx, hy, 12, 0, Math.PI * 2)
      ctx.fill()

      // Balão do produto
      roundRect(ctx, hx + 25, hy - 35, 170, 70, 10)
      ctx.fillStyle = 'rgba(2, 6, 23, 0.95)'
      ctx.fill()
      ctx.strokeStyle = '#EA580C'
      ctx.stroke()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '700 14px sans-serif'
      ctx.fillText('Blazer Linho Puro', hx + 40, hy - 12)
      ctx.fillStyle = '#EA580C'
      ctx.font = '800 16px sans-serif'
      ctx.fillText('R$ 149,90 no Atacado', hx + 40, hy + 15)

      // Controles inferiores do flipbook
      roundRect(ctx, sx + 30, sy + sh - 95, sw - 60, 65, 16)
      ctx.fillStyle = '#0F172A'
      ctx.fill()
      ctx.fillStyle = '#EA580C'
      ctx.font = '700 18px sans-serif'
      ctx.fillText('◄ Anterior', sx + 60, sy + sh - 55)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText('🔍 Zoom  •  📑 Miniaturas  •  🔗 Compartilhar', sx + sw / 2 - 130, sy + sh - 55)
      ctx.fillStyle = '#EA580C'
      ctx.fillText('Próxima ►', sx + sw - 160, sy + sh - 55)
    },
  )
}

// 3. TOP 60 Melhores Marcas
export async function renderScreen3(): Promise<string> {
  return createScreenshotCanvas(
    'TOP 60 Melhores Marcas',
    'O guia de compras e ranking oficial das marcas de maior destaque no atacado.',
    (ctx, sx, sy, sw, sh) => {
      // Header da lista com filtros
      roundRect(ctx, sx + 30, sy + 20, sw - 60, 65, 14)
      ctx.fillStyle = '#0F172A'
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 20px sans-serif'
      ctx.fillText('🏆 Ranking Oficial TOP 60 Atacado', sx + 50, sy + 60)

      // Pílulas de filtro
      const cats = ['Todas', 'Feminino', 'Masculino', 'Jeanswear', 'Plus Size']
      cats.forEach((cat, idx) => {
        const cx = sx + 30 + idx * 135
        roundRect(ctx, cx, sy + 105, 125, 42, 21)
        if (idx === 0) {
          ctx.fillStyle = '#EA580C'
          ctx.fill()
          ctx.fillStyle = '#FFFFFF'
          ctx.font = '700 15px sans-serif'
        } else {
          ctx.fillStyle = '#1E293B'
          ctx.fill()
          ctx.fillStyle = '#94A3B8'
          ctx.font = '500 14px sans-serif'
        }
        ctx.fillText(cat, cx + 22, sy + 132)
      })

      // Cards de marcas
      const marcas = [
        { pos: '1º', nome: 'Dona Florinda Concept', cat: 'Feminino Prime', score: '98.5' },
        { pos: '2º', nome: 'Polo Wear Brasil', cat: 'Casual & Jeans', score: '97.2' },
        { pos: '3º', nome: 'Via Tolentino', cat: 'Moda Executiva', score: '96.8' },
        { pos: '4º', nome: 'Morena Rosa Atacado', cat: 'Feminino Premium', score: '95.4' },
      ]

      marcas.forEach((m, idx) => {
        const my = sy + 175 + idx * 155
        roundRect(ctx, sx + 30, my, sw - 60, 138, 18)
        ctx.fillStyle = '#0F172A'
        ctx.fill()
        ctx.strokeStyle = idx === 0 ? '#EA580C' : '#334155'
        ctx.lineWidth = idx === 0 ? 2 : 1
        ctx.stroke()

        // Posição no ranking
        roundRect(ctx, sx + 50, my + 25, 60, 60, 12)
        ctx.fillStyle = idx === 0 ? '#EA580C' : '#1E293B'
        ctx.fill()
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '800 22px sans-serif'
        ctx.fillText(m.pos, sx + 62, my + 63)

        // Detalhes da marca
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '800 22px sans-serif'
        ctx.fillText(m.nome, sx + 130, my + 52)

        ctx.fillStyle = '#94A3B8'
        ctx.font = '500 16px sans-serif'
        ctx.fillText(m.cat, sx + 130, my + 82)

        // Selo Score
        roundRect(ctx, sx + sw - 170, my + 35, 120, 48, 12)
        ctx.fillStyle = 'rgba(234, 88, 12, 0.15)'
        ctx.fill()
        ctx.fillStyle = '#EA580C'
        ctx.font = '800 18px sans-serif'
        ctx.fillText(`★ ${m.score}`, sx + sw - 150, my + 66)

        // Botões de contato
        ctx.fillStyle = '#38BDF8'
        ctx.font = '600 14px sans-serif'
        ctx.fillText('Ver Catálogo  •  WhatsApp Direto  •  Grade Atacado', sx + 130, my + 115)
      })
    },
  )
}

// 4. Pipeline V MODA (Gestão Comercial B2B)
export async function renderScreen4(): Promise<string> {
  return createScreenshotCanvas(
    'Pipeline V MODA & Leads B2B',
    'Gestão completa de leads comerciais, etapas de abordagem e fechamento de parcerias.',
    (ctx, sx, sy, sw, sh) => {
      // Header Métricas
      roundRect(ctx, sx + 30, sy + 20, sw - 60, 130, 18)
      ctx.fillStyle = '#0F172A'
      ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 20px sans-serif'
      ctx.fillText('Pipeline Comercial V MODA BRASIL', sx + 50, sy + 58)

      // Métricas rápidas
      const metrics = [
        { label: 'Leads Ativos', val: '142' },
        { label: 'Em Negociação', val: '38' },
        { label: 'Fechados Mês', val: '19' },
      ]
      metrics.forEach((m, idx) => {
        const mx = sx + 50 + idx * 210
        ctx.fillStyle = '#94A3B8'
        ctx.font = '500 15px sans-serif'
        ctx.fillText(m.label, mx, sy + 95)
        ctx.fillStyle = '#EA580C'
        ctx.font = '800 24px sans-serif'
        ctx.fillText(m.val, mx, sy + 130)
      })

      // Colunas Kanban de demonstração
      const colW = (sw - 80) / 2
      const colH = sh - 180

      // Coluna 1: Abordagem
      roundRect(ctx, sx + 30, sy + 170, colW, colH, 16)
      ctx.fillStyle = '#0B0F17'
      ctx.fill()
      ctx.strokeStyle = '#1E293B'
      ctx.stroke()

      ctx.fillStyle = '#EA580C'
      ctx.font = '800 18px sans-serif'
      ctx.fillText('Etapa: Abordagem (14)', sx + 50, sy + 205)

      // Card Lead 1
      roundRect(ctx, sx + 45, sy + 225, colW - 30, 170, 12)
      ctx.fillStyle = '#1E293B'
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '700 18px sans-serif'
      ctx.fillText('Confecções Bella Moda', sx + 60, sy + 260)
      ctx.fillStyle = '#94A3B8'
      ctx.font = '400 14px sans-serif'
      ctx.fillText('Polo de Goiânia • Porte Médio', sx + 60, sy + 288)
      ctx.fillText('Contato: contato@bellamoda.com', sx + 60, sy + 312)

      roundRect(ctx, sx + 60, sy + 330, 140, 36, 8)
      ctx.fillStyle = '#EA580C'
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '700 13px sans-serif'
      ctx.fillText('Avançar Etapa →', sx + 75, sy + 353)

      // Coluna 2: Fechamento
      roundRect(ctx, sx + 45 + colW, sy + 170, colW, colH, 16)
      ctx.fillStyle = '#0B0F17'
      ctx.fill()
      ctx.strokeStyle = '#1E293B'
      ctx.stroke()

      ctx.fillStyle = '#22C55E'
      ctx.font = '800 18px sans-serif'
      ctx.fillText('⭐ Fechamento (8)', sx + 65 + colW, sy + 205)

      // Card Lead 2
      roundRect(ctx, sx + 55 + colW, sy + 225, colW - 30, 170, 12)
      ctx.fillStyle = '#1E293B'
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '700 18px sans-serif'
      ctx.fillText('Atacado Minas Fashion', sx + 70 + colW, sy + 260)
      ctx.fillStyle = '#94A3B8'
      ctx.font = '400 14px sans-serif'
      ctx.fillText('Adesão TOP 60 Confirmada', sx + 70 + colW, sy + 288)
      ctx.fillText('Plano: Mídia Anual + Destaque', sx + 70 + colW, sy + 312)

      roundRect(ctx, sx + 70 + colW, sy + 330, 150, 36, 8)
      ctx.fillStyle = '#22C55E'
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '700 13px sans-serif'
      ctx.fillText('✓ Contrato Gerado', sx + 85 + colW, sy + 353)
    },
  )
}

// 5. Eventos de Moda & Coluna Social
export async function renderScreen5(): Promise<string> {
  return createScreenshotCanvas(
    'Eventos & Coluna Social',
    'Cobertura exclusiva de desfiles, semanas de moda e os principais lançamentos do Brasil.',
    (ctx, sx, sy, sw, sh) => {
      // Banner de evento destaque
      roundRect(ctx, sx + 30, sy + 20, sw - 60, 260, 20)
      const gEv = ctx.createLinearGradient(sx + 30, sy + 20, sx + sw - 30, sy + 280)
      gEv.addColorStop(0, '#9A3412')
      gEv.addColorStop(0.6, '#EA580C')
      gEv.addColorStop(1, '#0F172A')
      ctx.fillStyle = gEv
      ctx.fill()

      roundRect(ctx, sx + 55, sy + 45, 140, 32, 16)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fill()
      ctx.fillStyle = '#FED7AA'
      ctx.font = '700 14px sans-serif'
      ctx.fillText('DESFILE EXCLUSIVO', sx + 68, sy + 67)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '900 32px "Playfair Display", serif'
      ctx.fillText('Goiás Fashion Week 2026', sx + 55, sy + 130)

      ctx.font = '500 18px sans-serif'
      ctx.fillStyle = '#F8FAFC'
      ctx.fillText('Cobertura completa dos 42 desfiles atacadistas', sx + 55, sy + 170)

      roundRect(ctx, sx + 55, sy + 200, 180, 48, 12)
      ctx.fillStyle = '#020617'
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '700 15px sans-serif'
      ctx.fillText('Ver Galeria de Fotos →', sx + 75, sy + 230)

      // Lista de eventos e coluna social
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 22px sans-serif'
      ctx.fillText('Destaques da Coluna Social', sx + 35, sy + 325)

      const posts = [
        { title: 'Noite de Gala do Polo de Confecções', date: '20 de Março • Goiânia/GO' },
        { title: 'Lançamento Coleção Cápsula Primavera', date: '15 de Março • São Paulo/SP' },
        { title: 'Encontro de Grandes Compradores B2B', date: '10 de Março • Belo Horizonte/MG' },
      ]

      posts.forEach((p, idx) => {
        const py = sy + 350 + idx * 130
        roundRect(ctx, sx + 30, py, sw - 60, 115, 16)
        ctx.fillStyle = '#0F172A'
        ctx.fill()

        roundRect(ctx, sx + 45, py + 18, 80, 80, 12)
        ctx.fillStyle = '#EA580C'
        ctx.fill()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '800 18px sans-serif'
        ctx.fillText(p.title, sx + 145, py + 50)

        ctx.fillStyle = '#94A3B8'
        ctx.font = '400 15px sans-serif'
        ctx.fillText(p.date, sx + 145, py + 80)
      })
    },
  )
}

// 6. Painel Administrativo / Dashboard
export async function renderScreen6(): Promise<string> {
  return createScreenshotCanvas(
    'Painel Administrativo Completo',
    'Controle de edições, analytics, gerador de conteúdo IA e auditoria em tempo real.',
    (ctx, sx, sy, sw, sh) => {
      // Header com saudações
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 24px sans-serif'
      ctx.fillText('Visão Geral do Sistema', sx + 35, sy + 45)

      ctx.fillStyle = '#94A3B8'
      ctx.font = '400 16px sans-serif'
      ctx.fillText('Métricas editoriais, engajamento e fluxo de publicidade', sx + 35, sy + 75)

      // Cards de KPIs em Grid 2x2
      const kpis = [
        { label: 'Leitores Mensais', val: '48.200', change: '+18%' },
        { label: 'Edições Ativas', val: '24', change: 'Total' },
        { label: 'Marcas Cadastradas', val: '60', change: 'TOP 60' },
        { label: 'Receita Publicidade', val: 'R$ 84.500', change: '+12%' },
      ]

      kpis.forEach((k, idx) => {
        const kx = sx + 30 + (idx % 2) * ((sw - 75) / 2 + 15)
        const ky = sy + 100 + Math.floor(idx / 2) * 140
        const kw = (sw - 75) / 2

        roundRect(ctx, kx, ky, kw, 125, 16)
        ctx.fillStyle = '#0F172A'
        ctx.fill()
        ctx.strokeStyle = '#1E293B'
        ctx.stroke()

        ctx.fillStyle = '#94A3B8'
        ctx.font = '500 15px sans-serif'
        ctx.fillText(k.label, kx + 20, ky + 38)

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '800 24px sans-serif'
        ctx.fillText(k.val, kx + 20, ky + 80)

        ctx.fillStyle = '#EA580C'
        ctx.font = '700 14px sans-serif'
        ctx.fillText(k.change, kx + 20, ky + 108)
      })

      // Gráfico visual simulado de audiência
      roundRect(ctx, sx + 30, sy + 400, sw - 60, 280, 20)
      ctx.fillStyle = '#0F172A'
      ctx.fill()

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 18px sans-serif'
      ctx.fillText('Evolução de Visualizações de Edições', sx + 50, sy + 440)

      // Barras do gráfico
      const bars = [40, 65, 50, 85, 95, 120, 145, 160, 190]
      bars.forEach((b, idx) => {
        const bx = sx + 60 + idx * 65
        const by = sy + 640 - b
        roundRect(ctx, bx, by, 40, b, 6)
        ctx.fillStyle = idx === bars.length - 1 ? '#EA580C' : '#334155'
        ctx.fill()
      })
    },
  )
}

// 7. Link na Bio / Perfil
export async function renderScreen7(): Promise<string> {
  return createScreenshotCanvas(
    'Link na Bio & Hub de Acesso Rápido',
    'Centralizador de canais oficiais, últimas edições e contato direto no WhatsApp.',
    (ctx, sx, sy, sw, sh) => {
      // Perfil do Link na Bio
      const cx = sx + sw / 2

      // Avatar da marca
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, sy + 80, 60, 0, Math.PI * 2)
      ctx.fillStyle = '#EA580C'
      ctx.fill()
      ctx.strokeStyle = '#FED7AA'
      ctx.lineWidth = 4
      ctx.stroke()
      ctx.restore()

      drawBrandLogoBox(ctx, cx - 110, sy + 160, 220, 80, 12)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '800 22px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('@revistamodaatual', cx, sy + 275)

      ctx.fillStyle = '#94A3B8'
      ctx.font = '400 16px sans-serif'
      ctx.fillText('A sua vitrine de negócios de moda no Brasil', cx, sy + 305)
      ctx.textAlign = 'left'

      // Botões de link vertical
      const links = [
        { title: '📖 Ler Última Edição Digital (Flipbook)', icon: '★' },
        { title: '🏆 Conhecer o TOP 60 Melhores Marcas', icon: '👑' },
        { title: '💬 Falar com a Redação no WhatsApp', icon: '📱' },
        { title: '📢 Anunciar na Revista (Portal de Mídia)', icon: '💼' },
        { title: '👗 Quero Minha Foto na Capa da Revista', icon: '✨' },
      ]

      links.forEach((l, idx) => {
        const ly = sy + 345 + idx * 82
        roundRect(ctx, sx + 40, ly, sw - 80, 68, 16)
        ctx.fillStyle = '#0F172A'
        ctx.fill()
        ctx.strokeStyle = idx === 0 ? '#EA580C' : '#334155'
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = '700 17px sans-serif'
        ctx.fillText(l.title, sx + 65, ly + 42)
      })
    },
  )
}

// 8. Segurança e Privacidade com Selos (LGPD)
export async function renderScreen8(): Promise<string> {
  return createScreenshotCanvas(
    'Segurança & Conformidade LGPD',
    'Proteção avançada de dados corporativos, auditoria contínua e criptografia.',
    (ctx, sx, sy, sw, sh) => {
      // Header de Segurança
      roundRect(ctx, sx + 30, sy + 20, sw - 60, 160, 20)
      ctx.fillStyle = '#0F172A'
      ctx.fill()
      ctx.strokeStyle = '#22C55E'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#22C55E'
      ctx.font = '800 22px sans-serif'
      ctx.fillText('🛡️ Conformidade Rigorosa LGPD', sx + 55, sy + 65)

      ctx.fillStyle = '#FFFFFF'
      ctx.font = '400 16px sans-serif'
      ctx.fillText(
        'Privacidade integral para assinantes, confecções e anunciantes.',
        sx + 55,
        sy + 100,
      )
      ctx.fillText('Criptografia TLS 1.3 ponta a ponta e auditoria de acessos.', sx + 55, sy + 130)

      // 4 Pilares de Segurança
      const pilares = [
        {
          title: 'Isolamento de Credenciais',
          desc: 'Nenhum token ou credencial sensível é armazenado no navegador ou cache local.',
          icon: '🔐',
        },
        {
          title: 'Proteção de Leads Comerciais',
          desc: 'Dados de vendas (sales_leads) protegidos contra scraping e acesso não autorizado.',
          icon: '🏢',
        },
        {
          title: 'Service Worker Seguro',
          desc: 'Cache estrito de assets públicos da casca do app. Sem retenção de dados dinâmicos.',
          icon: '⚡',
        },
        {
          title: 'Direito do Titular Assegurado',
          desc: 'Canais abertos e ágeis para exclusão, anonimização e portabilidade de dados.',
          icon: '📋',
        },
      ]

      pilares.forEach((p, idx) => {
        const py = sy + 210 + idx * 125
        roundRect(ctx, sx + 30, py, sw - 60, 110, 16)
        ctx.fillStyle = '#0B0F17'
        ctx.fill()
        ctx.strokeStyle = '#1E293B'
        ctx.stroke()

        ctx.fillStyle = '#EA580C'
        ctx.font = '800 18px sans-serif'
        ctx.fillText(`${p.icon}  ${p.title}`, sx + 50, py + 42)

        ctx.fillStyle = '#94A3B8'
        ctx.font = '400 14px sans-serif'
        ctx.fillText(p.desc, sx + 50, py + 75)
      })
    },
  )
}

/**
 * Catálogo completo dos 10 arquivos para download
 */
export const STORE_ASSETS_CATALOG: GeneratedAsset[] = [
  {
    id: 'feature-graphic',
    name: 'Feature Graphic (Banner da Loja)',
    filename: '00_feature_graphic_1024x500.png',
    category: 'feature',
    width: 1024,
    height: 500,
    description: 'Banner principal para o cabeçalho da página na Google Play Store (1024x500)',
    render: renderFeatureGraphic,
  },
  {
    id: 'app-icon',
    name: 'Ícone em Alta Resolução',
    filename: '01_icon_512x512.png',
    category: 'icon',
    width: 512,
    height: 512,
    description: 'Ícone de alta fidelidade para a listagem da loja (512x512)',
    render: renderAppIcon,
  },
  {
    id: 'screen-1',
    name: 'Captura 1 — Onboarding & Acesso',
    filename: '02_screen_01_onboarding_login_1080x1920.png',
    category: 'screenshot',
    width: 1080,
    height: 1920,
    description: 'Mockup 9:16 da tela de onboarding e login corporativo seguro',
    render: renderScreen1,
  },
  {
    id: 'screen-2',
    name: 'Captura 2 — Leitor Flipbook Interativo',
    filename: '03_screen_02_flipbook_leitor_1080x1920.png',
    category: 'screenshot',
    width: 1080,
    height: 1920,
    description: 'Mockup 9:16 do leitor de revista flipbook com hotspots de produtos',
    render: renderScreen2,
  },
  {
    id: 'screen-3',
    name: 'Captura 3 — TOP 60 Melhores Marcas',
    filename: '04_screen_03_top60_marcas_1080x1920.png',
    category: 'screenshot',
    width: 1080,
    height: 1920,
    description: 'Mockup 9:16 do ranking oficial de marcas do atacado brasileiro',
    render: renderScreen3,
  },
  {
    id: 'screen-4',
    name: 'Captura 4 — Pipeline V MODA',
    filename: '05_screen_04_pipeline_vmoda_1080x1920.png',
    category: 'screenshot',
    width: 1080,
    height: 1920,
    description: 'Mockup 9:16 da gestão comercial e avanço de leads de vendas',
    render: renderScreen4,
  },
  {
    id: 'screen-5',
    name: 'Captura 5 — Eventos & Coluna Social',
    filename: '06_screen_05_eventos_coluna_social_1080x1920.png',
    category: 'screenshot',
    width: 1080,
    height: 1920,
    description: 'Mockup 9:16 da cobertura de desfiles e semanas de moda',
    render: renderScreen5,
  },
  {
    id: 'screen-6',
    name: 'Captura 6 — Dashboard Administrativo',
    filename: '07_screen_06_dashboard_admin_1080x1920.png',
    category: 'screenshot',
    width: 1080,
    height: 1920,
    description: 'Mockup 9:16 do painel com métricas editoriais e engajamento',
    render: renderScreen6,
  },
  {
    id: 'screen-7',
    name: 'Captura 7 — Link na Bio & Perfil',
    filename: '08_screen_07_link_na_bio_1080x1920.png',
    category: 'screenshot',
    width: 1080,
    height: 1920,
    description: 'Mockup 9:16 da central de links rápidos e matérias em destaque',
    render: renderScreen7,
  },
  {
    id: 'screen-8',
    name: 'Captura 8 — Segurança & LGPD',
    filename: '09_screen_08_seguranca_lgpd_1080x1920.png',
    category: 'screenshot',
    width: 1080,
    height: 1920,
    description: 'Mockup 9:16 dos selos de proteção de dados e privacidade LGPD',
    render: renderScreen8,
  },
]
