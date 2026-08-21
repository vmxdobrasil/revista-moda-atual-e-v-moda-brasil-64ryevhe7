routerAdd('POST', '/backend/v1/ai/chat', (e) => {
  try {
    const body = e.requestInfo().body || {}
    const rawMessages = body.messages || []

    const messages = []
    messages.push({
      role: 'system',
      content:
        'Você é a Editora de Moda e Assistente Virtual oficial da REVISTA MODA ATUAL (e V MODA BRASIL). ' +
        'Seu objetivo é orientar leitores, lojistas, confecções, estilistas e marcas sobre tendências de moda, ' +
        'mercado atacadista de moda brasileiro, desfiles, produções editoriais, o guia TOP 60 marcas e oportunidades ' +
        'de anúncio na revista digital. ' +
        'Seja elegante, acolhedora, concisa, informativa e sempre em tom profissional e inspirador. ' +
        'Responda em Português do Brasil.',
    })

    if (Array.isArray(rawMessages)) {
      for (let i = 0; i < rawMessages.length; i++) {
        const m = rawMessages[i]
        if (m && m.role && m.content) {
          messages.push({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: String(m.content),
          })
        }
      }
    } else if (body.message) {
      messages.push({
        role: 'user',
        content: String(body.message),
      })
    }

    // Call Skip AI fast model
    const completion = $ai.chat({
      model: 'fast',
      messages: messages,
    })

    const replyContent =
      completion && completion.choices && completion.choices[0] && completion.choices[0].message
        ? completion.choices[0].message.content
        : 'Olá! Estou aqui para ajudar com qualquer dúvida sobre moda, mercado atacadista e tendências da Revista Moda Atual.'

    return e.json(200, {
      message: {
        role: 'assistant',
        content: replyContent,
      },
    })
  } catch (err) {
    $app.logger().error('AI chat endpoint error', 'error', String(err))
    return e.json(200, {
      message: {
        role: 'assistant',
        content:
          'Olá! Tivemos uma oscilação momentânea na conexão com a inteligência artificial, mas você pode explorar nossas edições digitais e conferir as tendências no catálogo da Revista Moda Atual!',
      },
    })
  }
})
