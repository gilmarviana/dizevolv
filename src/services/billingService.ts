import { supabase } from "@/lib/supabase"
import { auditService } from "./auditService"

export interface Subscription {
    id: string
    clinica_id: string
    stripe_customer_id: string
    stripe_subscription_id: string
    plan_id: string
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
    created_at: string
    updated_at: string
}

export const billingService = {
    /**
     * Get current subscription for a clinic
     */
    async getCurrentSubscription(clinicaId: string): Promise<Subscription | null> {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('clinica_id', clinicaId)
            .eq('status', 'active')
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
    },

    /**
     * Create checkout session
     */
    async createCheckoutSession(clinicaId: string, priceId: string, successUrl: string, cancelUrl: string) {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                clinica_id: clinicaId,
                price_id: priceId,
                success_url: successUrl,
                cancel_url: cancelUrl
            }
        })

        if (error) throw error

        await auditService.log('billing_checkout', 'subscription', priceId, { new_data: { clinicaId, priceId } })

        return data
    },

    /**
     * Create customer portal session
     */
    async createPortalSession(clinicaId: string, returnUrl: string) {
        const { data, error } = await supabase.functions.invoke('create-portal-session', {
            body: {
                clinica_id: clinicaId,
                return_url: returnUrl
            }
        })

        if (error) throw error

        await auditService.log('billing_portal', 'billing', clinicaId, { new_data: { clinicaId } })

        return data
    },

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId: string) {
        const { data, error } = await supabase.functions.invoke('cancel-subscription', {
            body: {
                subscription_id: subscriptionId
            }
        })

        if (error) throw error

        await auditService.log('cancel_subscription', 'subscription', subscriptionId)

        return data
    },

    /**
     * Update subscription plan
     */
    async updateSubscription(subscriptionId: string, newPriceId: string) {
        const { data, error } = await supabase.functions.invoke('update-subscription', {
            body: {
                subscription_id: subscriptionId,
                new_price_id: newPriceId
            }
        })

        if (error) throw error

        await auditService.log('update_subscription', 'subscription', subscriptionId, { new_data: { newPriceId } })

        return data
    },

    /**
     * Get all subscriptions for a clinic (including history)
     */
    async getSubscriptionHistory(clinicaId: string) {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('clinica_id', clinicaId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    /**
     * Check if clinic is on trial
     */
    async isOnTrial(clinicaId: string): Promise<boolean> {
        const subscription = await this.getCurrentSubscription(clinicaId)
        return subscription?.status === 'trialing' || false
    },

    /**
     * Get days remaining in trial
     */
    async getTrialDaysRemaining(clinicaId: string): Promise<number> {
        const subscription = await this.getCurrentSubscription(clinicaId)
        if (!subscription || subscription.status !== 'trialing') return 0

        const endDate = new Date(subscription.current_period_end)
        const now = new Date()
        const diffTime = endDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return Math.max(0, diffDays)
    }
}
