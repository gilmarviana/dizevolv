import { supabase } from "@/lib/supabase"

export interface ClinicUser {
    id: string
    clinica_id: string
    role: string
    nome: string
    email: string
    created_at: string
}

export const clinicUserService = {
    async getAll() {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .order('nome', { ascending: true })

        if (error) throw error
        return data as ClinicUser[]
    },

    async updateRole(userId: string, role: ClinicUser['role']) {
        const { data, error } = await supabase
            .from('usuarios')
            .update({ role })
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data as ClinicUser
    },

    async deleteUser(userId: string) {
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', userId)

        if (error) throw error
        return true
    },

    async create(userData: { nome: string, email: string, role: ClinicUser['role'] }) {
        // We use an Edge Function to handle the invite (auth.users creation + public.usuarios insert)
        // because we can't create Auth users from the client sidebar without service role
        const { data, error } = await supabase.functions.invoke('invite-user', {
            body: userData
        })

        if (error) {
            console.error("Invite error:", error)
            // Tenta obter mensagem detalhada se disponível
            let errorMessage = "Falha ao criar convite."

            if (error instanceof Error) {
                try {
                    // @ts-ignore - Supabase invite implementation might return body in a specific way or just message
                    const body = await error.context?.json()
                    if (body && body.error) {
                        errorMessage = body.error
                    } else {
                        errorMessage = error.message
                    }
                } catch (e) {
                    errorMessage = error.message
                }
            }

            throw new Error(errorMessage)
        }

        return data
    }
}
