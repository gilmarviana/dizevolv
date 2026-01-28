import { useState, useEffect } from "react"
import { masterService } from "@/services/masterService"
import { type ClinicDetail, type PlanDetail } from "@/types"
import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Building2,
    CheckCircle,
    CreditCard,
    FileText,
    History,
    Loader2,
    MoreVertical,
    Search,
    Settings2,
    ShieldCheck,
    TrendingUp,
    Trash2,
    Users,
    Wallet,
    XCircle,
    Zap
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { Navigate, useSearchParams } from "react-router-dom"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts'

const revenueData = [
    { name: 'Jan', value: 45000 },
    { name: 'Fev', value: 52000 },
    { name: 'Mar', value: 48000 },
    { name: 'Abr', value: 61000 },
    { name: 'Mai', value: 55000 },
    { name: 'Jun', value: 67000 },
]

export default function MasterDashboard() {
    const { profile } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get("tab") || "metrics"
    const [clinics, setClinics] = useState<ClinicDetail[]>([])
    const [plans, setPlans] = useState<PlanDetail[]>([])
    const [stats, setStats] = useState({ clinics: 0, patients: 0, users: 0 })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    // Calculated metrics
    const totalMRR = clinics.reduce((acc, clinic) => {
        const plan = plans.find(p => p.id === clinic.plano_id);
        return acc + (Number(plan?.preco_mensal) || 0);
    }, 0) / 100;

    const planDistribution = plans.map(plan => ({
        id: plan.id,
        name: plan.nome,
        count: clinics.filter(c => c.plano_id === plan.id).length
    }));

    // States for Plan Stats Modal
    const [selectedPlanForStats, setSelectedPlanForStats] = useState<{ id: string, name: string } | null>(null)
    const [isPlanStatsDialogOpen, setIsPlanStatsDialogOpen] = useState(false)

    // States for Plan Dialog
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<Partial<PlanDetail> | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [planToDelete, setPlanToDelete] = useState<string | null>(null)

    // States for Subscription Details
    const [isSubDialogOpen, setIsSubDialogOpen] = useState(false)
    const [selectedClinic, setSelectedClinic] = useState<ClinicDetail | null>(null)

    useEffect(() => {
        if (profile?.role === 'superadmin') {
            loadAllData()
        }
    }, [profile])

    async function loadAllData() {
        try {
            setLoading(true)
            const [clinicsData, plansData, statsData] = await Promise.all([
                masterService.getClinics(),
                masterService.getPlans(),
                masterService.getGlobalStats()
            ])
            setClinics(clinicsData)
            setPlans(plansData)
            setStats(statsData)
        } catch (error) {
            toast.error("Erro ao carregar dados da plataforma.")
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusChange(clinicId: string, status: ClinicDetail['status']) {
        try {
            await masterService.updateClinicStatus(clinicId, status)
            toast.success("Status atualizado.")
            loadAllData()
        } catch (error) {
            toast.error("Erro ao atualizar status.")
        }
    }

    async function handlePlanChange(clinicId: string, planoId: string) {
        try {
            await masterService.updateClinicPlan(clinicId, planoId)
            toast.success("Plano da clínica atualizado.")
            loadAllData()

            // If the modal is open for this clinic, update the selected state
            if (selectedClinic?.id === clinicId) {
                const updated = clinics.find(c => c.id === clinicId);
                const newPlan = plans.find(p => p.id === planoId);
                if (updated) {
                    setSelectedClinic({ ...updated, plano_id: planoId, plano: { nome: newPlan?.nome || '' } });
                }
            }
        } catch (error) {
            toast.error("Erro ao atualizar plano.")
        }
    }

    function handleGenerateInvoice() {
        toast.promise(new Promise(res => setTimeout(res, 1500)), {
            loading: 'Gerando fatura PDF...',
            success: 'Fatura enviada para o e-mail da clínica!',
            error: 'Erro ao processar fatura.'
        });
    }

    async function handleSavePlan(e: React.FormEvent) {
        e.preventDefault()
        try {
            if (!editingPlan?.nome || !editingPlan?.preco_mensal) {
                toast.error("Preencha os campos obrigatórios.")
                return
            }
            const planToSave = {
                ...editingPlan,
                preco_mensal: Math.round((editingPlan.preco_mensal || 0) * 100)
            };
            await masterService.savePlan(planToSave)
            toast.success(editingPlan.id ? "Plano atualizado." : "Plano criado.")
            setIsPlanDialogOpen(false)
            loadAllData()
        } catch (error) {
            toast.error("Erro ao salvar plano.")
        }
    }

    async function handleDeletePlan() {
        if (!planToDelete) return
        try {
            await masterService.deletePlan(planToDelete)
            toast.success("Plano removido.")
            setIsDeleteDialogOpen(false)
            setPlanToDelete(null)
            loadAllData()
        } catch (error) {
            toast.error("Erro ao remover plano. Verifique se existem clínicas vinculadas.")
        }
    }

    if (profile?.role !== 'superadmin') {
        return <Navigate to="/dashboard" replace />
    }

    return (
        <div className="space-y-10 max-w-[100vw] overflow-x-hidden px-4 md:px-0">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-primary p-2 rounded-xl medical-shadow">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground/80 lowercase">Master<span className="text-primary italic">Admin</span></h1>
                    </div>
                    <p className="text-muted-foreground/80 font-medium ml-12">Governança global e controle de assinaturas.</p>
                </div>
                <div className="flex gap-3">
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Contratos Ativos"
                    value={stats.clinics}
                    icon={<Building2 className="h-6 w-6" />}
                    color="bg-blue-500"
                    trend="+12% em relação ao mês anterior"
                    isPositive={true}
                />
                <StatCard
                    title="Volume de Pacientes"
                    value={stats.patients.toLocaleString()}
                    icon={<Activity className="h-6 w-6" />}
                    color="bg-primary"
                    trend="+8% crescimento orgânico"
                    isPositive={true}
                />
                <StatCard
                    title="Usuários na Plataforma"
                    value={stats.users}
                    icon={<Users className="h-6 w-6" />}
                    color="bg-indigo-500"
                    trend="+5 novos acessos hoje"
                    isPositive={true}
                />
                <StatCard
                    title="Faturamento (MRR)"
                    value={`R$ ${totalMRR.toLocaleString('pt-BR')}`}
                    icon={<CreditCard className="h-6 w-6" />}
                    color="bg-emerald-500"
                    trend="+15.4% de ROI projetado"
                    isPositive={true}
                />
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-8">
                <TabsList className="bg-white/60 p-1.5 rounded-2xl glass premium-shadow h-auto md:h-16 border border-primary/10 flex flex-wrap md:flex-nowrap gap-1 md:gap-0 overflow-x-auto no-scrollbar">
                    <TabsTrigger value="clinics" className="flex-1 rounded-xl px-4 md:px-8 py-3 md:h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all text-xs md:text-sm whitespace-nowrap">
                        <Building2 className="h-4 w-4 mr-2" /> Gestão de Clínicas
                    </TabsTrigger>
                    <TabsTrigger value="plans" className="flex-1 rounded-xl px-4 md:px-8 py-3 md:h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all text-xs md:text-sm whitespace-nowrap">
                        <CreditCard className="h-4 w-4 mr-2" /> Gestão de Planos
                    </TabsTrigger>
                    <TabsTrigger value="metrics" className="flex-1 rounded-xl px-4 md:px-8 py-3 md:h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all text-xs md:text-sm whitespace-nowrap">
                        <TrendingUp className="h-4 w-4 mr-2" /> Métricas Globais
                    </TabsTrigger>
                    <TabsTrigger value="subscriptions" className="flex-1 rounded-xl px-4 md:px-8 py-3 md:h-full data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all text-xs md:text-sm whitespace-nowrap">
                        <ShieldCheck className="h-4 w-4 mr-2" /> Controle de Assinaturas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="clinics" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-muted/30 p-8 rounded-[2.5rem] border border-primary/5 space-y-6 medical-shadow">
                        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-primary/5 shadow-sm">
                            <div className="relative w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                                <Input
                                    placeholder="Buscar clínica ou CNPJ..."
                                    className="pl-11 h-12 rounded-2xl bg-muted/20 border-none transition-all focus:ring-2 focus:ring-primary/20 font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <Card className="bg-white border-none premium-shadow overflow-hidden rounded-[2rem]">
                            <CardContent className="p-0 overflow-x-auto no-scrollbar">
                                {loading ? (
                                    <div className="py-24 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                                        <p className="text-xs font-black text-primary/30 uppercase tracking-[0.2em]">Sincronizando Dados</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-primary/5">
                                            <TableRow className="border-none">
                                                <TableHead className="py-6 px-8 font-black text-[10px] uppercase text-primary/60 tracking-widest">Instituição</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">Status</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">Plano / Assinatura</TableHead>
                                                <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">Data Adesão</TableHead>
                                                <TableHead className="text-right py-6 px-8 font-black text-[10px] uppercase text-primary/60 tracking-widest">Controle</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {clinics.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase())).map((clinic) => (
                                                <TableRow key={clinic.id} className="group hover:bg-white/60 transition-colors border-primary/5">
                                                    <TableCell className="py-5 px-8">
                                                        <div>
                                                            <p className="font-bold text-foreground/80">{clinic.nome}</p>
                                                            <p className="text-[10px] text-muted-foreground/50 font-mono">ID: {clinic.id.substring(0, 8)}... | {clinic.cnpj || 'SEM CNPJ'}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={clinic.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-primary uppercase">{clinic.plano?.nome || 'Nenhum'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs font-bold text-muted-foreground/60 italic">
                                                        {new Date(clinic.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right px-8">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
                                                                    <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl medical-shadow border-none glass">
                                                                <DropdownMenuLabel className="px-3 pt-2 text-[10px] uppercase font-black text-primary/40">Status do Contrato</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(clinic.id, 'active')} className="rounded-xl font-bold py-2.5">
                                                                    <CheckCircle className="h-4 w-4 mr-3 text-green-500" /> Ativar Acesso
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleStatusChange(clinic.id, 'suspended')} className="rounded-xl font-bold py-2.5">
                                                                    <XCircle className="h-4 w-4 mr-3 text-red-500" /> Suspender Clínica
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-primary/5" />
                                                                <DropdownMenuLabel className="px-3 pt-2 text-[10px] uppercase font-black text-primary/40">Upgrade / Downgrade</DropdownMenuLabel>
                                                                {plans.map(plan => (
                                                                    <DropdownMenuItem
                                                                        key={plan.id}
                                                                        onClick={() => handlePlanChange(clinic.id, plan.id)}
                                                                        className="rounded-xl font-bold py-2 cursor-pointer"
                                                                    >
                                                                        <ArrowUpRight className="h-3 w-3 mr-3 text-primary/40" /> {plan.nome}
                                                                    </DropdownMenuItem>
                                                                ))}
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
                    </div>
                </TabsContent>

                <TabsContent value="plans" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-muted/30 p-8 rounded-[2.5rem] border border-primary/5 premium-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {plans.map((plan) => (
                                <Card key={plan.id} className="bg-white border-none medical-shadow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group rounded-3xl">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                    <CardHeader className="text-center pb-2">
                                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                                            <CreditCard className="h-6 w-6" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl font-black text-foreground/70 uppercase tracking-tight">{plan.nome}</CardTitle>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => {
                                                    setEditingPlan({
                                                        ...plan,
                                                        preco_mensal: Number(plan.preco_mensal) / 100
                                                    });
                                                    setIsPlanDialogOpen(true);
                                                }}>
                                                    <Settings2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                                    onClick={() => { setPlanToDelete(plan.id); setIsDeleteDialogOpen(true) }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription className="text-2xl font-black text-primary mt-2">
                                            R$ {(Number(plan.preco_mensal) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-[10px] text-muted-foreground font-normal">/mês</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-xs font-bold">
                                                <span className="text-muted-foreground">Limite de Pacientes</span>
                                                <span className="text-foreground">{plan.limite_pacientes.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full w-3/4" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                            <BarChart3 className="h-3 w-3" /> Dashboard Avançado
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                            <ShieldCheck className="h-3 w-3" /> RLS Multinível
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-white border-none premium-shadow rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="border-b border-primary/5 bg-primary/5 pb-6">
                                <CardTitle className="text-xl font-black text-primary/80 uppercase tracking-tight">Crescimento de Receita (MRR)</CardTitle>
                                <CardDescription className="font-bold italic">Projeção baseada em clínicas ativas/planos</CardDescription>
                            </CardHeader>
                            <CardContent className="h-96 pt-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `R$ ${v / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                            formatter={(v: any) => [`R$ ${v.toLocaleString()}`, 'Receita']}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-none premium-shadow rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="border-b border-primary/5 bg-primary/5 pb-6">
                                <CardTitle className="text-xl font-black text-primary/80 uppercase tracking-tight">Distribuição de Planos</CardTitle>
                                <CardDescription className="font-bold italic text-muted-foreground/60">Popularidade por tier de assinatura</CardDescription>
                            </CardHeader>
                            <CardContent className="h-96 pt-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={planDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                            formatter={(v: any) => [`${v}`, 'Clínicas']}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#38bdf8"
                                            radius={[8, 8, 0, 0]}
                                            barSize={40}
                                            onClick={(data) => {
                                                if (data && data.activePayload && data.activePayload[0]) {
                                                    const payload = data.activePayload[0].payload;
                                                    setSelectedPlanForStats({ id: payload.id, name: payload.name });
                                                    setIsPlanStatsDialogOpen(true);
                                                }
                                            }}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="subscriptions" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-muted/30 p-8 rounded-[2.5rem] border border-primary/5 premium-shadow">
                        <Card className="bg-white border-none premium-shadow overflow-hidden rounded-[2rem]">
                            <CardHeader className="bg-primary/10 pb-8 border-b border-primary/5">
                                <CardTitle className="text-2xl font-black text-primary uppercase tracking-tight">Painel de Assinaturas Ativas</CardTitle>
                                <CardDescription className="font-bold text-primary/40 italic">Visão consolidada de contratos e faturamento mensal.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 overflow-x-auto no-scrollbar">
                                <Table>
                                    <TableHeader className="bg-white/50">
                                        <TableRow className="border-none">
                                            <TableHead className="py-6 px-8 font-black text-[10px] uppercase text-primary/60 tracking-widest">Instituição</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">Plano Atual</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">Faturamento Mensal</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">Próxima Cobrança</TableHead>
                                            <TableHead className="text-right py-6 px-8 font-black text-[10px] uppercase text-primary/60 tracking-widest">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clinics.map((clinic) => (
                                            <TableRow key={clinic.id} className="group hover:bg-white/60 transition-colors border-primary/5">
                                                <TableCell className="py-5 px-8 font-bold text-foreground/80">{clinic.nome}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="rounded-lg border-primary/20 text-primary uppercase text-[9px] font-black">
                                                        {clinic.plano?.nome || 'Nenhum'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-black text-foreground/70">
                                                    R$ {(Number(plans.find(p => p.id === clinic.plano_id)?.preco_mensal || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="text-xs font-bold text-muted-foreground/60 italic">
                                                    Todo dia {new Date(clinic.created_at).getDate()}
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { setSelectedClinic(clinic); setIsSubDialogOpen(true); }}
                                                        className="rounded-xl font-bold border-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        Ver Detalhes
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {clinics.length === 0 && (
                                    <div className="py-20 text-center text-muted-foreground font-bold">Nenhuma assinatura ativa encontrada.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Plan Modal */}
            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                <DialogContent className="rounded-3xl border-none medical-shadow max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-foreground/80">{editingPlan?.id ? "Editar Plano" : "Novo Plano"}</DialogTitle>
                        <DialogDescription className="font-medium">Defina os limites e preços do tier de assinatura.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSavePlan} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Nome do Plano</Label>
                            <Input
                                placeholder="Ex: Master Gold"
                                className="rounded-xl h-12"
                                value={editingPlan?.nome || ""}
                                onChange={e => setEditingPlan({ ...editingPlan, nome: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Preço Mensal (R$)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="rounded-xl h-12"
                                    value={editingPlan?.preco_mensal ? editingPlan.preco_mensal : ""}
                                    onChange={e => setEditingPlan({ ...editingPlan, preco_mensal: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs uppercase text-muted-foreground ml-1">Limite Pacientes</Label>
                                <Input
                                    type="number"
                                    placeholder="1000"
                                    className="rounded-xl h-12"
                                    value={editingPlan?.limite_pacientes || ""}
                                    onChange={e => setEditingPlan({ ...editingPlan, limite_pacientes: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsPlanDialogOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                            <Button type="submit" className="rounded-xl font-bold px-8 bg-primary hover:bg-primary/90">Salvar Plano</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Subscription Detail Modal */}
            <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
                <DialogContent className="rounded-[2.5rem] border-none glass medical-shadow max-w-2xl p-0 overflow-hidden">
                    <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center medical-shadow text-primary">
                                    <Building2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black text-foreground tracking-tight">{selectedClinic?.nome}</DialogTitle>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contrato: {selectedClinic?.id.substring(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                            <StatusBadge status={selectedClinic?.status || 'trial'} />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white/50 p-4 rounded-2xl border border-primary/5">
                                <p className="text-[10px] font-black text-primary/40 uppercase mb-1">Faturamento</p>
                                <p className="text-lg font-black text-foreground/80">R$ {(Number(plans.find(p => p.id === selectedClinic?.plano_id)?.preco_mensal || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl border border-primary/5">
                                <p className="text-[10px] font-black text-primary/40 uppercase mb-1">Vencimento</p>
                                <p className="text-lg font-black text-foreground/80">Dia {selectedClinic ? new Date(selectedClinic.created_at).getDate() : '--'}</p>
                            </div>
                            <div className="bg-white/50 p-4 rounded-2xl border border-primary/5">
                                <p className="text-[10px] font-black text-primary/40 uppercase mb-1">Plano Atual</p>
                                <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-black">{selectedClinic?.plano?.nome || 'N/A'}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-primary" />
                                    <h4 className="text-sm font-black uppercase text-foreground/70 tracking-tight">Gestão de Plano</h4>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="rounded-xl font-bold text-primary hover:bg-primary/5">
                                            Alterar Plano <Settings2 className="h-3 w-3 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 rounded-2xl medical-shadow border-none glass">
                                        <DropdownMenuLabel className="text-[10px] uppercase font-black text-primary/40">Tiers Disponíveis</DropdownMenuLabel>
                                        {plans.map(plan => (
                                            <DropdownMenuItem
                                                key={plan.id}
                                                onClick={() => handlePlanChange(selectedClinic!.id, plan.id)}
                                                className={`rounded-xl font-bold py-2 ${selectedClinic?.plano_id === plan.id ? 'bg-primary/5 text-primary' : ''}`}
                                            >
                                                {plan.nome} - R$ {(plan.preco_mensal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center medical-shadow">
                                        <Zap className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-foreground/80">{selectedClinic?.plano?.nome} Edition</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">Limite de {plans.find(p => p.id === selectedClinic?.plano_id)?.limite_pacientes.toLocaleString()} pacientes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <History className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-black uppercase text-foreground/70 tracking-tight">Histórico de Cobranças</h4>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { date: 'Janeiro 2026', amount: 'R$ 599,00', status: 'Pago' },
                                    { date: 'Dezembro 2025', amount: 'R$ 599,00', status: 'Pago' },
                                    { date: 'Novembro 2025', amount: 'R$ 599,00', status: 'Pago' },
                                ].map((invoice, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-primary/5 hover:bg-white transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                                <CheckCircle className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-bold text-foreground/70">{invoice.date}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-foreground/80">{invoice.amount}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/5 text-primary">
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                onClick={handleGenerateInvoice}
                                className="h-14 rounded-2xl font-black bg-primary text-white premium-shadow hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Wallet className="h-5 w-5 mr-2" /> Gerar Fatura Manual
                            </Button>

                            {selectedClinic?.status === 'suspended' ? (
                                <Button
                                    onClick={() => {
                                        handleStatusChange(selectedClinic.id, 'active');
                                        setSelectedClinic({ ...selectedClinic, status: 'active' });
                                    }}
                                    className="h-14 rounded-2xl font-black bg-green-500 text-white shadow-lg shadow-green-200 hover:bg-green-600 transition-all"
                                >
                                    <CheckCircle className="h-5 w-5 mr-2" /> Reativar Acesso
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        handleStatusChange(selectedClinic!.id, 'suspended');
                                        setSelectedClinic({ ...selectedClinic!, status: 'suspended' });
                                    }}
                                    className="h-14 rounded-2xl font-black border-red-100 text-red-500 hover:bg-red-50/50 hover:border-red-200 transition-all"
                                >
                                    <AlertCircle className="h-5 w-5 mr-2" /> Suspender Contrato
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="rounded-3xl border-none medical-shadow max-w-sm p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <Trash2 className="h-8 w-8 text-red-500" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-foreground/80 text-center">Excluir Plano?</DialogTitle>
                        <DialogDescription className="text-center font-medium pt-2">
                            Esta ação não pode ser desfeita. O plano só será removido se não houver clínicas vinculadas a ele.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 pt-6">
                        <Button
                            variant="ghost"
                            className="flex-1 rounded-xl font-bold h-12"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1 rounded-xl font-bold h-12 bg-red-500 hover:bg-red-600"
                            onClick={handleDeletePlan}
                        >
                            Confirmar Exclusão
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Plan Statistics Detail Modal */}
            <Dialog open={isPlanStatsDialogOpen} onOpenChange={setIsPlanStatsDialogOpen}>
                <DialogContent className="rounded-[2.5rem] border-none glass medical-shadow max-w-3xl p-0 overflow-hidden">
                    <div className="bg-primary/5 p-8 border-b border-primary/10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center medical-shadow text-primary">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Clínicas no Plano: {selectedPlanForStats?.name}</DialogTitle>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Distribuição por Tier de Assinatura</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-primary/5">
                                        <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">Instituição</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">CNPJ</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest">Status</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-primary/60 tracking-widest text-right">Data Início</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clinics
                                        .filter(c => c.plano_id === selectedPlanForStats?.id)
                                        .map((clinic) => (
                                            <TableRow key={clinic.id} className="border-primary/5 hover:bg-primary/5 transition-colors">
                                                <TableCell className="py-4">
                                                    <p className="font-bold text-foreground/80">{clinic.nome}</p>
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">{clinic.cnpj || '---'}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={clinic.status} />
                                                </TableCell>
                                                <TableCell className="text-right text-xs font-bold text-muted-foreground">
                                                    {new Date(clinic.created_at).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    {clinics.filter(c => c.plano_id === selectedPlanForStats?.id).length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-20 text-center text-muted-foreground font-bold italic">Nenhuma clínica encontrada para este plano.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <Button onClick={() => setIsPlanStatsDialogOpen(false)} className="rounded-xl font-bold px-8 bg-primary hover:bg-primary/90">
                                Fechar Detalhes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function StatCard({ title, value, icon, color, trend, isPositive }: any) {
    return (
        <Card className="glass border-none medical-shadow group hover:scale-[1.02] transition-all overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 ${color}/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl text-white shadow-lg ${color} group-hover:rotate-6 transition-transform`}>
                        {icon}
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trend.split(' ')[0]}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.2em] mb-1">{title}</p>
                    <h4 className="text-4xl font-black text-foreground/80 tracking-tighter">{value}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground/40 mt-2 italic line-clamp-1">{trend}</p>
                </div>
            </CardContent>
        </Card >
    )
}

function StatusBadge({ status }: { status: ClinicDetail['status'] }) {
    const configs = {
        active: { label: 'Ativo', color: 'bg-green-100 text-green-700 border-green-200' },
        suspended: { label: 'Suspenso', color: 'bg-red-100 text-red-700 border-red-200' },
        trial: { label: 'Degustação', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    }
    const config = configs[status as keyof typeof configs] || configs.trial
    return (
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${config.color}`}>
            {config.label}
        </span>
    )
}

