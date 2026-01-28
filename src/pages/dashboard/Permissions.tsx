import { useState, useEffect } from "react"
import { Shield, Eye, Plus, FileEdit, Trash2, FileText } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { permissionService } from "@/services/permissionService"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type PermissionLevel = 'view' | 'create' | 'edit' | 'delete'

interface ModulePermission {
    id: string
    name: string
    permissions: {
        view: boolean
        create: boolean
        edit: boolean
        delete: boolean
    }
}

export default function Permissions() {
    const [selectedRole, setSelectedRole] = useState("doctor")
    const { profile } = useAuth()
    const [, setLoading] = useState(false)
    const [customRoles, setCustomRoles] = useState<{ id: string, name: string, slug: string }[]>([])

    // Dialog states
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [newRoleName, setNewRoleName] = useState("")

    // Define System Roles (immutable in code, but their permissions are editable)
    const systemRoles = [
        { id: 'admin', name: 'Administrador (Sistema)', isSystem: true },
        { id: 'doctor', name: 'Médico / Profissional', isSystem: true },
        { id: 'assistant', name: 'Assistente / Recepção', isSystem: true },
    ]

    // Combined Roles
    const roles = [
        ...systemRoles,
        ...customRoles.map(r => ({ id: r.slug, name: r.name, isSystem: false }))
    ]

    // Define available modules

    // Define available modules with categories
    const availableModules = [
        // Módulos Clínicos
        { id: 'patients', name: 'Gestão de Pacientes', category: 'Clínico' },
        { id: 'dashboard', name: 'Visão Geral / Dashboard', category: 'Clínico' },
        { id: 'appointments', name: 'Atendimentos & Procedimentos', category: 'Clínico' },
        { id: 'documents', name: 'Gestão de Documentos', category: 'Clínico' },

        // Módulos Administrativos
        { id: 'team', name: 'Gestão de Equipe', category: 'Administrativo' },
        { id: 'permissions', name: 'Controle de Permissões', category: 'Administrativo' },
        { id: 'logs', name: 'Logs e Auditoria', category: 'Administrativo' },
    ]

    const [modules, setModules] = useState<ModulePermission[]>([])

    useEffect(() => {
        if (profile?.clinica_id) {
            loadRoles().then(() => loadPermissions())
        }
    }, [profile?.clinica_id, selectedRole])

    async function loadRoles() {
        if (!profile?.clinica_id) return
        try {
            const data = await permissionService.getRoles(profile.clinica_id)
            setCustomRoles(data)
        } catch (error) {
            console.error("Error loading roles:", error)
        }
    }

    async function loadPermissions() {
        if (!profile?.clinica_id) return
        setLoading(true)
        try {
            const dbPermissions = await permissionService.getPermissions(profile.clinica_id)

            // Merge DB permissions with available modules
            const mergedModules = availableModules.map(mod => {
                const found = dbPermissions.find(p => p.role === selectedRole && p.module === mod.id)
                return {
                    id: mod.id,
                    name: mod.name,
                    category: mod.category,
                    permissions: {
                        view: found?.can_view ?? (selectedRole === 'admin'),
                        create: found?.can_create ?? (selectedRole === 'admin'),
                        edit: found?.can_edit ?? (selectedRole === 'admin'),
                        delete: found?.can_delete ?? (selectedRole === 'admin')
                    }
                }
            })
            setModules(mergedModules)
        } catch (error) {
            console.error(error)
            toast.error("Erro ao carregar permissões.")
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (moduleId: string, type: PermissionLevel) => {
        if (!profile?.clinica_id) return

        const currentModule = modules.find(m => m.id === moduleId)
        if (!currentModule) return

        const newPermissions = {
            ...currentModule.permissions,
            [type]: !currentModule.permissions[type]
        }

        setModules(prev => prev.map(m => {
            if (m.id === moduleId) {
                return {
                    ...m,
                    permissions: newPermissions
                }
            }
            return m
        }))

        try {
            await permissionService.upsertPermission({
                clinica_id: profile.clinica_id,
                role: selectedRole,
                module: moduleId,
                can_view: newPermissions.view,
                can_create: newPermissions.create,
                can_edit: newPermissions.edit,
                can_delete: newPermissions.delete
            })
            toast.success("Permissão salva.")
        } catch (error) {
            toast.error("Erro ao salvar permissão.")
            loadPermissions()
        }
    }

    async function handleCreateRole() {
        if (!newRoleName.trim() || !profile?.clinica_id) return

        try {
            const slug = newRoleName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_")
            await permissionService.createRole({
                clinica_id: profile.clinica_id,
                name: newRoleName,
                slug: slug
            })

            toast.success("Perfil criado com sucesso!")
            setNewRoleName("")
            setIsRoleDialogOpen(false)
            await loadRoles()
            setSelectedRole(slug)
        } catch (error) {
            toast.error("Erro ao criar perfil. Tente um nome diferente.")
        }
    }

    // Group modules by category for display
    const clinicalModules = modules.filter(m => (m as any).category === 'Clínico')
    const adminModules = modules.filter(m => (m as any).category === 'Administrativo')

    const renderModuleRow = (module: any) => (
        <TableRow key={module.id} className="hover:bg-muted/30 transition-colors border-muted/20">
            <TableCell className="py-6 px-8 font-semibold text-foreground/80">
                {module.name}
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Switch
                        checked={module.permissions.view}
                        onCheckedChange={() => handleToggle(module.id, 'view')}
                        className="data-[state=checked]:bg-green-500"
                    />
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Switch
                        checked={module.permissions.create}
                        onCheckedChange={() => handleToggle(module.id, 'create')}
                        className="data-[state=checked]:bg-emerald-500"
                    />
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Switch
                        checked={module.permissions.edit}
                        onCheckedChange={() => handleToggle(module.id, 'edit')}
                        className="data-[state=checked]:bg-blue-500"
                    />
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Switch
                        checked={module.permissions.delete}
                        onCheckedChange={() => handleToggle(module.id, 'delete')}
                        className="data-[state=checked]:bg-red-500"
                    />
                </div>
            </TableCell>
        </TableRow>
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 p-6 rounded-3xl border border-white shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-yellow-500 fill-yellow-500/20" />
                        <h1 className="text-2xl font-bold tracking-tight text-foreground/80">Permissões de Acesso</h1>
                    </div>
                    <p className="text-muted-foreground/80 font-medium pl-11">Gerencie o que cada perfil de usuário pode ver e fazer no sistema.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border medical-shadow">
                    <span className="text-xs font-bold uppercase text-muted-foreground ml-2">Perfil:</span>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-[200px] h-9 border-none bg-transparent focus:ring-0 font-bold text-primary">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.id} className="font-bold cursor-pointer">
                                    {role.name} {role.isSystem && <span className="text-[10px] text-muted-foreground ml-1">(Sistema)</span>}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-lg">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Criar Novo Perfil</DialogTitle>
                                <DialogDescription>
                                    Crie um novo perfil de acesso para sua equipe (ex: Enfermeiro, Financeiro).
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Nome
                                    </Label>
                                    <Input
                                        id="name"
                                        value={newRoleName}
                                        onChange={(e) => setNewRoleName(e.target.value)}
                                        className="col-span-3"
                                        placeholder="Ex: Enfermeiro Chefe"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateRole}>Criar Perfil</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="glass border-none medical-shadow overflow-hidden">
                <CardHeader className="pb-4 border-b bg-muted/20">
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground/70">
                        <FileText className="h-5 w-5 text-yellow-500" />
                        Matriz de Permissões
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-transparent hover:bg-transparent border-b">
                                <TableHead className="py-4 px-8 font-bold text-xs uppercase text-primary/60 w-[30%]">Módulo / Funcionalidade</TableHead>
                                <TableHead className="text-center font-bold text-xs uppercase text-primary/60">
                                    <div className="flex items-center justify-center gap-2 text-foreground/60">
                                        <Eye className="h-4 w-4" /> Ver
                                    </div>
                                </TableHead>
                                <TableHead className="text-center font-bold text-xs uppercase text-primary/60">
                                    <div className="flex items-center justify-center gap-2 text-emerald-600/80">
                                        <Plus className="h-4 w-4" /> Criar
                                    </div>
                                </TableHead>
                                <TableHead className="text-center font-bold text-xs uppercase text-primary/60">
                                    <div className="flex items-center justify-center gap-2 text-blue-600/80">
                                        <FileEdit className="h-4 w-4" /> Editar
                                    </div>
                                </TableHead>
                                <TableHead className="text-center font-bold text-xs uppercase text-primary/60">
                                    <div className="flex items-center justify-center gap-2 text-red-600/80">
                                        <Trash2 className="h-4 w-4" /> Deletar
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Clinical Section */}
                            <TableRow className="bg-primary/5 hover:bg-primary/5">
                                <TableCell colSpan={5} className="py-2 px-8 font-black text-xs uppercase tracking-[0.2em] text-primary/50">
                                    Módulos Clínicos & Operacionais
                                </TableCell>
                            </TableRow>
                            {clinicalModules.map(renderModuleRow)}

                            {/* Admin Section - Only for Admin Role */}
                            {selectedRole === 'admin' && (
                                <>
                                    <TableRow className="bg-amber-500/5 hover:bg-amber-500/5 border-t">
                                        <TableCell colSpan={5} className="py-2 px-8 font-black text-xs uppercase tracking-[0.2em] text-amber-600/50">
                                            Administração & Sistema
                                        </TableCell>
                                    </TableRow>
                                    {adminModules.map(renderModuleRow)}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

