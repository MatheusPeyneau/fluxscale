# AgênciaOS - PRD

## Visão Geral
Plataforma de automação para agências de marketing digital. Sistema completo com módulos de:
- Pipeline de Vendas (Kanban)
- Gestão de Leads
- Clientes
- Operacional (Tarefas)
- Financeiro
- RH
- WhatsApp (Agentes + Webhook de Leads)
- Conteúdo (Carrossel IA)
- Configurações (webhooks N8N, integrações)

## Arquitetura
- **Frontend**: React + TailwindCSS + shadcn/ui + @dnd-kit (drag & drop)
- **Backend**: FastAPI + MongoDB (Motor async)
- **Auth**: JWT + Google OAuth (Emergent Auth)

---

## O que foi implementado

### [2026-03] Feature: Mapeamento dinâmico de origens nos webhooks
- `normalize_source()` centralizada no backend — mapeia qualquer valor recebido no campo `source` para as origens canônicas do CRM
- Todos os endpoints (`/api/webhook/whatsapp-lead`, `/api/webhook/instagram-lead`, `/api/webhook/lead`) respeitam o campo `source` do payload
- Valor padrão por endpoint: WhatsApp → "whatsapp", Instagram → "instagram", Genérico → "outro"
- Mapeamento completo: "Formulário"/"formulario"/"form" → "formulario" | "indicação"/"indicacao"/"referral" → "indicacao" | "whatsapp" → "whatsapp" | "instagram" → "instagram" | "google"→"google" | "manual"→"manual"
- Todos os endpoints retornam `source` normalizado na resposta para facilitar debug/N8N
- "Formulário" adicionado ao dropdown de origens no frontend Leads.jsx

### [2026-03] Feature: Click-to-edit Leads + Instagram webhook + Nova Etapa + Reunião Pipeline

**1. Leads — edição por célula (click-to-edit):**
- Clicar em qualquer célula de texto (nome, email, telefone, empresa, valor, CPF/CNPJ, score) ativa input inline com autoFocus
- Enter/blur → salva via PUT; Escape → cancela sem salvar
- Células de Select (status, origem, cobrança) renderizadas como badges clicáveis que abrem dropdown inline e auto-salvam no onValueChange
- Lápis abre modal full-edit (notas, data de vencimento, score, etc.)
- **Bug corrigido**: SelectTrigger com asChild causava crash — removido asChild, usando CSS [&>svg]:hidden

**2. Leads — Webhook Instagram:**
- `POST /api/webhook/instagram-lead` (público, sem auth)
- Cria lead com source="instagram"; instagram_handle e mensagem salvos nas notas

**3. Pipeline — Nova Etapa:**
- Botão "+ Nova Etapa" dentro do modal "Gerenciar Pipeline"
- Dialog com: nome, color picker (8 cores), toggle "Etapa de fechamento (ganho)", toggle "Etapa de reunião"
- Nova coluna aparece imediatamente no kanban; is_meeting_stage e is_won_stage persistidos

**4. Pipeline — Agendamento de Reunião:**
- Arrastar deal para coluna is_meeting_stage (ou nome contém "reunião") pausa o movimento e abre dialog
- Dialog: título (pré-preenchido), email do lead (pré-preenchido), data, hora início (auto-soma +1h para término), notas
- Cancelar → deal volta para etapa original; Confirmar → move deal + salva meeting_date/email + chama POST /api/webhook/meeting-schedule (público)

**5. Configurações — Webhook de Reuniões:**
- Seção "Webhook de Reuniões (Google Calendar)" com campo URL N8N + toggle ativo/inativo
- Payload enviado ao N8N contém: dealId, contactName, email, meetingTitle, meetingDate, startTime, endTime, notes, scheduledAt

**Testes**: Backend 100% (11/11), Frontend 95% (DnD para reunião não automatizável) — Iteração 9

**Auto-criação de cliente ao fechar negócio:**
- Modal de configuração de cada coluna do Pipeline ganhou toggle "Etapa de Negócio Fechado (Ganho)"
- Quando ativo: ao arrastar qualquer deal para essa coluna, o sistema cria automaticamente um cliente na aba Clientes com todos os dados (nome, email, phone, CPF/CNPJ, billing_type, valor, vencimento, notas)
- Deduplicação: mover o mesmo deal novamente para a etapa "ganho" retorna o cliente já existente sem criar duplicata
- Toast com link direto "Ver Clientes" aparece no Pipeline confirmando a criação
- Coluna marcada como "ganho" exibe ícone de troféu e borda verde

**Edição inline na tabela de Leads:**
- Clicar no ícone de lápis ativa modo de edição direto na linha da tabela (sem abrir modal)
- Todos os campos viram inputs/selects editáveis: Nome, Email, Telefone, Empresa, CPF/CNPJ, Cobrança, Valor, Origem, Status, Score
- Botão verde (check) salva via PUT /api/leads/{id}; botão cinza (X) cancela sem salvar

**Testes**: Backend 100% (9/9), Frontend 100% — Iteração 8

**Campos adicionados ao Lead** (iguais ao Pipeline):
- `cpf_cnpj` — CPF ou CNPJ
- `billing_type` — Tipo de cobrança: BOLETO / CREDIT_CARD / PIX
- `value` — Valor do negócio (R$)
- `due_date` — Data de vencimento

**Tabela de Leads** expandida com novas colunas: Contato (email+phone), CPF/CNPJ, Cobrança, Valor

**Modal de Leads** reorganizado em 3 seções: Identificação · Dados Financeiros · Classificação

**add_lead_to_pipeline** atualizado: ao enviar lead para o pipeline, o deal herda automaticamente `email`, `phone`, `cpf_cnpj`, `billing_type`, `value` e `due_date`

**Testes**: Backend 100% (7/7), Frontend 100% — Iteração 7

**Funcionalidades:**

1. **Ícone de engrenagem em cada coluna** do Kanban:
   - Abre modal com campo URL do webhook N8N + toggle ativo/desativo por coluna
   - Preview do payload que será enviado
   - Configuração salva no MongoDB (campo `webhook_url`, `webhook_enabled` na coluna)

2. **Disparo automático no drag & drop**:
   - Ao soltar um card em uma coluna com webhook ativo, dispara POST automaticamente
   - Payload exato: `{ name, cpfCnpj, email, mobilePhone, billingType, value, dueDate }`
   - Feedback visual no card: ícone verde (sucesso) ou vermelho (erro) por 8 segundos

3. **Novos campos no Deal**:
   - `cpfCnpj` (CPF ou CNPJ) — editável no drawer e modal de criação
   - `billingType` (BOLETO / CREDIT_CARD / PIX) — select no drawer e modal de criação
   - `dueDate` (data de vencimento) — editável no drawer

4. **Histórico de disparos** no drawer do lead:
   - Seção expansível com logs de cada disparo
   - Mostra: coluna destino, status (sucesso/erro), código HTTP, timestamp

5. **Novos endpoints backend**:
   - `PUT /api/pipeline/stages/{id}/webhook` — salva config de webhook por coluna
   - `POST /api/pipeline/deals/{id}/fire-webhook` — dispara e registra o webhook
   - `GET /api/pipeline/deals/{id}/webhook-logs` — histórico de disparos

**Testes**: Backend 100% (9/9), Frontend 100% — Iteração 6

**Funcionalidades:**

1. **Página WhatsApp** (`/whatsapp`):
   - Listagem de agentes com status visual (ativo/parado)
   - Botão Ativar/Parar por agente (chama N8N webhook se configurado)
   - Criar, editar e deletar agentes
   - Cards com nome, descrição, número WhatsApp, status N8N
   - Exibição da URL de recepção para configurar no N8N
   - Botão copiar URL de recepção

2. **Endpoint público (sem autenticação)**:
   - `POST /api/webhook/whatsapp-lead`
   - Payload: `{ name, phone, message, source }`
   - Cria Lead automaticamente com `source="whatsapp"`, `status="novo"`, `notes=message`
   - Verificável na aba Leads com origem "whatsapp"

3. **Seção WhatsApp em Configurações**:
   - URL de inbound (read-only, para copiar e colar no N8N)
   - Campo de webhook de controle (opcional, chamado ao ativar/parar agentes)
   - Toggle ativo/inativo

4. **Backend — novos endpoints**:
   - `GET/POST /api/whatsapp/agents`
   - `PATCH /api/whatsapp/agents/{id}`
   - `POST /api/whatsapp/agents/{id}/toggle`
   - `DELETE /api/whatsapp/agents/{id}`
   - `GET/PUT /api/settings/whatsapp-webhook`
   - `POST /api/webhook/whatsapp-lead` (público, sem auth)

**Testes**: Backend 100% (9/9), Frontend 100% — Iteração 5

**Arquivos modificados:**
- `/app/backend/server.py` — +120 linhas: modelos WhatsApp, 7 endpoints
- `/app/frontend/src/pages/whatsapp/Whatsapp.jsx` — criado (página completa)
- `/app/frontend/src/components/Sidebar.jsx` — item WhatsApp adicionado
- `/app/frontend/src/App.js` — rota /whatsapp adicionada
- `/app/frontend/src/pages/configuracoes/Configuracoes.jsx` — WhatsAppWebhookSection

---

### [2026-03] Melhoria: Seletor multi-provedor no Agente 1 + UI de chaves única

- **Agente 1** agora aceita qualquer provedor (Perplexity com pesquisa web real-time, ou OpenAI/Anthropic/Gemini/Groq com base em treinamento)
- **Configurações** redesenhado: pills de provedor clicáveis + único campo de input contextual + botão salvar por provedor

---

### [2026-03] Feature: Gerador de Carrossel Multi-Agente para Instagram

**4 agentes sequenciais com aprovação do usuário em cada etapa:**

1. **Agente 1 — Pesquisador de Notícias** (Perplexity)
2. **Agente 2 — Estrategista de Temas** (LLM configurável)
3. **Agente 3 — Copywriter** (LLM configurável)
4. **Agente 4 — Designer HTML** (LLM configurável)

---

### [2025-03] Feature: Dashboard Estratégico Redesenhado
- Alertas Inteligentes, KPIs Financeiros, Funil de Conversão, Saúde Operacional, Origem + Valor

---

## Funcionalidades Existentes
- Kanban board com drag & drop entre etapas
- Criar/deletar/editar deals
- Gerenciar etapas do pipeline
- Leads com status tracking e origem WhatsApp
- Gestão completa de clientes
- Integração webhook N8N para novos clientes
- Geração de carrossel de conteúdo via agentes IA
- Tarefas operacionais por cliente com template
- Sistema de colaboradores
- Dashboard principal estratégico

---

## Backlog / Próximas Tarefas (P0/P1/P2)

### P0 - Crítico
- (Nada pendente)

### P1 - Importante
- **Publicação no Instagram via API** (após aprovação do carrossel)
- Filtros no Pipeline (por etapa, valor, data)
- Exportar leads/deals em CSV
- Histórico de atividades por deal
- **Histórico de conversas WhatsApp por lead** (expandir módulo WhatsApp)

### P2 - Melhorias
- Refatorar `server.py` em routers modulares (~1970 linhas)
- Relatórios de conversão do pipeline
- Integração de email diretamente pelo app
- Bulk actions nos deals
- Notificação em tempo real quando WhatsApp lead chega

---

## Credenciais de Teste
- Email: testuser@agencia.com
- Senha: Test1234!
