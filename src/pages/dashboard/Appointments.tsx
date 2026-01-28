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
    ShieldAlert
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const formSchema = z.object({
    patient_id: z.string().min(1, { message: "Selecione um paciente" }),
    date: z.string().min(1, { message: "Data e hora são obrigatórias" }),
    type: z.string().min(2, { message: "Tipo de atendimento é obrigatório" }),
    notes: z.string().optional(),
})

export default function Appointments() {
    const { can, loading: loadingPermissions } = usePermission()
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { patient_id: "", date: "", type: "Consulta Geral", notes: "" },
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            const [appointmentsData, patientsData] = await Promise.all([
                appointmentService.getAll(),
                patientService.getAll()
            ])
            setAppointments(appointmentsData)
            setPatients(patientsData)
        } catch (error) {
            toast.error("Erro ao carregar dados da agenda.")
        } finally {
            setLoading(false)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true)
        try {
            await appointmentService.create({
                ...values,
                status: 'scheduled'
            } as any)
            form.reset()
            setIsAdding(false)
            loadData()
            toast.success("Agendamento realizado com sucesso!")
        } catch (error) {
            toast.error("Erro ao salvar agendamento.")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleStatusChange(id: string, status: Appointment['status']) {
        try {
            await appointmentService.updateStatus(id, status)
            toast.success(`Status atualizado para ${status === 'confirmed' ? 'Confirmado' : status === 'cancelled' ? 'Cancelado' : 'Concluído'}`)
            loadData()
        } catch (error) {
            toast.error("Erro ao atualizar status.")
        }
    }

    async function handleDelete(id: string) {
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
                {can('appointments', 'create') && (
                    <Button onClick={() => setIsAdding(!isAdding)} className="rounded-full font-bold px-8 bg-primary medical-shadow h-12">
                        {isAdding ? "Fechar Agendador" : (
                            <>
                                <Plus className="mr-2 h-5 w-5" />
                                Novo Agendamento
                            </>
                        )}
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="glass border-none medical-shadow animate-in slide-in-from-top-6 duration-500">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Novo Horário</CardTitle>
                        <CardDescription className="font-semibold text-muted-foreground/60">Selecione o paciente e defina o tipo de atendimento</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end p-2">
                                <FormField
                                    control={form.control}
                                    name="patient_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">Paciente</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <div className="flex gap-4">
                                    <Button type="submit" className="flex-1 h-12 rounded-full font-bold" disabled={submitting}>
                                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Agendar Agora"}
                                    </Button>
                                    <Button type="button" variant="ghost" className="h-12 rounded-full font-bold px-6" onClick={() => setIsAdding(false)}>Sair</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

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
                                                        <p className="font-black text-foreground/70">{format(new Date(apt.date), "dd 'de' MMM", { locale: ptBR })}</p>
                                                        <p className="text-xs font-bold text-muted-foreground/50 uppercase">{format(new Date(apt.date), "HH:mm'h'")}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-foreground/70 flex items-center gap-2">
                                                        <User className="h-3 w-3 text-primary/40" />
                                                        {apt.paciente?.nome || 'N/A'}
                                                    </p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{apt.type}</p>
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
                                                        <DropdownMenuSeparator className="bg-primary/5" />
                                                        {can('appointments', 'delete') && (
                                                            <DropdownMenuItem
                                                                className="text-destructive rounded-xl font-bold cursor-pointer py-2.5 focus:bg-destructive/5"
                                                                onClick={() => handleDelete(apt.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-3" /> Remover da Agenda
                                                            </DropdownMenuItem>
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
