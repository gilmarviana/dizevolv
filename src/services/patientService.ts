import { supabase } from "@/lib/supabase"
import { auditService } from "./auditService"

export interface Patient {
    id: string
    nome: string
    cpf?: string // Using string for now, could be validated
    data_nascimento?: string
    telefone?: string
    email?: string
    lgpd_consent?: boolean
    consent_date?: string
}

export const patientService = {
    async getAll() {
        // RLS will ensure we only get patients for the user's clinic
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Patient[]
    },

    async create(patient: Omit<Patient, 'id'>) {
        // We need to fetch the clinic_id for the current user first if RLS doesn't auto-handle insertion context
        // But usually RLS policies enforce "can only insert with own clinic_id". 
        // For MVP simplicy, we'll rely on the backend trigger or manual fetch.
        // Let's assume we need to pass clinica_id. 
        // Fetching user profile first:
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        // Fetch user profile to get clinica_id (assuming 'usuarios' table)
        const { data: userProfile } = await supabase
            .from('usuarios')
            .select('clinica_id')
            .eq('id', user.id)
            .single()

        // Fallback or Error if profile doesn't exist (should exist after registration flow)
        // For now, if no profile, we can't create patient properly in multi-tenant strict mode.
        // But let's assume valid flow.

        const clinica_id = userProfile?.clinica_id

        const { data, error } = await supabase
            .from('pacientes')
            .insert([
                { ...patient, clinica_id } // In a real app, ensure clinica_id is mandatory
            ])
            .select()
            .single()

        if (error) throw error

        await auditService.log('create', 'patient', data.id, { new_data: data })

        return data as Patient
    },

    async update(id: string, patient: Partial<Omit<Patient, 'id'>>) {
        // Fetch old data for audit
        const { data: oldData } = await supabase.from('pacientes').select('*').eq('id', id).single()

        const { data, error } = await supabase
            .from('pacientes')
            .update(patient)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        await auditService.log('update', 'patient', id, { old_data: oldData, new_data: data })

        return data as Patient
    },

    async delete(id: string) {
        const { data: oldData } = await supabase.from('pacientes').select('*').eq('id', id).single()

        const { error } = await supabase
            .from('pacientes')
            .delete()
            .eq('id', id)

        if (error) throw error

        await auditService.log('delete', 'patient', id, { old_data: oldData })

        return true
    },

    async exportPatientData(id: string) {
        const { data: patient } = await supabase.from('pacientes').select('*').eq('id', id).single()
        const { data: atendimentos } = await supabase.from('atendimentos').select('*').eq('paciente_id', id)
        const { data: documentos } = await supabase.from('documentos').select('*').eq('patient_id', id)

        const exportData = {
            ...patient,
            atendimentos,
            documentos,
            export_date: new Date(), // Changed from SourceLocation to Date
            compliance: "LGPD - Direito à Portabilidade"
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `paciente-${id}-export.json`
        a.click()

        await auditService.log('export_data', 'patient', id, { new_data: { compliance: 'LGPD Export' } })
    }
}
