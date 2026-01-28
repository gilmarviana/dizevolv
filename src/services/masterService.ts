import { supabase } from "@/lib/supabase"

export interface ClinicDetail {
    id: string
    nome: string
    slug: string
    cnpj: string
    status: 'active' | 'suspended' | 'trial'
    plano_id: string
    created_at: string
    plano?: {
        nome: string
    }
}

export interface PlanDetail {
    id: string
    nome: string
    limite_pacientes: number
    preco_mensal: number
    recursos?: Record<string, boolean | string>
}

export const masterService = {
    async getClinics() {
        const { data, error } = await supabase
            .from('clinicas')
            .select(`
                *,
                plano:planos(nome)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as ClinicDetail[]
    },

    async getPlans() {
        const { data, error } = await supabase
            .from('planos')
            .select('*')
            .order('preco_mensal', { ascending: true })

        if (error) {
            console.error("Error fetching plans:", error)
            return []
        }
        return data as PlanDetail[]
    },

    async updateClinicStatus(clinicId: string, status: ClinicDetail['status']) {
        const { data, error } = await supabase
            .from('clinicas')
            .update({ status })
            .eq('id', clinicId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateClinicPlan(clinicId: string, planoId: string) {
        const { data, error } = await supabase
            .from('clinicas')
            .update({ plano_id: planoId })
            .eq('id', clinicId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async savePlan(plan: Partial<PlanDetail>) {
        if (plan.id) {
            const { data, error } = await supabase
                .from('planos')
                .update(plan)
                .eq('id', plan.id)
                .select()
                .single()
            if (error) throw error
            return data
        } else {
            const { data, error } = await supabase
                .from('planos')
                .insert([plan])
                .select()
                .single()
            if (error) throw error
            return data
        }
    },

    async deletePlan(id: string) {
        const { error } = await supabase.from('planos').delete().eq('id', id)
        if (error) throw error
        return true
    },

    async getGlobalStats() {
        const { count: clinicsCount } = await supabase.from('clinicas').select('*', { count: 'exact', head: true })
        const { count: patientsCount } = await supabase.from('pacientes').select('*', { count: 'exact', head: true })
        const { count: usersCount } = await supabase.from('usuarios').select('*', { count: 'exact', head: true })

        return {
            clinics: clinicsCount || 0,
            patients: patientsCount || 0,
            users: usersCount || 0
        }
    }
}
