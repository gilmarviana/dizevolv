import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { appointmentService, type Appointment } from "@/services/appointmentService"
import { patientService, type Patient } from "@/services/patientService"
import {
    Plus,
    Calendar,
    Clock,
    User,
    MoreHorizontal,
    Loader2,
    CalendarCheck,
    Trash2,
    CheckCircle2,
    XCircle,
    FileText,
    ShieldAlert,
    RefreshCw
} from "lucide-react"

import { usePermission } from "@/contexts/PermissionContext"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const formSchema = z.object({
    patient_id: z.string().min(1, { message: "Selecione um paciente" }),
    date: z.string().min(1, { message: "Data e hora são obrigatórias" }),
    type: z.string().min(2, { message: "Tipo de atendimento é obrigatório" }),
    notes: z.string().optional(),
})

// Helper to convert local datetime input to UTC for storage
function convertLocalToUTC(localDateTimeString: string): string {
    // Parse the input as local time (São Paulo)
    const localDate = new Date(localDateTimeString)
    // Return as ISO string (UTC)
    return localDate.toISOString()
}

// Helper to convert UTC datetime from database to local for form editing
function convertUTCToLocal(utcDateTimeString: string): string {
    // Parse UTC datetime
    const utcDate = new Date(utcDateTimeString)
    // Get local datetime components
    const year = utcDate.getFullYear()
    const month = String(utcDate.getMonth() + 1).padStart(2, '0')
    const day = String(utcDate.getDate()).padStart(2, '0')
    const hours = String(utcDate.getHours()).padStart(2, '0')
    const minutes = String(utcDate.getMinutes()).padStart(2, '0')
    // Return in format for datetime-local input (YYYY-MM-DDTHH:mm)
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function Appointments() {
    const { can, loading: loadingPermissions } = usePermission()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { patient_id: "", date: "", type: "Consulta Geral", notes: "" },
    })

    useEffect(() => {
        loadData()
    }, [])

    // Reset form when modal opens/closes or editing changes
    useEffect(() => {
        if (isModalOpen && editingAppointment) {
            // Populate form with editing data - convert UTC to local time
            form.reset({
                patient_id: editingAppointment.paciente_id,
                date: convertUTCToLocal(editingAppointment.data_hora),
                type: editingAppointment.tipo,
                notes: editingAppointment.observacoes || ""
            })
        } else if (!isModalOpen) {
            // Reset to defaults when closing
            form.reset({ patient_id: "", date: "", type: "Consulta Geral", notes: "" })
            setEditingAppointment(null)
        }
    }, [isModalOpen, editingAppointment, form])

    async function loadData() {
        try {
            setLoading(true)
            const [appointmentsData, patientsData] = await Promise.all([
                appointmentService.getAll(),
                patientService.getAll()
            ])

            setPatients(patientsData)

            // If no appointments exist and we have patients, create sample appointments
            if (appointmentsData.length === 0 && patientsData.length > 0) {
                await createSampleAppointments(patientsData)
                // Reload the page to clear any cached data and fetch fresh appointments
                window.location.reload()
                return
            }

            // Filter out any mock appointments that might still be in the data
            const realAppointments = appointmentsData.filter(apt => !apt.id.startsWith('mock-'))
            setAppointments(realAppointments)
        } catch (error) {
            toast.error("Erro ao carregar dados.")
        } finally {
            setLoading(false)
        }
    }


    async function createSampleAppointments(patients: Patient[]) {
        const appointmentTypes = [
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
        ]

        const statuses: Appointment['status'][] = ['scheduled', 'confirmed', 'scheduled', 'confirmed', 'completed', 'scheduled']
        const now = new Date()

        try {
            // Create 15 sample appointments
            const promises = []
            for (let i = 0; i < 15; i++) {
                const daysOffset = Math.floor(i / 3)
                const hourOffset = (i % 3) * 2 + 8

                const appointmentDate = new Date(now)
                appointmentDate.setDate(now.getDate() + daysOffset)
                appointmentDate.setHours(hourOffset, 0, 0, 0)

                const randomPatient = patients[i % patients.length]
                const randomType = appointmentTypes[i % appointmentTypes.length]
                const randomStatus = statuses[i % statuses.length]

                promises.push(
                    appointmentService.create({
                        patient_id: randomPatient.id,
                        date: appointmentDate.toISOString(),
                        type: randomType,
                        status: randomStatus,
                        notes: i % 4 === 0 ? 'Paciente solicitou horário prioritário' : undefined
                    } as any)
                )
            }

            await Promise.all(promises)
            toast.success("15 agendamentos de exemplo foram criados!")
        } catch (error) {
            console.error("Erro ao criar agendamentos de exemplo:", error)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true)
        try {
            // Convert local datetime to UTC for storage
            const utcDate = convertLocalToUTC(values.date)

            if (editingAppointment) {
                // Update existing appointment
                await appointmentService.update(editingAppointment.id, {
                    ...values,
                    date: utcDate,
                    status: editingAppointment.status
                } as any)
                toast.success("Agendamento atualizado com sucesso!")
            } else {
                // Create new appointment
                await appointmentService.create({
                    ...values,
                    date: utcDate,
                    status: 'scheduled'
                } as any)
                toast.success("Agendamento realizado com sucesso!")
            }
            form.reset()
            setIsModalOpen(false)
            setEditingAppointment(null)
            loadData()
        } catch (error) {
            toast.error(editingAppointment ? "Erro ao atualizar agendamento." : "Erro ao salvar agendamento.")
        } finally {
            setSubmitting(false)
        }
    }

    function handleEdit(appointment: Appointment) {
        setEditingAppointment(appointment)
        setIsModalOpen(true)
    }

    function handleCloseModal() {
        setIsModalOpen(false)
        setEditingAppointment(null)
        form.reset()
    }

    async function handleStatusChange(id: string, status: Appointment['status']) {
        // Safety check for any lingering mock data
        if (id.startsWith('mock-')) {
            toast.warning("Dados inválidos detectados. Recarregue a página.")
            return
        }
        try {
            await appointmentService.updateStatus(id, status)
            toast.success(`Status atualizado para ${status === 'confirmed' ? 'Confirmado' : status === 'cancelled' ? 'Cancelado' : 'Concluído'}`)
            loadData()
        } catch (error) {
            toast.error("Erro ao atualizar status.")
        }
    }

    async function handleDelete(id: string) {
        // Safety check for any lingering mock data
        if (id.startsWith('mock-')) {
            toast.warning("Dados inválidos detectados. Recarregue a página.")
            return
        }
        if (!confirm("Remover este agendamento permanentemente?")) return
        try {
            await appointmentService.delete(id)
            toast.success("Agendamento removido.")
            loadData()
        } catch (error) {
            toast.error("Erro ao remover agendamento.")
        }
    }

    if (loading || loadingPermissions) {
        return (
            <div className="flex items-center justify-center p-8 h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!can('appointments', 'view')) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-muted-foreground">
                <ShieldAlert className="h-16 w-16 mb-4 text-red-400" />
                <h2 className="text-xl font-bold">Acesso Negado</h2>
                <p>Você não tem permissão para visualizar este módulo.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground/80">Agenda Clínica</h1>
                    <p className="text-muted-foreground/80 font-medium">Gestão de horários, consultas e procedimentos.</p>
                </div>
                <div className="flex gap-3">
                    {can('appointments', 'create') && (
                        <Button onClick={() => setIsModalOpen(true)} className="rounded-full font-bold px-8 bg-primary medical-shadow h-12">
                            <Plus className="mr-2 h-5 w-5" />
                            Novo Agendamento
                        </Button>
                    )}
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="rounded-full font-bold px-6 h-12"
                        title="Recarregar dados"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Modal for Create/Edit */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="sm:max-w-[600px] glass border-none medical-shadow">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-primary">
                            {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                        </DialogTitle>
                        <DialogDescription className="font-semibold text-muted-foreground/60">
                            {editingAppointment ? 'Atualize as informações do agendamento' : 'Selecione o paciente e defina o tipo de atendimento'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                            <FormField
                                control={form.control}
                                name="patient_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">Paciente</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl bg-white/50 border-primary/10">
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl medical-shadow border-none">
                                                {patients.map(p => (
                                                    <SelectItem key={p.id} value={p.id} className="rounded-xl font-bold">{p.nome}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">Data e Hora</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" className="h-12 rounded-xl bg-white/50 border-primary/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">Procedimento</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Consulta, Retorno, Exame" className="h-12 rounded-xl bg-white/50 border-primary/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">Observações (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Notas adicionais..." className="h-12 rounded-xl bg-white/50 border-primary/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" className="flex-1 h-12 rounded-full font-bold" disabled={submitting}>
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingAppointment ? "Salvar Alterações" : "Agendar Agora")}
                                </Button>
                                <Button type="button" variant="ghost" className="h-12 rounded-full font-bold px-6" onClick={handleCloseModal}>Cancelar</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Card className="glass border-none medical-shadow overflow-hidden">
                <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground/70">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                        Próximos Atendimentos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                            <p className="text-sm font-bold text-primary/30 uppercase tracking-[0.2em]">Sincronizando Agenda</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-primary/5">
                                <TableRow className="border-none">
                                    <TableHead className="py-5 px-8 font-bold text-xs uppercase text-primary/60">Horário</TableHead>
                                    <TableHead className="font-bold text-xs uppercase text-primary/60">Paciente / Tipo</TableHead>
                                    <TableHead className="font-bold text-xs uppercase text-primary/60">Status</TableHead>
                                    <TableHead className="text-right py-5 px-8 font-bold text-xs uppercase text-primary/60">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground/30 font-bold italic">
                                                <Calendar className="h-12 w-12 mb-2" />
                                                Nenhum agendamento para exibir.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    appointments.map((apt) => (
                                        <TableRow key={apt.id} className="group hover:bg-white/60 transition-colors border-primary/5">
                                            <TableCell className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/5 p-2.5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                        <Clock className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-foreground/70">{format(new Date(apt.data_hora), "dd 'de' MMM", { locale: ptBR })}</p>
                                                        <p className="text-xs font-bold text-muted-foreground/50 uppercase">{format(new Date(apt.data_hora), "HH:mm'h'")}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-foreground/70 flex items-center gap-2">
                                                        <User className="h-3 w-3 text-primary/40" />
                                                        {apt.paciente?.nome || 'N/A'}
                                                    </p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{apt.tipo}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={apt.status} />
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                                                            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl medical-shadow border-none">
                                                        <DropdownMenuLabel className="px-3 pt-2 text-[10px] uppercase font-extrabold text-muted-foreground/40">Controle de Fluxo</DropdownMenuLabel>
                                                        {can('appointments', 'edit') && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-bold cursor-pointer py-2.5"
                                                                    onClick={() => handleEdit(apt)}
                                                                >
                                                                    <FileText className="h-4 w-4 mr-3 text-blue-500" /> Editar Agendamento
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-primary/5" />
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-bold cursor-pointer py-2.5"
                                                                    onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4 mr-3 text-green-500" /> Confirmar Presença
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-bold cursor-pointer py-2.5"
                                                                    onClick={() => handleStatusChange(apt.id, 'completed')}
                                                                >
                                                                    <CalendarCheck className="h-4 w-4 mr-3 text-primary" /> Finalizar Atendimento
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-amber-600 rounded-xl font-bold cursor-pointer py-2.5 focus:bg-amber-50"
                                                                    onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-3" /> Cancelar Horário
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {can('appointments', 'delete') && (
                                                            <>
                                                                <DropdownMenuSeparator className="bg-primary/5" />
                                                                <DropdownMenuItem
                                                                    className="text-destructive rounded-xl font-bold cursor-pointer py-2.5 focus:bg-destructive/5"
                                                                    onClick={() => handleDelete(apt.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-3" /> Remover da Agenda
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function StatusBadge({ status }: { status: Appointment['status'] }) {
    const configs = {
        scheduled: { label: 'Agendado', bg: 'bg-primary/10', text: 'text-primary' },
        confirmed: { label: 'Confirmado', bg: 'bg-green-100', text: 'text-green-700' },
        cancelled: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-700' },
        completed: { label: 'Concluído', bg: 'bg-gray-100', text: 'text-gray-700' },
    }
    const config = configs[status]
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    )
}
