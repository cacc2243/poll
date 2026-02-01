

# Plano: Sistema de Assinaturas Recorrentes (Semanal, Mensal, Anual)

## Resumo

Implementar um sistema completo de assinaturas para as extensões (Lovable, V0, Manus), mantendo os produtos auxiliares (Google AI Ultra, Metodo Conta PRO) como compra unica. O sistema incluira controle de renovacao, suspensao automatica por falta de pagamento, nova aba no painel admin para gerenciamento, e notificacao na extensao quando o plano expirar.

---

## Estrutura de Precos

| Produto | Semanal | Mensal | Anual |
|---------|---------|--------|-------|
| **Lovable** | R$ 49,90 | R$ 69,90 | R$ 309,90 |
| **V0** | R$ 39,90 | R$ 59,90 | R$ 299,90 |
| **Manus** | R$ 39,90 | R$ 59,90 | R$ 299,90 |

**Compra Unica (sem recorrencia):**
- Metodo Conta PRO Lovable: R$ 39,90
- Metodo Google AI Ultra: R$ 47,90

---

## Arquitetura do Sistema

```text
+-------------------+     +-------------------+     +------------------+
|   Checkout        |     |   subscriptions   |     |   licenses       |
|   (Frontend)      |---->|   (Nova Tabela)   |---->|   (Existente)    |
+-------------------+     +-------------------+     +------------------+
                                   |
                                   v
                          +-------------------+
                          | subscription_     |
                          | payments          |
                          | (Historico)       |
                          +-------------------+
                                   |
                                   v
                          +-------------------+
                          |  Cron Job         |
                          |  (Verificacao     |
                          |   diaria)         |
                          +-------------------+
```

---

## Secao Tecnica

### 1. Novas Tabelas no Banco de Dados

#### Tabela `subscriptions`
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_document TEXT,
  customer_phone TEXT,
  
  -- Produto e Plano
  product_type TEXT NOT NULL, -- 'lovable', 'v0', 'manus'
  plan_type TEXT NOT NULL,    -- 'weekly', 'monthly', 'yearly'
  amount INTEGER NOT NULL,     -- Valor em centavos
  
  -- Status da Assinatura
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'suspended'
  
  -- Datas importantes
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  next_billing_date TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  
  -- Vinculo com licenca
  license_id UUID REFERENCES licenses(id),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Tabela `subscription_payments` (Historico de Pagamentos)
```sql
CREATE TABLE public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id),
  transaction_id UUID REFERENCES transactions(id),
  
  amount INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'paid', 'pending', 'failed'
  
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2. Modificacoes no Checkout

**Arquivo:** `src/pages/Checkout.tsx`

- Adicionar selecao de plano (Semanal/Mensal/Anual) para produtos de extensao
- Atualizar configuracao de produtos com os novos precos
- Calcular `period_end` baseado no tipo de plano selecionado
- Enviar `plan_type` e `product_type` para o endpoint `create-pix`

### 3. Edge Functions

#### `create-pix/index.ts` (Modificacao)
- Receber novos campos: `plan_type`, `product_type`
- Salvar informacoes do plano na transacao

#### `pixup-webhook/index.ts` (Modificacao)
- Ao confirmar pagamento de produto de extensao:
  - Criar registro na tabela `subscriptions`
  - Criar registro inicial em `subscription_payments`
  - Vincular com a licenca gerada
  - Definir `current_period_end` e `next_billing_date`

#### Nova: `check-subscription-expiry/index.ts`
- Cron job diario que:
  1. Busca assinaturas com `current_period_end < now()` e `status = 'active'`
  2. Suspende a licenca vinculada (`status = 'suspended'`)
  3. Atualiza `subscription.status = 'expired'`
  4. Registra log da acao

#### Nova: `admin-subscriptions/index.ts`
- CRUD completo para gerenciamento de assinaturas
- Listar assinaturas com filtros (status, produto, cliente)
- Cancelar/reativar assinaturas manualmente
- Ver historico de pagamentos

### 4. Painel Admin - Nova Aba "Assinaturas"

**Arquivo:** `src/components/admin/SubscriptionsTab.tsx`

Funcionalidades:
- Cards de resumo: Total Ativas, Expiradas, Canceladas, MRR (Receita Recorrente)
- Tabela com todas as assinaturas mostrando:
  - Cliente (nome/email)
  - Produto (Lovable/V0/Manus)
  - Plano (Semanal/Mensal/Anual)
  - Status (badge colorido)
  - Data inicio
  - Proxima renovacao
  - Acoes (ver detalhes, cancelar, reativar)
- Modal de detalhes com:
  - Historico completo de pagamentos
  - Todas as transacoes vinculadas
  - Opcao de estender periodo manualmente

**Arquivo:** `src/pages/Painel.tsx`
- Adicionar nova aba "Assinaturas" com icone de calendario/renovacao

### 5. Modificacao na Extensao

**Arquivos:** `extension-source/background.js`, `popup.js`

Ao validar licenca:
- Endpoint `validate-license-secure` retornara novo campo: `subscription_status`
- Se `subscription_status === 'expired'`:
  - Mostrar tela de "Plano Expirado"
  - Mensagem: "Seu plano expirou. Entre em contato com o suporte para renovar."
  - Botao de WhatsApp para suporte
  - Bloquear funcionalidades principais

### 6. Fluxo de Renovacao

O sistema **nao** fara cobranca automatica (PIX nao suporta recorrencia nativa).

**Fluxo manual:**
1. Cron detecta assinatura expirando
2. Licenca e suspensa automaticamente
3. Extensao mostra aviso para renovar
4. Cliente entra em contato ou acessa link de renovacao
5. Admin pode gerar novo PIX de renovacao
6. Ao pagar, webhook atualiza `subscription_payments` e estende `current_period_end`

---

## Etapas de Implementacao

1. **Banco de Dados**
   - Criar tabela `subscriptions`
   - Criar tabela `subscription_payments`
   - Adicionar RLS policies (deny all public)
   - Criar funcao `calculate_period_end(plan_type)`

2. **Backend (Edge Functions)**
   - Modificar `create-pix` para receber dados do plano
   - Modificar `pixup-webhook` para criar assinaturas
   - Criar `check-subscription-expiry` com cron diario
   - Criar `admin-subscriptions` para CRUD
   - Modificar `validate-license-secure` para retornar status da assinatura

3. **Checkout**
   - Adicionar seletor de plano (cards visuais)
   - Atualizar precos dinamicamente
   - Enviar dados do plano ao backend

4. **Painel Admin**
   - Criar componente `SubscriptionsTab`
   - Adicionar aba no Painel
   - Implementar filtros e acoes

5. **Extensao**
   - Adicionar tratamento para `subscription_status: 'expired'`
   - Criar tela de plano expirado
   - Atualizar ambos diretories (source e obfuscated)

---

## Consideracoes de Seguranca

- Todas as novas tabelas terao RLS bloqueando acesso publico
- Operacoes de assinatura apenas via service_role_key
- Logs de todas as acoes de suspensao/reativacao
- Token JWT do admin para endpoints administrativos

