// Stripe configuration
export const STRIPE_CONFIG = {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
}

interface Plan {
    id: string
    name: string
    price: number
    duration?: number
    priceId?: string
    interval?: 'month' | 'year'
    features: string[]
    color: string
    popular?: boolean
}

// Planos disponíveis
export const PLANS: Record<string, Plan> = {
    TRIAL: {
        id: 'trial',
        name: 'Trial',
        price: 0,
        duration: 30, // dias
        features: [
            'Até 50 pacientes',
            'Agendamentos ilimitados',
            'Gestão de documentos',
            'Suporte por email'
        ],
        color: 'yellow'
    },
    BASIC: {
        id: 'basic',
        name: 'Básico',
        price: 9900, // R$ 99.00 em centavos
        priceId: 'price_basic_monthly', // Será criado no Stripe
        interval: 'month',
        features: [
            'Até 200 pacientes',
            'Agendamentos ilimitados',
            'Gestão de documentos',
            'Relatórios básicos',
            'Suporte prioritário'
        ],
        color: 'blue'
    },
    PRO: {
        id: 'pro',
        name: 'Profissional',
        price: 19900, // R$ 199.00 em centavos
        priceId: 'price_pro_monthly',
        interval: 'month',
        features: [
            'Pacientes ilimitados',
            'Agendamentos ilimitados',
            'Gestão de documentos avançada',
            'Relatórios completos',
            'Múltiplos usuários',
            'Integrações',
            'Suporte 24/7'
        ],
        color: 'purple',
        popular: true
    },
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 39900, // R$ 399.00 em centavos
        priceId: 'price_enterprise_monthly',
        interval: 'month',
        features: [
            'Tudo do Profissional',
            'White label',
            'API dedicada',
            'Gerente de conta',
            'SLA garantido',
            'Customizações'
        ],
        color: 'gold'
    }
}

export function formatPrice(priceInCents: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(priceInCents / 100)
}
