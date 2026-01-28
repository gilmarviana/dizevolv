import { useEffect, useState } from "react"
import { clinicUserService, type ClinicUser } from "@/services/clinicUserService"
import { permissionService } from "@/services/permissionService"
import { useAuth } from "@/contexts/AuthContext"
import {
    CheckCircle2,
    Shield,
    Trash2,
    Loader2,
    UserPlus,
    MoreVertical,
    Mail,
    User
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


export default function Team() {
    const { user: currentUser, profile } = useAuth()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Invite State
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteData, setInviteData] = useState({
        nome: '',
        email: '',
        role: 'doctor' // Default, will change
    })
    const [inviting, setInviting] = useState(false)

    // Custom roles
    const [availableRoles, setAvailableRoles] = useState<{ id: string, name: string, slug: string }[]>([])

    useEffect(() => {
        if (profile?.clinica_id) {
            loadTeam()
            loadRoles()
        }
    }, [profile?.clinica_id])

    async function loadRoles() {
        if (!profile?.clinica_id) return
        try {
            const roles = await permissionService.getRoles(profile.clinica_id)
            setAvailableRoles(roles)
        } catch (error) {
            console.error("Error loading roles")
        }
    }

    async function loadTeam() {
        try {
            setLoading(true)
            const data = await clinicUserService.getAll()
            setUsers(data)
        } catch (error) {
            toast.error("Erro ao sincronizar equipe.")
        } finally {
            setLoading(false)
        }
    }

    async function handleRoleUpdate(userId: string, newRole: ClinicUser['role']) {
        try {
            await clinicUserService.updateRole(userId, newRole)
            toast.success("Permissão atualizada.")
            loadTeam()
        } catch (error) {
            toast.error("Erro ao atualizar permissão.")
        }
    }

    async function handleDelete(userId: string) {
        if (userId === currentUser?.id) {
            toast.error("Você não pode remover seu próprio acesso.")
            return
        }
        if (!confirm("Remover este membro da equipe? O acesso será revogado imediatamente.")) return

        try {
            await clinicUserService.deleteUser(userId)
            toast.success("Membro removido.")
            loadTeam()
        } catch (error) {
            toast.error("Erro ao remover usuário.")
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground/80">Equipe Clínica</h1>
                    <p className="text-muted-foreground/80 font-medium">Gerencie acessos, permissões e membros da sua unidade.</p>
                </div>

                <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="rounded-full font-bold px-8 bg-primary medical-shadow h-12"
                >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Convidar Profissional
                </Button>
            </div>

            <Card className="glass border-none medical-shadow overflow-hidden">
                <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground/70">
                        <Shield className="h-5 w-5 text-primary" />
                        Níveis de Acesso
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                            <p className="text-sm font-bold text-primary/30 uppercase tracking-[0.2em]">Sincronizando Equipe</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-primary/5">
                                <TableRow className="border-none">
                                    <TableHead className="py-5 px-8 font-bold text-xs uppercase text-primary/60">Colaborador</TableHead>
                                    <TableHead className="font-bold text-xs uppercase text-primary/60">Cargo / Role</TableHead>
                                    <TableHead className="font-bold text-xs uppercase text-primary/60">Status</TableHead>
                                    <TableHead className="text-right py-5 px-8 font-bold text-xs uppercase text-primary/60">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((member) => (
                                    <TableRow key={member.id} className="group hover:bg-white/60 transition-colors border-primary/5">
                                        <TableCell className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {member.nome?.substring(0, 1) || member.email?.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground/70">{member.nome || 'Usuário Sem Nome'}</p>
                                                    <p className="text-xs text-muted-foreground/50">{member.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <RoleBadge role={member.role} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                <span className="text-xs font-bold text-green-600/70 uppercase">Ativo</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                                                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl medical-shadow border-none">
                                                    <DropdownMenuLabel className="px-3 pt-2 text-[10px] uppercase font-extrabold text-muted-foreground/40">Alterar Permissões</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="rounded-xl font-bold py-2.5"
                                                        onClick={() => handleRoleUpdate(member.id, 'admin')}
                                                    >
                                                        Administrador
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-xl font-bold py-2.5"
                                                        onClick={() => handleRoleUpdate(member.id, 'doctor')}
                                                    >
                                                        Médico / Profissional
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-xl font-bold py-2.5"
                                                        onClick={() => handleRoleUpdate(member.id, 'assistant')}
                                                    >
                                                        Assistente / Recepção
                                                    </DropdownMenuItem>
                                                    {availableRoles.map(role => (
                                                        <DropdownMenuItem
                                                            key={role.id}
                                                            className="rounded-xl font-bold py-2.5"
                                                            onClick={() => handleRoleUpdate(member.id, role.slug)}
                                                        >
                                                            {role.name}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuSeparator className="bg-primary/5" />
                                                    <DropdownMenuItem
                                                        className="text-destructive rounded-xl font-bold py-2.5 focus:bg-destructive/5"
                                                        onClick={() => handleDelete(member.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-3" /> Revogar Acesso
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl medical-shadow border-none glass">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground">Convidar Membro</DialogTitle>
                        <DialogDescription>
                            Envie um convite para adicionar um novo profissional à sua equipe.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome" className="text-xs uppercase font-bold text-muted-foreground/70">Nome Completo</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="nome"
                                    placeholder="Dr. João Silva"
                                    className="pl-10 h-11 rounded-xl bg-white/50"
                                    value={inviteData.nome}
                                    onChange={(e) => setInviteData({ ...inviteData, nome: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs uppercase font-bold text-muted-foreground/70">Email Corporativo</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="joao@clinica.com"
                                    className="pl-10 h-11 rounded-xl bg-white/50"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-xs uppercase font-bold text-muted-foreground/70">Função / Acesso</Label>
                            <Select
                                value={inviteData.role}
                                onValueChange={(value: any) => setInviteData({ ...inviteData, role: value })}
                            >
                                <SelectTrigger className="h-11 rounded-xl bg-white/50">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-none medical-shadow">
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="doctor">Médico / Profissional</SelectItem>
                                    <SelectItem value="assistant">Assistente / Recepção</SelectItem>
                                    {availableRoles.map(role => (
                                        <SelectItem key={role.id} value={role.slug}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={async () => {
                                if (!inviteData.nome || !inviteData.email) {
                                    toast.error("Preencha todos os campos obrigatórios.")
                                    return
                                }
                                try {
                                    setInviting(true)
                                    await clinicUserService.create(inviteData)
                                    toast.success("Convite enviado com sucesso!")
                                    setIsInviteOpen(false)
                                    setInviteData({ nome: '', email: '', role: 'doctor' })
                                    loadTeam()
                                } catch (error: any) {
                                    toast.error(error.message)
                                } finally {
                                    setInviting(false)
                                }
                            }}
                            disabled={inviting}
                            className="w-full rounded-xl h-11 font-bold"
                        >
                            {inviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                            {inviting ? "Enviando..." : "Enviar Convite"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}

function RoleBadge({ role }: { role: string }) {
    const configs: Record<string, { label: string, bg: string, text: string }> = {
        admin: { label: 'Admin', bg: 'bg-primary', text: 'text-white' },
        doctor: { label: 'Médico', bg: 'bg-blue-100', text: 'text-blue-700' },
        assistant: { label: 'Assistente', bg: 'bg-indigo-100', text: 'text-indigo-700' },
    }
    // Try to find exact config, otherwise standard generic one
    const config = configs[role] || {
        label: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
        bg: 'bg-gray-100',
        text: 'text-gray-700'
    }

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
            {config.label}
        </span>
    )
}
