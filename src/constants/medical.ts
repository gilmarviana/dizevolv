export const APPOINTMENT_TYPES = [
    'Consulta Geral',
    'Retorno',
    'Exame de Rotina',
    'Avaliação Cardiológica',
    'Check-up Completo',
    'Consulta de Urgência',
    'Acompanhamento',
    'Procedimento Cirúrgico',
    'Fisioterapia',
    'Avaliação Nutricional'
] as const

export const APPOINTMENT_STATUS_CONFIG = {
    scheduled: { label: 'Agendado', bg: 'bg-primary/10', text: 'text-primary' },
    confirmed: { label: 'Confirmado', bg: 'bg-green-100', text: 'text-green-700' },
    cancelled: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-700' },
    completed: { label: 'Concluído', bg: 'bg-gray-100', text: 'text-gray-700' },
} as const
