import { supabase } from "@/lib/supabase"
import { auditService } from "./auditService"
import { type PatientDocument } from "@/types"

export const documentService = {
    async getByPatient(patientId: string) {
        const { data, error } = await supabase
            .from('documentos')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as PatientDocument[]
    },

    async getAll() {
        const { data, error } = await supabase
            .from('documentos')
            .select('*, pacientes ( nome )')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as (PatientDocument & { pacientes?: { nome: string } })[]
    },

    async upload(patientId: string, file: File) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const { data: userProfile } = await supabase
            .from('usuarios')
            .select('clinica_id')
            .eq('id', user.id)
            .single()

        const clinica_id = userProfile?.clinica_id
        if (!clinica_id) throw new Error("ID da clínica não encontrado.")

        // 1. Upload to Storage
        const filePath = `${clinica_id}/${patientId}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
            .from('medical-records')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('medical-records')
            .getPublicUrl(filePath)

        // 3. Save to database
        const { data, error } = await supabase
            .from('documentos')
            .insert([{
                clinica_id: clinica_id,
                patient_id: patientId,
                user_id: user.id,
                nome: file.name,
                tipo: file.type,
                url: publicUrl
            }])
            .select()
            .single()

        if (error) throw error

        // Log audit
        await auditService.log('upload_document', 'document', data.id, { new_data: data })

        return data as PatientDocument
    },

    async delete(id: string, url: string) {
        const pathMatch = url.match(/medical-records\/(.*)/)
        const path = pathMatch ? pathMatch[1] : null

        if (path) {
            await supabase.storage
                .from('medical-records')
                .remove([path])
        }

        const { error } = await supabase
            .from('documentos')
            .delete()
            .eq('id', id)

        if (error) throw error

        // Log audit
        await auditService.log('delete_document', 'document', id, { old_data: { id, url } })

        return true
    }
}
