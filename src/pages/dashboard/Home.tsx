import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Users,
    Calendar,
    FileText,
    TrendingUp,
    Activity,
    UserPlus,
    ArrowRight,
    Stethoscope,
    Clock
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Navigate, useNavigate } from "react-router-dom"
import { Sparkles, Crown, MoreVertical, Settings2, Trash2, ExternalLink } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const data = [
    { name: 'Seg', pacientes: 4 },
    { name: 'Ter', pacientes: 7 },
    { name: 'Qua', pacientes: 5 },
    { name: 'Qui', pacientes: 10 },
    { name: 'Sex', pacientes: 8 },
    { name: 'Sab', pacientes: 3 },
    { name: 'Dom', pacientes: 1 },
];

export default function DashboardHome() {
    const { profile } = useAuth()
    const navigate = useNavigate()
    const [patientCount, setPatientCount] = useState(0)
    const [planInfo, setPlanInfo] = useState<{ nombre: string, limit: number } | null>(null)
    const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0)
    const [isOnTrial, setIsOnTrial] = useState<boolean>(false)

    useEffect(() => {
        if (profile?.clinica_id) {
            loadStats()
            loadTrialStatus()
        }
    }, [profile])

    if (profile?.role === 'superadmin') {
        return <Navigate to="/dashboard/master" replace />
    }

    async function loadStats() {
        try {
            // 1. Get patient count
            const { count } = await supabase
                .from('pacientes')
                .select('*', { count: 'exact', head: true })

            setPatientCount(count || 0)

            // 2. Get clinical plan info
            const { data: clinic } = await supabase
                .from('clinicas')
                .select('*, plans:planos(*)')
                .eq('id', profile?.clinica_id)
                .single()

            if (clinic) {
                // Supabase might return an array or object for joins
                const planData = Array.isArray(clinic.plans) ? clinic.plans[0] : clinic.plans;

                if (planData) {
                    setPlanInfo({
                        nombre: planData.nome,
                        limit: planData.limite_pacientes
                    })
                }
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    async function loadTrialStatus() {
        try {
            if (!profile?.clinica_id) return

            // Check clinicas table directly for status
            const { data: clinic } = await supabase
                .from('clinicas')
                .select('status, trial_ends_at')
                .eq('id', profile.clinica_id)
                .single()

            if (clinic) {
                if (clinic.status === 'trial') {
                    setIsOnTrial(true)
                    if (clinic.trial_ends_at) {
                        const trialEndDate = new Date(clinic.trial_ends_at);
                        const today = new Date();
                        const diffTime = trialEndDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(trialEndDate.getTime() > today.getTime() ? diffTime / (1000 * 60 * 60 * 24) : 0);
                        setTrialDaysRemaining(Math.max(0, diffDays));
                    } else {
                        setTrialDaysRemaining(30);
                    }
                } else if (clinic.status === 'active') {
                    setIsOnTrial(false)
                }
            }
        } catch (error) {
            console.error('Error loading trial status:', error)
        }
    }

    async function handleCancelSubscription() {
        if (!window.confirm('Tem certeza que deseja cancelar sua assinatura? Você voltará para o modo Trial.')) return

        try {
            const { error } = await supabase
                .from('clinicas')
                .update({
                    status: 'trial',
                    trial_ends_at: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString() // Mais 7 dias de trial ao cancelar? Ou mantém o que tinha.
                })
                .eq('id', profile?.clinica_id)

            if (error) throw error

            toast.success('Assinatura cancelada com sucesso. Você agora está no modo Trial.')
            window.location.reload() // Refresh to update all UI
        } catch (error) {
            console.error('Error cancelling subscription:', error)
            toast.error('Erro ao cancelar assinatura.')
        }
    }

    const stats = [
        {
            title: "Total de Pacientes",
            value: patientCount.toString(),
            description: "Pacientes cadastrados",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "Agendamentos Hoje",
            value: "12",
            description: "Para o dia de hoje",
            icon: Calendar,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            title: "Prontuários Novos",
            value: "5",
            description: "Nas últimas 24h",
            icon: FileText,
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            title: "Taxa de Retorno",
            value: "85%",
            description: "+2% desde o mês passado",
            icon: TrendingUp,
            color: "text-orange-600",
            bg: "bg-orange-100"
        }
    ]

    return (
        <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Trial Banner */}
            {isOnTrial && (
                <Card className="bg-amber-500/10 border-amber-500/20 shadow-sm overflow-hidden group">
                    <CardContent className="pt-6 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="h-24 w-24 text-amber-500" />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 animate-pulse">
                                    <Clock className="h-6 w-6 text-amber-950" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-amber-950 uppercase tracking-tight">Período de Experiência</h3>
                                    <p className="text-amber-900/70 font-bold">
                                        Assine agora para não perder o acesso. Restam <span className="text-amber-600 text-lg">{trialDaysRemaining} dias</span>.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => navigate('/dashboard/billing')}
                                className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-black uppercase tracking-widest px-8 py-6 rounded-xl shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                            >
                                <Crown className="h-5 w-5 mr-2" />
                                Escolher Plano
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Header section with context */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground/90">
                        Olá, {profile?.nome || 'Doutor(a)'} 👋
                    </h1>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        Confira o que está acontecendo na sua clínica hoje.
                    </p>
                </div>

                {planInfo && (
                    <div className="flex items-center gap-2">
                        <Card className="border-none bg-primary/5 shadow-none px-4 py-2 flex items-center gap-3 rounded-2xl h-14">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Crown className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 leading-none mb-1">Seu Plano</p>
                                <p className="text-sm font-black text-primary uppercase">{planInfo.nombre}</p>
                            </div>
                            <div className="h-8 w-[1px] bg-primary/10 mx-1" />
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">Capacidade</p>
                                <p className="text-sm font-black text-foreground">
                                    {patientCount} <span className="text-muted-foreground">/ {planInfo.limit}</span>
                                </p>
                            </div>
                        </Card>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-14 w-10 rounded-2xl bg-primary/5 hover:bg-primary/10 border-none transition-all">
                                    <MoreVertical className="h-5 w-5 text-primary" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl medical-shadow">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Gerenciar Plano</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/dashboard/billing')} className="rounded-xl flex items-center gap-2 p-3 cursor-pointer group">
                                    <Settings2 className="h-4 w-4 text-primary transition-transform group-hover:rotate-12" />
                                    <span className="font-bold text-sm">Mudar Plano</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/dashboard/billing')} className="rounded-xl flex items-center gap-2 p-3 cursor-pointer group">
                                    <ExternalLink className="h-4 w-4 text-blue-500" />
                                    <span className="font-bold text-sm">Ver Detalhes</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleCancelSubscription} className="rounded-xl flex items-center gap-2 p-3 cursor-pointer group text-destructive focus:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="font-bold text-sm">Cancelar Plano</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black mb-1 italic tracking-tighter">
                                {stat.value}
                            </div>
                            <p className="text-xs font-bold text-muted-foreground/60 flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-border/50 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Fluxo de Pacientes</CardTitle>
                                <CardDescription className="font-medium text-muted-foreground/70">Atendimentos realizados nos últimos 7 dias</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="font-bold uppercase text-[10px] tracking-widest border-2">7 DIAS</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        className="font-bold"
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                        className="font-bold"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="pacientes"
                                        stroke="#2563eb"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorPacientes)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-lg font-black uppercase tracking-tight">Atalhos Rápidos</CardTitle>
                        <CardDescription className="font-medium text-muted-foreground/70">Ações frequentes do dia a dia</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 flex-1">
                        <Button
                            variant="outline"
                            className="w-full justify-start p-6 text-base font-black uppercase tracking-tight hover:bg-primary/5 hover:text-primary transition-all border-2 rounded-2xl group"
                            onClick={() => navigate('/dashboard/patients')}
                        >
                            <UserPlus className="mr-4 h-5 w-5 transition-transform group-hover:scale-125" />
                            Novo Paciente
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start p-6 text-base font-black uppercase tracking-tight hover:bg-primary/5 hover:text-primary transition-all border-2 rounded-2xl group"
                            onClick={() => navigate('/dashboard/appointments')}
                        >
                            <Calendar className="mr-4 h-5 w-5 transition-transform group-hover:scale-125" />
                            Ver Agenda
                        </Button>
                    </CardContent>
                    <div className="p-6 mt-auto bg-muted/30 border-t">
                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                            <Stethoscope className="h-4 w-4" />
                            Suporte especializado 24/7
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
