import { useEffect, useState } from "react"
import { auditService } from "@/services/auditService"
import {
    Activity,
    User,
    Clock,
    Database,
    Search,
    Loader2,
    ShieldAlert,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function Logs() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => { loadLogs() }, [])

    async function loadLogs() {
        try {
            setLoading(true)
            const data = await auditService.getClinicLogs()
            setLogs(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.usuario?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground/80">Logs de Auditoria</h1>
                    <p className="text-muted-foreground/80 font-medium">Rastreabilidade completa de ações sensíveis no sistema.</p>
                </div>
                <div className="relative w-full md:w-[350px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                    <Input
                        placeholder="Filtrar por ação ou usuário..."
                        className="h-11 pl-11 rounded-full bg-white/40 border-primary/5 focus:border-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="glass border-none medical-shadow overflow-hidden">
                <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground/70">
                        <Activity className="h-5 w-5 text-primary" />
                        Histórico de Eventos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                            <p className="text-sm font-bold text-primary/30 uppercase tracking-[0.2em]">Recuperando Logs</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-primary/5">
                                <TableRow className="border-none">
                                    <TableHead className="py-5 px-8 font-bold text-xs uppercase text-primary/60">Data / Hora</TableHead>
                                    <TableHead className="font-bold text-xs uppercase text-primary/60">Usuário</TableHead>
                                    <TableHead className="font-bold text-xs uppercase text-primary/60">Ação</TableHead>
                                    <TableHead className="font-bold text-xs uppercase text-primary/60">Entidade</TableHead>
                                    <TableHead className="text-right py-5 px-8 font-bold text-xs uppercase text-primary/60">ID Alvo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground/30 font-bold italic">
                                                <ShieldAlert className="h-12 w-12 mb-2" />
                                                Nenhum registro de auditoria encontrado.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="group hover:bg-white/60 transition-colors border-primary/5 text-sm">
                                            <TableCell className="py-4 px-8 font-bold text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-primary/40" />
                                                    {format(new Date(log.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                        <User className="h-3 w-3" />
                                                    </div>
                                                    <span className="font-bold text-foreground/70">{log.usuario?.nome || 'Sistema'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <ActionBadge action={log.action} />
                                            </TableCell>
                                            <TableCell className="font-extrabold text-[11px] uppercase tracking-widest text-primary/60">
                                                <div className="flex items-center gap-2">
                                                    <Database className="h-3 w-3" />
                                                    {log.entity_type}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-8 font-mono text-[10px] text-muted-foreground/40">
                                                {log.entity_id}
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

function ActionBadge({ action }: { action: string }) {
    const configs: Record<string, { label: string, color: string }> = {
        'create': { label: 'Criação', color: 'bg-green-100 text-green-700' },
        'update': { label: 'Edição', color: 'bg-blue-100 text-blue-700' },
        'update_status': { label: 'Status', color: 'bg-amber-100 text-amber-700' },
        'delete': { label: 'Exclusão', color: 'bg-red-100 text-red-700' },
        'login': { label: 'Login', color: 'bg-purple-100 text-purple-700' },
    }
    const config = configs[action] || { label: action.toUpperCase(), color: 'bg-gray-100 text-gray-700' }
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.color}`}>
            {config.label}
        </span>
    )
}
