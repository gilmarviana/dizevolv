import { supabase } from "@/lib/supabase"

export const auditService = {
    async log(action: string, entity_type: string, entity_id: string, details?: { old_data?: any, new_data?: any }) {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: userProfile } = await supabase
                .from('usuarios')
                .select('clinica_id')
                .eq('id', user.id)
                .single()

            await supabase
                .from('auditoria')
                .insert([{
                    clinica_id: userProfile?.clinica_id,
                    usuario_id: user.id,
                    acao: action,
                    entidade_tipo: entity_type,
                    entidade_id: entity_id,
                    dados_antigos: details?.old_data,
                    dados_novos: details?.new_data
                }])
        } catch (error) {
            console.error("Failed to log audit event:", error)
        }
    },

    async getClinicLogs() {
        const { data, error } = await supabase
            .from('auditoria')
            .select('*, usuario:usuarios(nome)')
            .order('created_at', { ascending: false })
            .limit(100)

        if (error) throw error
        return data
    }
}
