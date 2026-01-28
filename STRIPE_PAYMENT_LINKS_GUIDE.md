# 🛒 Guia Rápido: Criar Payment Links no Stripe

## 🎯 Objetivo
Criar links de pagamento de teste no Stripe para habilitar o checkout de demonstração.

## 📋 Passo a Passo

### 1️⃣ Acessar Stripe Dashboard
1. Acesse: https://dashboard.stripe.com/test/products
2. Certifique-se de estar em **modo de teste** (canto superior direito)

### 2️⃣ Criar Produtos

#### **Plano Básico**
1. Clique em **"+ Adicionar produto"**
2. Preencha:
   - **Nome:** Básico
   - **Descrição:** Plano básico para clínicas pequenas
   - **Preço:** R$ 99,00
   - **Cobrança:** Recorrente - Mensal
3. Clique em **"Salvar produto"**
4. **Copie o Price ID** (ex: `price_1ABC123xyz`)

#### **Plano Profissional**
1. Clique em **"+ Adicionar produto"**
2. Preencha:
   - **Nome:** Profissional
   - **Descrição:** Plano profissional com recursos avançados
   - **Preço:** R$ 199,00
   - **Cobrança:** Recorrente - Mensal
3. Clique em **"Salvar produto"**
4. **Copie o Price ID** (ex: `price_2DEF456xyz`)

#### **Plano Enterprise**
1. Clique em **"+ Adicionar produto"**
2. Preencha:
   - **Nome:** Enterprise
   - **Descrição:** Plano enterprise com suporte dedicado
   - **Preço:** R$ 399,00
   - **Cobrança:** Recorrente - Mensal
3. Clique em **"Salvar produto"**
4. **Copie o Price ID** (ex: `price_3GHI789xyz`)

### 3️⃣ Criar Payment Links

Para cada produto criado:

1. Acesse: https://dashboard.stripe.com/test/payment-links
2. Clique em **"+ Novo"**
3. Selecione o produto
4. Configure:
   - **Permitir ajuste de quantidade:** NÃO
   - **Coletar endereço de cobrança:** SIM
   - **URL de sucesso:** `https://seu-dominio.com/dashboard/billing?success=true`
   - **URL de cancelamento:** `https://seu-dominio.com/dashboard/billing?canceled=true`
5. Clique em **"Criar link"**
6. **Copie o link** (ex: `https://buy.stripe.com/test_abc123xyz`)

### 4️⃣ Atualizar o Código

Abra `src/pages/dashboard/Billing.tsx` e atualize a linha 66:

```typescript
const paymentLinks: Record<string, string> = {
    'price_1ABC123xyz': 'https://buy.stripe.com/test_abc123xyz', // Básico
    'price_2DEF456xyz': 'https://buy.stripe.com/test_def456xyz', // Profissional
    'price_3GHI789xyz': 'https://buy.stripe.com/test_ghi789xyz'  // Enterprise
}
```

### 5️⃣ Atualizar Price IDs

Abra `src/lib/stripe-config.ts` e atualize os `priceId`:

```typescript
BASIC: {
    id: 'basic',
    name: 'Básico',
    price: 9900,
    priceId: 'price_1ABC123xyz', // ← Cole aqui
    interval: 'month',
    // ...
},
PRO: {
    id: 'pro',
    name: 'Profissional',
    price: 19900,
    priceId: 'price_2DEF456xyz', // ← Cole aqui
    interval: 'month',
    // ...
},
ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 39900,
    priceId: 'price_3GHI789xyz', // ← Cole aqui
    interval: 'month',
    // ...
}
```

### 6️⃣ Descomentar Código de Produção

Em `src/pages/dashboard/Billing.tsx`, substitua o código de demo (linhas 73-82) por:

```typescript
// Use payment links
const paymentLink = paymentLinks[priceId]
if (paymentLink) {
    window.location.href = paymentLink
} else {
    throw new Error('Payment link not found')
}
```

## 🧪 Testar Checkout

### Cartões de Teste Stripe

**Sucesso:**
- Número: `4242 4242 4242 4242`
- Data: Qualquer data futura
- CVV: Qualquer 3 dígitos
- CEP: Qualquer CEP

**Falha:**
- Número: `4000 0000 0000 0002`

**3D Secure:**
- Número: `4000 0025 0000 3155`

### Fluxo de Teste

1. Acesse `/dashboard/billing`
2. Clique em **"Assinar"** em qualquer plano
3. Será redirecionado para Stripe Checkout
4. Use cartão de teste: `4242 4242 4242 4242`
5. Complete o pagamento
6. Será redirecionado de volta com `?success=true`

## 🔔 Configurar Webhooks (Opcional)

Para receber notificações de pagamento:

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em **"+ Adicionar endpoint"**
3. URL: `https://seu-projeto.supabase.co/functions/v1/stripe-webhook`
4. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copie o **Webhook Secret**
6. Configure nas Edge Functions

## ✅ Checklist Final

- [ ] Produtos criados no Stripe
- [ ] Payment Links criados
- [ ] Price IDs atualizados em `stripe-config.ts`
- [ ] Payment Links atualizados em `Billing.tsx`
- [ ] Código de produção descomentado
- [ ] Testado com cartão 4242
- [ ] Webhooks configurados (opcional)

## 🎉 Pronto!

Agora o checkout de teste está 100% funcional!

---

**Tempo estimado:** 15 minutos  
**Dificuldade:** Fácil  
**Custo:** Gratuito (modo teste)
