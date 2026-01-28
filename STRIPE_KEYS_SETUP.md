# 🔑 Configuração das Chaves Stripe

## ✅ Chave Publicável Configurada

A chave publicável já foi adicionada ao arquivo `.env`:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SuMNoICPXTnQsweQQTD88eDh0FoyCPF1djewdc4WgSs8pQV9K4lNwgPLQXh9ZiWRQMHW6pKvn8Mp1uXWFGhaQx700xZra0OPL
```

## 🔐 Chave Secreta (Para Edge Functions)

A chave secreta **NÃO** deve ser adicionada ao `.env` do frontend. Ela deve ser configurada nas Edge Functions do Supabase.

### **Sua Chave Secreta:**
```
sk_test_51SuMNoICPXTnQsweWY2UHmz58mwSrPbDdiNnrExkII5Z6k31OOJ1IXPmYvF56oHvdE9wBWDRqiilPC5qMtzT33N700usPEdFi8
```

### **Como Configurar no Supabase:**

#### **Opção 1: Via Dashboard (Recomendado)**

1. Acesse: https://supabase.com/dashboard/project/cxyqvgvekfmwyytwxhxr/settings/functions
2. Vá em **Edge Functions** → **Secrets**
3. Clique em **Add Secret**
4. Nome: `STRIPE_SECRET_KEY`
5. Valor: `sk_test_51SuMNoICPXTnQsweWY2UHmz58mwSrPbDdiNnrExkII5Z6k31OOJ1IXPmYvF56oHvdE9wBWDRqiilPC5qMtzT33N700usPEdFi8`
6. Clique em **Save**

#### **Opção 2: Via CLI**

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SuMNoICPXTnQsweWY2UHmz58mwSrPbDdiNnrExkII5Z6k31OOJ1IXPmYvF56oHvdE9wBWDRqiilPC5qMtzT33N700usPEdFi8
```

## 🚀 Próximos Passos

### **1. Reiniciar o Servidor de Desenvolvimento**

Para que a nova variável de ambiente seja carregada:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### **2. Criar Produtos no Stripe**

1. Acesse: https://dashboard.stripe.com/test/products
2. Crie 3 produtos:
   - **Básico** - R$ 99/mês
   - **Profissional** - R$ 199/mês
   - **Enterprise** - R$ 399/mês

### **3. Criar Payment Links**

Para cada produto:
1. Acesse: https://dashboard.stripe.com/test/payment-links
2. Clique em **+ Novo**
3. Selecione o produto
4. Configure URLs de sucesso/cancelamento
5. Copie o link gerado

### **4. Atualizar Código**

Em `src/lib/stripe-config.ts`, atualize os `priceId`:

```typescript
BASIC: {
    priceId: 'price_SEU_ID_AQUI', // ← Cole o Price ID do produto Básico
    // ...
},
PRO: {
    priceId: 'price_SEU_ID_AQUI', // ← Cole o Price ID do produto Pro
    // ...
},
ENTERPRISE: {
    priceId: 'price_SEU_ID_AQUI', // ← Cole o Price ID do produto Enterprise
    // ...
}
```

Em `src/pages/dashboard/Billing.tsx`, descomente e atualize (linhas 67-91):

```typescript
const paymentLinks: Record<string, string> = {
    'price_SEU_ID_BASICO': 'https://buy.stripe.com/test_SEU_LINK_1',
    'price_SEU_ID_PRO': 'https://buy.stripe.com/test_SEU_LINK_2',
    'price_SEU_ID_ENTERPRISE': 'https://buy.stripe.com/test_SEU_LINK_3'
}

const paymentLink = paymentLinks[priceId]
if (paymentLink) {
    window.location.href = paymentLink
} else {
    throw new Error('Payment link not configured')
}
```

### **5. Testar Checkout**

1. Acesse `/dashboard/billing`
2. Clique em **Assinar**
3. Será redirecionado para Stripe Checkout
4. Use cartão de teste: `4242 4242 4242 4242`

## 🔒 Segurança

### **✅ Boas Práticas:**

- ✅ Chave publicável no `.env` (frontend)
- ✅ Chave secreta no Supabase Secrets (backend)
- ✅ `.env` no `.gitignore`
- ✅ Nunca commitar chaves secretas

### **⚠️ Importante:**

- A chave secreta **NUNCA** deve estar no código frontend
- Use apenas em Edge Functions ou backend
- Rotacione as chaves se forem expostas

## 📊 Status Atual

| Item | Status |
|------|--------|
| Chave Publicável | ✅ Configurada |
| Chave Secreta | ⏳ Aguardando Edge Functions |
| Produtos Stripe | ⏳ Pendente criação |
| Payment Links | ⏳ Pendente criação |
| Edge Functions | ⏳ Pendente deploy |

## 🎯 Modo Atual

**Demonstração:** O sistema está em modo demo. Os botões "Assinar" mostram toasts informativos.

**Para Ativar:** Siga os passos acima para configurar produtos e payment links reais.

---

**Chaves configuradas com sucesso!** 🎉  
**Próximo passo:** Reiniciar o servidor (`npm run dev`)
