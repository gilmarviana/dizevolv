# 💳 Integração Stripe - Guia de Configuração

## 📋 Visão Geral

Este guia explica como configurar a integração completa do Stripe para gerenciamento de assinaturas e pagamentos no DiZevolv.

## 🔑 Credenciais Stripe

### Ambiente de Desenvolvimento (Test Mode)
- **Publishable Key:** `pk_test_51SuMNoICPXTnQsweX4cqs1JQ3nCs0ZwMLYwmY6yvKdMfMAetzTgm0QLKgfGciAsdozH3i5SAqpK8dD47V6qIAZtO000sFjHVAJ`
- **Secret Key:** `rk_test_51SuMNoICPXTnQsweX4cqs1JQ3nCs0ZwMLYwmY6yvKdMfMAetzTgm0QLKgfGciAsdozH3i5SAqpK8dD47V6qIAZtO000sFjHVAJ`

### Configuração de Variáveis de Ambiente

Adicione ao arquivo `.env`:

```bash
# Stripe Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SuMNoICPXTnQsweX4cqs1JQ3nCs0ZwMLYwmY6yvKdMfMAetzTgm0QLKgfGciAsdozH3i5SAqpK8dD47V6qIAZtO000sFjHVAJ

# Para Edge Functions (Supabase)
STRIPE_SECRET_KEY=rk_test_51SuMNoICPXTnQsweX4cqs1JQ3nCs0ZwMLYwmY6yvKdMfMAetzTgm0QLKgfGciAsdozH3i5SAqpK8dD47V6qIAZtO000sFjHVAJ
```

## 🏗️ Estrutura de Banco de Dados

### Tabela `subscriptions`

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    stripe_customer_id TEXT NOT NULL,
    stripe_subscription_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_subscriptions_clinica_id ON subscriptions(clinica_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their clinic's subscription"
    ON subscriptions FOR SELECT
    USING (clinica_id IN (
        SELECT clinica_id FROM usuarios WHERE id = auth.uid()
    ));
```

## 🔧 Configuração do Stripe Dashboard

### 1. Criar Produtos e Preços

Acesse o [Stripe Dashboard](https://dashboard.stripe.com/test/products) e crie os seguintes produtos:

#### Plano Básico
- **Nome:** Básico
- **Preço:** R$ 99,00/mês
- **ID do Preço:** `price_basic_monthly`

#### Plano Profissional
- **Nome:** Profissional
- **Preço:** R$ 199,00/mês
- **ID do Preço:** `price_pro_monthly`
- **Marcar como:** Popular

#### Plano Enterprise
- **Nome:** Enterprise
- **Preço:** R$ 399,00/mês
- **ID do Preço:** `price_enterprise_monthly`

### 2. Configurar Webhooks

URL do Webhook: `https://[SEU_PROJETO].supabase.co/functions/v1/stripe-webhook`

Eventos para escutar:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## ⚡ Supabase Edge Functions

### Estrutura de Pastas

```
supabase/
└── functions/
    ├── create-checkout-session/
    │   └── index.ts
    ├── create-portal-session/
    │   └── index.ts
    ├── cancel-subscription/
    │   └── index.ts
    ├── update-subscription/
    │   └── index.ts
    └── stripe-webhook/
        └── index.ts
```

### 1. Create Checkout Session

**Arquivo:** `supabase/functions/create-checkout-session/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clinica_id, price_id, success_url, cancel_url } = await req.json()

    // Buscar ou criar customer no Stripe
    const { data: clinica } = await supabaseClient
      .from('clinicas')
      .select('stripe_customer_id, nome, email')
      .eq('id', clinica_id)
      .single()

    let customerId = clinica.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: clinica.email,
        metadata: {
          clinica_id: clinica_id,
        },
      })
      customerId = customer.id

      // Salvar customer ID
      await supabaseClient
        .from('clinicas')
        .update({ stripe_customer_id: customerId })
        .eq('id', clinica_id)
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        clinica_id: clinica_id,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

### 2. Create Portal Session

**Arquivo:** `supabase/functions/create-portal-session/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clinica_id, return_url } = await req.json()

    // Buscar customer ID
    const { data: clinica } = await supabaseClient
      .from('clinicas')
      .select('stripe_customer_id')
      .eq('id', clinica_id)
      .single()

    if (!clinica.stripe_customer_id) {
      throw new Error('Customer not found')
    }

    // Criar sessão do portal
    const session = await stripe.billingPortal.sessions.create({
      customer: clinica.stripe_customer_id,
      return_url: return_url,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

### 3. Stripe Webhook

**Arquivo:** `supabase/functions/stripe-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Criar subscription no banco
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      
      await supabaseClient.from('subscriptions').insert({
        clinica_id: session.metadata.clinica_id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        plan_id: subscription.items.data[0].price.lookup_key || 'basic',
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabaseClient
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
```

## 📝 Deploy das Edge Functions

```bash
# Login no Supabase
supabase login

# Link ao projeto
supabase link --project-ref [SEU_PROJECT_REF]

# Deploy das functions
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy cancel-subscription
supabase functions deploy update-subscription
supabase functions deploy stripe-webhook

# Configurar secrets
supabase secrets set STRIPE_SECRET_KEY=rk_test_51SuMNoICPXTnQsweX4cqs1JQ3nCs0ZwMLYwmY6yvKdMfMAetzTgm0QLKgfGciAsdozH3i5SAqpK8dD47V6qIAZtO000sFjHVAJ
supabase secrets set STRIPE_WEBHOOK_SECRET=[SEU_WEBHOOK_SECRET]
```

## 🧪 Testes

### Cartões de Teste Stripe

- **Sucesso:** `4242 4242 4242 4242`
- **Falha:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

**CVV:** Qualquer 3 dígitos  
**Data:** Qualquer data futura  
**CEP:** Qualquer CEP

## 🚀 Fluxo de Uso

1. **Usuário acessa** `/dashboard/billing`
2. **Seleciona um plano** e clica em "Assinar"
3. **Redirecionado** para Stripe Checkout
4. **Completa o pagamento**
5. **Webhook** atualiza subscription no banco
6. **Redirecionado** de volta com sucesso

## 📊 Monitoramento

- **Stripe Dashboard:** https://dashboard.stripe.com/test/payments
- **Supabase Logs:** https://app.supabase.com/project/[PROJECT]/logs
- **Edge Functions Logs:** https://app.supabase.com/project/[PROJECT]/functions

## 🔒 Segurança

- ✅ Secret keys apenas no backend (Edge Functions)
- ✅ Publishable key pode ser exposta no frontend
- ✅ Webhook signature validation
- ✅ RLS policies no Supabase
- ✅ CORS configurado

## 📚 Recursos

- [Stripe Docs](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Billing Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

---

**Status:** ✅ Configuração pronta para desenvolvimento  
**Próximo Passo:** Criar Edge Functions no Supabase
