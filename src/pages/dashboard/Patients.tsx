import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { patientService, type Patient } from "@/services/patientService"
import {
    Plus,
    Search,
    Phone,
    Mail,
    MoreHorizontal,
    Loader2,
    Users,
    Trash2,
    Edit2,
    FileText,
    UserCheck,
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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { PatientDocuments } from "@/components/dashboard/PatientDocuments"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const formSchema = z.object({
    nome: z.string().min(2, { message: "Nome do paciente é obrigatório" }),
    cpf: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email({ message: "E-mail inválido" }).optional().or(z.literal('')),
})

export default function Patients() {
    const { profile } = useAuth()
    const { can, loading: loadingPermissions } = usePermission()
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
    const [viewingDocs, setViewingDocs] = useState<Patient | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // Delete Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { nome: "", cpf: "", telefone: "", email: "" },
    })

    useEffect(() => { loadPatients() }, [])

    async function loadPatients() {
        try {
            setLoading(true)
            const data = await patientService.getAll()
            setPatients(data)
        } catch (error) {
            toast.error("Erro ao sincronizar pacientes.")
        } finally {
            setLoading(false)
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true)
        try {
            if (editingPatient) {
                await patientService.update(editingPatient.id, values as any)
                toast.success("Registro atualizado com sucesso!")
            } else {
                await patientService.create(values as any)
                toast.success("Paciente registrado com sucesso!")
            }
            form.reset()
            setIsAdding(false)
            setEditingPatient(null)
            loadPatients()
        } catch (error) {
            toast.error("Erro ao processar solicitação.")
        } finally {
            setSubmitting(false)
        }
    }

    function handleEdit(patient: Patient) {
        setEditingPatient(patient)
        form.reset({
            nome: patient.nome,
            cpf: patient.cpf || "",
            telefone: patient.telefone || "",
            email: patient.email || ""
        })
        setIsAdding(true)
    }

    function handleDelete(id: string) {
        setPatientToDelete(id)
        setIsDeleteOpen(true)
    }

    async function confirmDelete() {
        if (!patientToDelete) return
        try {
            await patientService.delete(patientToDelete)
            toast.success("Paciente excluído com sucesso.")
            loadPatients()
        } catch (error) {
            toast.error("Erro ao excluir paciente.")
        } finally {
            setIsDeleteOpen(false)
            setPatientToDelete(null)
        }
    }

    const filteredPatients = patients.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cpf?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telefone?.includes(searchTerm)
    )

    if (loading || loadingPermissions) {
        return (
            <div className="flex items-center justify-center p-8 h-[calc(100vh-100px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!can('patients', 'view')) {
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
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground/80">Gestão de Pacientes</h1>
                    <p className="text-muted-foreground/80 font-medium">Cadastre, edite e gerencie o histórico de seus pacientes.</p>
                </div>
                {can('patients', 'create') && (
                    <Button
                        onClick={() => {
                            setEditingPatient(null)
                            form.reset({ nome: "", cpf: "", telefone: "", email: "" })
                            setIsAdding(true)
                        }}
                        className="font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Paciente
                    </Button>
                )}
            </div>

            <Dialog open={isAdding} onOpenChange={(open) => {
                setIsAdding(open)
                if (!open) {
                    form.reset()
                    setEditingPatient(null)
                }
            }}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-primary">
                            {editingPatient ? `Editando: ${editingPatient.nome}` : "Cadastro Médico"}
                        </DialogTitle>
                        <DialogDescription className="font-semibold text-muted-foreground/60">
                            {editingPatient ? "Atualize as informações do paciente" : "Insira os dados cadastrais do novo paciente"}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="nome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">Paciente</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome Completo" className="h-12 rounded-xl bg-white/50 border-primary/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="cpf"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">CPF</FormLabel>
                                            <FormControl>
                                                <Input placeholder="000.000.000-00" className="h-12 rounded-xl bg-white/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="telefone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">Contato</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(00) 00000-0000" className="h-12 rounded-xl bg-white/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs uppercase font-bold text-muted-foreground/70 ml-1">Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="paciente@email.com" className="h-12 rounded-xl bg-white/50 border-primary/10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex gap-4 pt-4">
                                <Button type="submit" className="flex-1 h-12 rounded-full font-bold" disabled={submitting}>
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingPatient ? "Salvar Alterações" : "Finalizar Registro")}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-12 rounded-full font-bold px-6"
                                    onClick={() => {
                                        setIsAdding(false)
                                        setEditingPatient(null)
                                        form.reset()
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Card className="glass border-none medical-shadow overflow-hidden">
                <CardHeader className="pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground/70">
                            <UserCheck className="h-5 w-5 text-primary" />
                            Listagem Ativa
                        </CardTitle>

                        <div className="relative w-full md:w-[350px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                            <Input
                                placeholder="Buscar: Nome, CPF, Email ou Tel..."
                                className="h-11 pl-11 rounded-full bg-white/40 border-primary/5 focus:border-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                            <p className="text-sm font-bold text-primary/30 uppercase tracking-[0.2em]">Sincronizando Base</p>
                        </div>
                    ) : (
                        <div className="">
                            <Table>
                                <TableHeader className="bg-primary/5">
                                    <TableRow className="border-none">
                                        <TableHead className="py-5 px-8 font-bold text-xs uppercase text-primary/60">Paciente</TableHead>
                                        <TableHead className="font-bold text-xs uppercase text-primary/60">Status Clínico</TableHead>
                                        <TableHead className="text-right py-5 px-8 font-bold text-xs uppercase text-primary/60">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPatients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-64 text-center">
                                                <div className="flex flex-col items-center gap-3 text-muted-foreground/30 font-bold italic">
                                                    <Users className="h-12 w-12 mb-2" />
                                                    Nenhum registro encontrado.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPatients.map((patient) => (
                                            <TableRow key={patient.id} className="group hover:bg-white/60 transition-colors border-primary/5">
                                                <TableCell className="py-4 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                            {patient.nome.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-foreground/70">{patient.nome}</p>
                                                            <div className="flex items-center gap-3 text-[10px] uppercase font-extrabold text-muted-foreground/40">
                                                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {patient.telefone || '-'}</span>
                                                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {patient.email || '-'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                                        <span className="text-xs font-bold text-green-600/80 uppercase tracking-wider">Acompanhamento Ativo</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                                                                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl medical-shadow border-none">
                                                            <DropdownMenuLabel className="px-3 pt-2 text-[10px] uppercase font-extrabold text-muted-foreground/40">Prontuário</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                className="rounded-xl font-bold cursor-pointer py-2.5"
                                                                onClick={() => setViewingDocs(patient)}
                                                            >
                                                                <FileText className="h-4 w-4 mr-3 text-primary" /> Ver Histórico
                                                            </DropdownMenuItem>
                                                            {can('patients', 'edit') && (
                                                                <DropdownMenuItem
                                                                    className="rounded-xl font-bold cursor-pointer py-2.5"
                                                                    onClick={() => handleEdit(patient)}
                                                                >
                                                                    <Edit2 className="h-4 w-4 mr-3 text-primary" /> Editar Cadastro
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator className="bg-primary/5" />
                                                            {can('patients', 'delete') && (
                                                                <DropdownMenuItem
                                                                    className="text-destructive rounded-xl font-bold cursor-pointer py-2.5 focus:bg-destructive/5"
                                                                    onClick={() => handleDelete(patient.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-3" /> Excluir Registro
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
                        </div>
                    )}
                </CardContent>
                {viewingDocs && (
                    <Sheet open={!!viewingDocs} onOpenChange={() => setViewingDocs(null)}>
                        <SheetContent className="sm:max-w-xl w-full">
                            <SheetHeader>
                                <SheetTitle>Documentos do Paciente</SheetTitle>
                                <SheetDescription>
                                    Gerencie arquivos, exames e receitas de {viewingDocs.nome}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6 h-full overflow-y-auto pb-20">
                                <PatientDocuments patientId={viewingDocs.id} patientName={viewingDocs.nome} />
                            </div>
                        </SheetContent>
                    </Sheet>
                )}

                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o paciente e todos os seus dados associados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Sim, excluir paciente
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>
        </div>
    )
}
