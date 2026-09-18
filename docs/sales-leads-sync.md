# Especificação de Sincronização Cruzada: Agente de IA de Vendas (`sales_leads`)

**Projeto Dono da Base Central (Single Source of Truth):** Revista Moda Atual  
**Projeto Parceiro:** V MODA BRASIL  
**Autenticação Compartilhada:** Secret `VMODA_SYNC_TOKEN`

---

## 📌 URLs Base Testadas e Acesso à API

> ⚠️ **ATENÇÃO CRÍTICA SOBRE A URL BASE:**
> O domínio público da SPA (`https://revista-moda-atual-e-v-moda-brasil-34dee.goskip.app`) serve o HTML/JavaScript do frontend para requisições de página e rotas não interceptadas.
> Para chamadas de API do projeto externo V MODA BRASIL ou de serviços backend, utilize a **URL interna direta do PocketBase**:

| Ambiente / Destino                          | URL Base Recomendada                                                          | Observações                                                                                                                                      |
| ------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Backend PocketBase Direto (Recomendado)** | `https://revista-moda-atual-e-v-moda-brasil-34dee.shrd00.internal.goskip.dev` | Serve diretamente as rotas de API em `/backend/v1/*` sem passar pelo roteador SPA.                                                               |
| **Domínio Público / App (Fallback)**        | `https://revista-moda-atual-e-v-moda-brasil-34dee.goskip.app`                 | Pode ser usado desde que a rota seja exatamente `/backend/v1/sales/leads`. Em caso de 200 com HTML (SPA), faça fallback para a URL direta acima. |

---

## 🔐 Autenticação e Headers

Todas as requisições enviadas pelo V MODA BRASIL devem incluir o token compartilhado usando **qualquer um** dos headers abaixo:

1. **Header dedicado:**
   ```http
   x-sync-token: <VMODA_SYNC_TOKEN>
   ```
2. **Header padrão Bearer:**
   ```http
   Authorization: Bearer <VMODA_SYNC_TOKEN>
   ```

_(Nota: Nenhum secret novo foi criado. O valor reutiliza exatamente o mesmo token já configurado entre ambos os projetos)._

---

## 📋 Schema da Coleção `sales_leads`

| Campo                   | Tipo   | Obrigatório | Descrição / Valores Aceitos                                                                 |
| ----------------------- | ------ | :---------: | ------------------------------------------------------------------------------------------- |
| `id`                    | text   |    auto     | ID único do lead gerado pelo PocketBase (ex: `15 caracteres`)                               |
| `marca`                 | text   |   **Sim**   | Nome da marca / empresa prospectada                                                         |
| `categoria`             | text   |     Não     | Categoria comercial (ex: `moda-feminina`, `jeanswear`, etc.)                                |
| `porte`                 | text   |     Não     | Porte da marca (ex: `pequeno`, `medio`, `grande`)                                           |
| `regiao`                | text   |     Não     | Região / Estado / Polo de atacado (ex: `Sudeste`, `Brás/SP`, `Maringá/PR`)                  |
| `contato_nome`          | text   |     Não     | Nome do decisor ou contato comercial                                                        |
| `contato_email`         | text   |     Não     | E-mail corporativo de contato                                                               |
| `contato_whatsapp`      | text   |     Não     | Número de WhatsApp ou telefone formatado                                                    |
| `prioridade`            | select |     Não     | `baixa` \| `media` \| `alta` \| `maxima` (padrão: `media`)                                  |
| `status`                | select |     Não     | `novo` \| `abordado` \| `em_negociacao` \| `fechado` \| `perdido` (padrão: `novo`)          |
| `etapa_atual`           | text   |     Não     | Etapa no funil comercial (ex: `abordagem`, `proposta`, `⭐ Oferta Upgrade V MODA BRASIL`)   |
| `canal`                 | text   |     Não     | Canal de origem / prospecção (ex: `whatsapp`, `instagram`, `painel_vmoda`, `email`)         |
| `historico_contatos`    | json   |     Não     | Array de interações: `[{ "data": "ISO", "canal": "...", "resumo": "...", "autor": "..." }]` |
| `data_ultimo_contato`   | date   |     Não     | Timestamp ISO da última interação                                                           |
| `data_proximo_followup` | date   |     Não     | Timestamp ISO agendado para o próximo contato                                               |
| `id_top60`              | text   |     Não     | ID da marca na coleção `top60_brands` da Revista Moda Atual                                 |
| `id_marketplace`        | text   |     Não     | ID da marca na coleção `sales_brands` do V MODA BRASIL                                      |
| `created`               | date   |    auto     | Timestamp de criação                                                                        |
| `updated`               | date   |    auto     | Timestamp da última atualização                                                             |

---

## 🔄 Mapeamento Oficial de Status entre os Projetos

| Status em `sales_leads` (Revista) | Status em `sales_brands` (V MODA BRASIL) | Significado Comercial                          |
| --------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| `novo`                            | `novo` (ou `prospeccao`)                 | Lead identificado, aguardando primeiro contato |
| `abordado`                        | `contatada`                              | Primeiro contato / apresentação enviado        |
| `em_negociacao`                   | `em_negociacao`                          | Proposta comercial e valores em discussão      |
| `fechado`                         | `FECHADO`                                | Contrato fechado (TOP 60 + Oferta Upgrade)     |
| `perdido`                         | `perdido`                                | Oportunidade declinada ou sem interesse        |

---

## 🚀 Endpoints da API

### 1. `GET /backend/v1/sales/leads`

Consulta a base central de leads com suporte a filtros combináveis.

- **Comportamento quando NENHUM filtro é informado:** Retorna todos os leads (com paginação padrão `limit=50`, `offset=0`), sem erro de expressão vazia.
- **Parâmetros de Query Opcionais:**
  - `status`: filtra por status (`novo`, `abordado`, `em_negociacao`, `fechado`, `perdido`)
  - `prioridade`: filtra por prioridade (`baixa`, `media`, `alta`, `maxima`)
  - `categoria`: filtra pela categoria da marca
  - `etapa_atual`: filtra pela etapa comercial
  - `regiao`: filtra por região
  - `canal`: filtra pelo canal de contato
  - `data_proximo_followup`: busca por data exata (formato `YYYY-MM-DD` ou ISO)
  - `data_proximo_followup_from` / `data_proximo_followup_to`: intervalo de datas
  - `limit`: quantidade máxima de registros (padrão: 50, máx: 500)
  - `offset`: deslocamento de paginação (padrão: 0)
  - `sort`: ordenação (ex: `-created`, `marca`, `-data_proximo_followup`)

#### Exemplo de Requisição:

```http
GET /backend/v1/sales/leads?status=abordado&limit=10 HTTP/1.1
Host: revista-moda-atual-e-v-moda-brasil-34dee.shrd00.internal.goskip.dev
x-sync-token: vmoda_sync_revistamodaatual_2026_sec
Accept: application/json
```

#### Exemplo de Resposta (HTTP 200):

```json
{
  "success": true,
  "items": [
    {
      "id": "mkt_lead_123456",
      "marca": "Colcci Premium",
      "categoria": "moda-feminina",
      "porte": "grande",
      "regiao": "Sul/Sudeste",
      "contato_nome": "Juliana Costa",
      "contato_email": "juliana.costa@colcci.com.br",
      "contato_whatsapp": "+55 11 98765-4321",
      "prioridade": "maxima",
      "status": "abordado",
      "etapa_atual": "abordagem",
      "canal": "whatsapp",
      "historico_contatos": [
        {
          "data": "2026-03-30T10:00:00.000Z",
          "canal": "whatsapp",
          "resumo": "Apresentação da Revista e do ecossistema V MODA enviada",
          "autor": "ia_vendas"
        }
      ],
      "data_ultimo_contato": "2026-03-30 10:00:00.000Z",
      "data_proximo_followup": "2026-04-02 14:00:00.000Z",
      "id_top60": "top60_colcci",
      "id_marketplace": "vm-brand-001",
      "created": "2026-03-30 09:00:00.000Z",
      "updated": "2026-03-30 10:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

---

### 2. `POST /backend/v1/sales/leads` (Upsert Sem Duplicidade)

Cria um novo lead ou retorna o registro existente se já houver correspondência.

- **Regra de Deduplicação / Upsert:**
  1. Se `marca` + `id_marketplace` já existir, **não duplica**: retorna **HTTP 200** com `created: false` e os dados do registro existente.
  2. Na ausência de `id_marketplace`, se `marca` + `id_top60` já existir, também retorna **HTTP 200** com `created: false`.
  3. Se nenhum dos identificadores acima colidir, o registro é criado e retorna **HTTP 201** com `created: true`.
- **Campo obrigatório:** `marca`.

#### Exemplo de Requisição (Criando ou Verificando):

```http
POST /backend/v1/sales/leads HTTP/1.1
Host: revista-moda-atual-e-v-moda-brasil-34dee.shrd00.internal.goskip.dev
x-sync-token: vmoda_sync_revistamodaatual_2026_sec
Content-Type: application/json

{
  "marca": "Reserva Osklen Jeans",
  "categoria": "moda-masculina",
  "prioridade": "alta",
  "status": "em_negociacao",
  "etapa_atual": "apresentacao",
  "contato_nome": "Marcos Santos",
  "contato_email": "marcos.santos@grupoarzz.com.br",
  "contato_whatsapp": "+55 21 99999-8888",
  "id_marketplace": "vm-brand-003"
}
```

#### Resposta de Criação (HTTP 201):

```json
{
  "success": true,
  "created": true,
  "message": "Lead de vendas cadastrado com sucesso",
  "data": {
    "id": "lead_abc12345678",
    "marca": "Reserva Osklen Jeans",
    "status": "em_negociacao",
    ...
  }
}
```

#### Resposta de Deduplicação (HTTP 200):

```json
{
  "success": true,
  "created": false,
  "message": "Lead já existente na base central (duplicidade evitada)",
  "data": {
    "id": "lead_abc12345678",
    "marca": "Reserva Osklen Jeans",
    "status": "em_negociacao",
    ...
  }
}
```

---

### 3. `PATCH /backend/v1/sales/leads/{id}`

Atualização cirúrgica de campos do lead e anexação ao histórico.

- **Campos Aceitos:**
  - `status`: `novo`, `abordado`, `em_negociacao`, `fechado`, `perdido`
  - `etapa_atual`: string
  - `prioridade`: `baixa`, `media`, `alta`, `maxima`
  - `canal`: string
  - `porte`: string
  - `regiao`: string
  - `contato_nome`: string
  - `contato_email`: string
  - `contato_whatsapp`: string
  - `data_ultimo_contato`: date/ISO string
  - `data_proximo_followup`: date/ISO string
  - `historico_contatos_add`: objeto único `{ data, canal, resumo, autor }` para anexação ao histórico existente.
- **Campos Proibidos (Erro 400 Descritivo):**
  - `marca`, `id_top60`, `id_marketplace`. Tentativas de modificar esses campos retornam erro 400 explicando que campos de identidade são imutáveis após a criação.

#### Exemplo de Requisição (PATCH):

```http
PATCH /backend/v1/sales/leads/lead_abc12345678 HTTP/1.1
Host: revista-moda-atual-e-v-moda-brasil-34dee.shrd00.internal.goskip.dev
x-sync-token: vmoda_sync_revistamodaatual_2026_sec
Content-Type: application/json

{
  "status": "fechado",
  "etapa_atual": "⭐ Oferta Upgrade V MODA BRASIL",
  "data_ultimo_contato": "2026-03-30 18:30:00.000Z",
  "historico_contatos_add": {
    "data": "2026-03-30T18:30:00.000Z",
    "canal": "painel_vmoda",
    "resumo": "Fechamento aprovado pelo cliente. Iniciando onboarding.",
    "autor": "agente_vmoda"
  }
}
```

#### Resposta de Sucesso (HTTP 200):

```json
{
  "success": true,
  "message": "Lead de vendas atualizado com sucesso",
  "data": {
    "id": "lead_abc12345678",
    "marca": "Reserva Osklen Jeans",
    "status": "fechado",
    "etapa_atual": "⭐ Oferta Upgrade V MODA BRASIL",
    ...
  }
}
```

---

## ⏱️ Regra de Polling e Boas Práticas

1. **Limite de Polling:** No máximo **1 requisição por minuto** para rotas de listagem (`GET /backend/v1/sales/leads`), garantindo performance e evitando consumo excessivo de quota e concorrência.
2. **Fallback Gracioso:** Qualquer falha temporária de rede ou indisponibilidade deve ser tratada no cliente sem interromper a interface com o usuário.
3. **Rollback de Schema (Isolamento):** A coleção `sales_leads` foi criada de forma totalmente isolada na migration `0138_create_sales_leads.js`. Nenhuma tabela pré-existente foi alterada ou afetada.
