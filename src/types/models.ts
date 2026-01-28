export interface Patient {
    id: string
    nome: string
    cpf?: string
    data_nascimento?: string
    telefone?: string
    email?: string
    lgpd_consent?: boolean
    consent_date?: string
}

export interface Appointment {
    id: string
    clinica_id: string
    paciente_id: string
    usuario_id: string
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
    tipo: string
    observacoes?: string
    data_hora: string
    created_at: string
    paciente?: {
        nome: string
    }
}

export interface ClinicUser {
    id: string
    clinica_id: string
    role: string
    nome: string
    email: string
    created_at: string
}

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

export interface Profile {
    id: string
    clinica_id: string | null
    clinica_nome?: string
    clinica_status?: string
    clinica_trial_ends?: string
    role: string
    nome: string
    email: string
}

export interface PatientDocument {
    id: string
    clinica_id: string
    patient_id: string
    user_id: string
    nome: string
    tipo: string
    url: string
    created_at: string
}
