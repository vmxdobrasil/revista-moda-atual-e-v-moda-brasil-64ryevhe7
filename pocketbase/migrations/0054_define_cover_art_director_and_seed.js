migrate(
  (app) => {
    $ai.agents.define(app, {
      slug: 'cover-editorial-art-director',
      name: 'Cover & Editorial Art Director',
      description:
        'Senior fashion-magazine art director that produces cover designs, editorial layouts, and thumbnails following the magazine Design System.',
      systemPrompt:
        'You are the Cover & Editorial Art Director for Revista MODA ATUAL DIGITAL, a Brazilian fashion magazine and wholesale business hub.\n\nROLE: You are a senior fashion-magazine art director. Your scope is strictly limited to cover design, editorial layouts, and thumbnail generation. You produce visual direction and cover compositions only. You must refuse to execute code, write scripts, or perform non-design tasks.\n\nDESIGN SYSTEM:\n- Primary color: #ea580c (orange)\n- Secondary: #f97316 (light orange)\n- Background: #ffffff / #fff9f5 (cream)\n- Text: #1f2937 / #111827\n- Typography: Serif (Georgia, Playfair Display) for editorial titles; Sans-serif (Inter, Montserrat) for body and UI\n- Brand: V MODA BRASIL, Revista MODA ATUAL\n\nTEMPLATES:\n1. default — Clean single-column layout with full-width images, minimal ornamentation\n2. editorial — Drop-cap first letter, serif typography, generous spacing, justified text\n3. marketing — CTA-focused, gradient backgrounds, bold sans-serif, offer highlight box\n4. holofote — Centered social quotes, warm gradient background, circle portraits, decorative shapes\n5. entrevista — Q&A format, left accent bar, bold uppercase titles, numbered questions\n\nCONSTRAINTS:\n- Always cite the Design System rules and template definitions you reference in your recommendations\n- Cover dimensions: 800x1124px (portrait, 0.7118 aspect ratio)\n- Reels thumbnails: 1080x1920 (vertical, bold text overlay, high contrast, top-third safe zone)\n- YouTube thumbnails: 1280x720 (horizontal, expressive, clear title)\n- Since actual raster image generation is not supported, provide HTML/CSS composition specifications\n\nLANGUAGE: Brazilian Portuguese for content, English for technical design terms.\n\nFORMAT: Structure responses with clear sections:\n1. Conceito — The visual concept and mood\n2. Paleta — Color palette with hex codes\n3. Tipografia — Font recommendations and hierarchy\n4. Composicao — Layout description with positioning\n5. Variacoes — A/B test suggestions for social media',
      tier: 'reasoning',
      tools: [
        { collection: 'editions', perms: { read: true, list: true } },
        { collection: 'edition_pages', perms: { read: true, list: true } },
        { collection: 'visual_templates', perms: { read: true, list: true } },
        { collection: 'delivery_queue', perms: { read: true, list: true } },
        { collection: 'generated_social_content', perms: { read: true, list: true } },
      ],
      memory: [
        {
          type: 'text',
          payload: {
            text: 'DESIGN SYSTEM RULES — Revista MODA ATUAL:\nPrimary: #ea580c (orange)\nSecondary: #f97316 (light orange)\nBackground: #ffffff, #fff9f5 (cream)\nText: #1f2937, #111827\nAccent: #fbbf24 (amber for highlights)\nTypography hierarchy:\n- H1/Editorial titles: Serif (Playfair Display, Georgia) — 48-72px, bold\n- H2/Subtitles: Serif (Lora, Georgia) — 24-36px, medium\n- Body: Sans-serif (Inter, Montserrat) — 16-18px, regular\n- UI/Accents: Sans-serif (Montserrat) — 12-14px, semibold, uppercase tracking\nSpacing: generous, airy layouts with 40-80px section gaps\nCover aspect ratio: 0.7118 (800x1124px portrait)\nBrand mark: "V MODA BRASIL" top-left, "revistaModaAtual.com" bottom',
          },
        },
        {
          type: 'text',
          payload: {
            text: 'TEMPLATE DEFINITIONS — 5 editorial templates:\n1. default: Clean single-column, full-width images, minimal ornamentation, white background, serif section titles, sans-serif body. Composition: header (20%) + image (40%) + body (40%).\n2. editorial: Drop-cap first letter (orange #ea580c, 6xl serif), justified body text, serif titles (Playfair Display), generous line-height, decorative border-bottom under titles. Composition: masthead + drop-cap article + author bio.\n3. marketing: Gradient background (orange-50 to white), CTA button (rounded-full, orange gradient), offer highlight box (left-border orange), bold sans-serif titles. Composition: badge + headline + content + offer box + CTA.\n4. holofote: Warm gradient (#FFF9F5 to #FFF3E8), centered quote icon, circle portrait, italic quoted text, decorative corner shapes. Composition: label + title + centered portrait + quote + editor credit.\n5. entrevista: Left accent bar (orange gradient), bold uppercase interviewee name, numbered Q&A pairs, structured spacing, clean white background. Composition: mic icon + interviewee + intro + numbered Q&A list.',
          },
        },
        {
          type: 'text',
          payload: {
            text: 'THUMBNAIL COMPOSITION GUIDELINES:\nReels (1080x1920 vertical):\n- Bold text overlay in top third (safe zone for UI)\n- High contrast: white text on orange/dark overlay\n- Maximum 5 words on screen\n- Subject centered or slightly upper-third\n- Brand mark bottom-right\n- Font: Montserrat Black, 60-80px\n\nYouTube (1280x720 horizontal):\n- Expressive title left-aligned or centered\n- Face/subject right side, 50% width\n- Orange accent bar or gradient overlay\n- Maximum 6 words, large readable font (48-64px)\n- High saturation, emotional expression\n- Brand mark top-left\n- Font: Montserrat ExtraBold\n\nA/B TEST VARIANTS:\n- Always provide 2 variants per cover\n- Variant A: conventional composition (centered, balanced)\n- Variant B: experimental composition (asymmetric, bold)\n- Test different palette combinations within the design system',
          },
        },
      ],
    })

    var templates = [
      {
        name: 'Layout Padrao',
        slug: 'default',
        template: 'default',
        description: 'Layout limpo de coluna unica com imagens em largura total.',
        palette: {
          primary: '#ea580c',
          secondary: '#f97316',
          background: '#ffffff',
          text: '#1f2937',
        },
        typography: {
          title: 'Georgia, serif',
          body: 'Inter, sans-serif',
          accent: 'Inter, sans-serif',
        },
        composition: {
          layout: 'single-column',
          spacing: 'comfortable',
          image_position: 'full-width',
          header_ratio: '20%',
          image_ratio: '40%',
          body_ratio: '40%',
        },
      },
      {
        name: 'Editorial Premium',
        slug: 'editorial',
        template: 'editorial',
        description: 'Layout editorial sofisticado com drop-cap e tipografia serif.',
        palette: {
          primary: '#ea580c',
          secondary: '#9ca3af',
          background: '#fff9f5',
          text: '#111827',
        },
        typography: {
          title: 'Playfair Display, serif',
          body: 'Lora, serif',
          accent: 'Montserrat, sans-serif',
        },
        composition: {
          layout: 'drop-cap',
          spacing: 'generous',
          image_position: 'float-left',
          drop_cap_color: '#ea580c',
          drop_cap_size: '6xl',
        },
      },
      {
        name: 'Marketing Vibrante',
        slug: 'marketing',
        template: 'marketing',
        description: 'Layout focado em CTA com fundo gradiente e tipografia bold.',
        palette: {
          primary: '#ea580c',
          secondary: '#fbbf24',
          background: 'linear-gradient(135deg, #fff7ed, #ffffff)',
          text: '#1f2937',
        },
        typography: {
          title: 'Montserrat, sans-serif',
          body: 'Inter, sans-serif',
          accent: 'Montserrat, sans-serif',
        },
        composition: {
          layout: 'cta-focused',
          spacing: 'tight',
          image_position: 'background',
          cta_style: 'rounded-full gradient',
          offer_box: 'left-border orange',
        },
      },
      {
        name: 'Holofote Social',
        slug: 'holofote',
        template: 'holofote',
        description: 'Coluna social com citacoes centralizadas e retratos circulares.',
        palette: {
          primary: '#ea580c',
          secondary: '#fcd34d',
          background: 'linear-gradient(to bottom, #fff9f5, #fff3e8)',
          text: '#7c2d12',
        },
        typography: {
          title: 'Cormorant Garamond, serif',
          body: 'Lora, serif',
          accent: 'Montserrat, sans-serif',
        },
        composition: {
          layout: 'centered-quote',
          spacing: 'airy',
          image_position: 'circle-portrait',
          decorative_shapes: 'corner',
        },
      },
      {
        name: 'Entrevista Exclusiva',
        slug: 'entrevista',
        template: 'entrevista',
        description: 'Formato de entrevista com barra de acento e titulos uppercase.',
        palette: {
          primary: '#ea580c',
          secondary: '#f3f4f6',
          background: '#ffffff',
          text: '#111827',
        },
        typography: {
          title: 'Anton, sans-serif',
          body: 'Inter, sans-serif',
          accent: 'Inter, sans-serif',
        },
        composition: {
          layout: 'qa-format',
          spacing: 'structured',
          image_position: 'left-bar',
          accent_bar: 'orange-gradient',
          numbered_questions: true,
        },
      },
    ]

    var vtCol = app.findCollectionByNameOrId('visual_templates')
    templates.forEach(function (t) {
      try {
        app.findFirstRecordByData('visual_templates', 'slug', t.slug)
      } catch (_) {
        var rec = new Record(vtCol)
        rec.set('name', t.name)
        rec.set('slug', t.slug)
        rec.set('template', t.template)
        rec.set('description', t.description)
        rec.set('palette', t.palette)
        rec.set('typography', t.typography)
        rec.set('composition', t.composition)
        app.save(rec)
      }
    })

    var editions = app.findRecordsByFilter('editions', '', '-created', 5, 0)
    var edCol = app.findCollectionByNameOrId('editions')
    var templateSlugs = ['default', 'editorial', 'marketing', 'holofote', 'entrevista']
    var coverDescriptions = [
      'Capa editorial com titulo centralizado sobre imagem de moda em destaque, paleta laranja #ea580c sobre fundo creme',
      'Capa com drop-cap serif e layout editorial premium, tipografia Playfair Display, paleta laranja e cinza',
      'Capa vibrante com CTA em botao arredondado, fundo gradiente laranja, tipografia bold Montserrat',
      'Capa holofote com citacao centralizada e retrato circular, fundo gradiente quente, tipografia Cormorant',
      'Capa de entrevista com nome em uppercase bold, barra de acento laranja, formato Q&A estruturado',
    ]

    while (editions.length < 5) {
      var num = editions.length + 2
      var newEd = new Record(edCol)
      newEd.set('title', 'Edicao Capa ' + num + ': Teste Visual')
      newEd.set('description', 'Edicao de teste para geracao de capas com Design System.')
      newEd.set(
        'cover_url',
        'https://img.usecurling.com/p/800/1124?q=fashion%20magazine%20cover&color=orange',
      )
      app.save(newEd)
      editions.push(newEd)
    }

    editions.forEach(function (ed, i) {
      if (ed.getString('cover_alt_text')) return

      var slug = templateSlugs[i % 5]
      ed.set('cover_alt_text', coverDescriptions[i % 5])
      ed.set('cover_variants', [
        {
          name: 'Variante A',
          description: 'Composicao convencional com titulo centralizado e imagem em destaque',
          palette: ['#ea580c', '#f97316', '#ffffff'],
          template: slug,
        },
        {
          name: 'Variante B',
          description: 'Composicao experimental com titulo lateral e overlay gradiente',
          palette: ['#ea580c', '#9ca3af', '#111827'],
          template: slug,
        },
      ])
      app.save(ed)
    })
  },
  (app) => {
    $ai.agents.delete(app, 'cover-editorial-art-director')
    try {
      var records = app.findRecordsByFilter('visual_templates', '', '', 100, 0)
      records.forEach(function (r) {
        app.delete(r)
      })
    } catch (_) {}
    try {
      var testEds = app.findRecordsByFilter('editions', 'title ~ "Edicao Capa"', '', 10, 0)
      testEds.forEach(function (r) {
        app.delete(r)
      })
    } catch (_) {}
  },
)
