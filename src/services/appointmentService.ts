import { supabase } from "@/lib/supabase"
import { auditService } from "./auditService"
import { emailService } from "./emailService"



export const appointmentService = {
    async getAll() {
        const { data, error } = await supabase
            .from('atendimentos')
            .select('*, paciente:pacientes(nome)')
            .order('data_hora', { ascending: true })

        if (error) throw error
        return data as any[]
    },

    async create(appointment: { patient_id: string, date: string, type: string, notes?: string, status: string }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("User not authenticated")

        const { data: userProfile } = await supabase
            .from('usuarios')
            .select('clinica_id')
            .eq('id', user.id)
            .single()

        const clinica_id = userProfile?.clinica_id

        const { data, error } = await supabase
            .from('atendimentos')
            .insert([{
                clinica_id: clinica_id,
                paciente_id: appointment.patient_id,
                usuario_id: user.id,
                data_hora: appointment.date,
                status: appointment.status,
                tipo: appointment.type,
                observacoes: appointment.notes
            }])
            .select()
            .single()

        if (error) throw error

        // Log audit and Notify Patient (non-blocking)
        try {
            await auditService.log('create', 'appointment', data.id, { new_data: data })

            // Fetch Patient Email and Clinic Name for notification
            const { data: contactData } = await supabase
                .from('pacientes')
                .select('nome, email')
                .eq('id', appointment.patient_id)
                .single()

            const { data: clinicData } = await supabase
                .from('clinicas')
                .select('nome')
                .eq('id', clinica_id)
                .single()

            if (contactData?.email) {
                emailService.sendAppointmentConfirmation(
                    contactData.email,
                    contactData.nome,
                    appointment.date,
                    appointment.type,
                    clinicData?.nome || 'ClinicOps'
                ).catch(console.error)
            }
        } catch (notifierError) {
            console.warn('Post-creation notification/audit failed:', notifierError)
        }

        return data
    },

    async update(id: string, appointment: { patient_id: string, date: string, type: string, notes?: string, status: string }) {
        const { data: oldData } = await supabase.from('atendimentos').select('*').eq('id', id).single()

        const { data, error } = await supabase
            .from('atendimentos')
            .update({
                paciente_id: appointment.patient_id,
                data_hora: appointment.date,
                tipo: appointment.type,
                observacoes: appointment.notes,
                status: appointment.status
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // Log audit (non-blocking)
        try {
            await auditService.log('update', 'appointment', id, { old_data: oldData, new_data: data })
        } catch (auditError) {
            console.warn('Audit log failed:', auditError)
        }

        return data
    },

    async updateStatus(id: string, status: string) {
        const { data: oldData } = await supabase.from('atendimentos').select('*').eq('id', id).single()

        const { data, error } = await supabase
            .from('atendimentos')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        // Log audit (non-blocking)
        try {
            await auditService.log('update_status', 'appointment', id, { old_data: oldData, new_data: data })
        } catch (auditError) {
            console.warn('Audit log failed:', auditError)
        }

        return data
    },

    async delete(id: string) {
        const { data: oldData } = await supabase.from('atendimentos').select('*').eq('id', id).single()

        const { error } = await supabase
            .from('atendimentos')
            .delete()
            .eq('id', id)

        if (error) throw error

        // Log audit (non-blocking)
        try {
            await auditService.log('delete', 'appointment', id, { old_data: oldData })
        } catch (auditError) {
            console.warn('Audit log failed:', auditError)
        }

        return true
    }
}
