import { supabase } from "@/lib/supabase"
import { auditService } from "./auditService"

import { type ClinicUser } from "@/types"

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

        await auditService.log('update_user_role', 'user', userId, { new_data: { role } })

        return data as ClinicUser
    },

    async deleteUser(userId: string) {
        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', userId)

        if (error) throw error

        await auditService.log('delete_user', 'user', userId, { old_data: { id: userId } })

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
                    // @ts-expect-error - Supabase invite implementation might return body in a specific way or just message
                    const body = await error.context?.json()
                    if (body && body.error) {
                        errorMessage = body.error
                    } else {
                        errorMessage = error.message
                    }
                } catch (_e) {
                    errorMessage = error.message
                }
            }

            throw new Error(errorMessage)
        }

        // Log invite (non-blocking)
        await auditService.log('invite_user', 'user', userData.email, { new_data: userData })

        return data
    }
}
