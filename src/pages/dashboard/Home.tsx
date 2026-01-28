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
    AlertCircle,
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
import { Navigate } from "react-router-dom"

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
    const [patientCount, setPatientCount] = useState(0)
    const [planInfo, setPlanInfo] = useState<{ nombre: string, limit: number } | null>(null)

    useEffect(() => {
        if (profile?.clinica_id) {
            loadStats()
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

            if (clinic?.plans) {
                setPlanInfo({
                    nombre: clinic.plans.nome,
                    limit: clinic.plans.limite_pacientes
                })
            }
        } catch (error) {
            console.error(error)
        }
    }

    const usagePercentage = planInfo ? Math.min((patientCount / planInfo.limit) * 100, 100) : 0

    // Trial Logic
    const isTrial = profile?.clinica_status === 'trial'
    const trialEndDate = profile?.clinica_trial_ends ? new Date(profile.clinica_trial_ends) : null
    const daysRemaining = trialEndDate ? Math.ceil((trialEndDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground/80">Painel Geral</h1>
                    <p className="text-muted-foreground/80 font-medium">Bom dia, {profile?.nome || 'Doutor(a)'}. Aqui está o resumo da sua clínica hoje.</p>
                </div>
                <Button className="rounded-full font-bold px-6 bg-primary medical-shadow space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Ver Agenda Completa</span>
                </Button>
            </div>

            {/* Stats Suaves */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Pacientes Ativos"
                    value={patientCount.toLocaleString()}
                    subValue="Base total de cadastros"
                    icon={<Users className="h-5 w-5" />}
                    color="bg-primary/10 text-primary border border-primary/20"
                />
                <StatsCard
                    title="Consultas Hoje"
                    value="14"
                    subValue="2 urgências agendadas"
                    icon={<Stethoscope className="h-5 w-5" />}
                    color="bg-secondary/10 text-secondary border border-secondary/20"
                />
                <StatsCard
                    title="Receitas Digitais"
                    value="45"
                    subValue="Emitidas nas últimas 24h"
                    icon={<FileText className="h-5 w-5" />}
                    color="bg-accent/20 text-accent-foreground border border-accent/30"
                />
                <StatsCard
                    title="Taxa de Presença"
                    value="96%"
                    subValue="Acima da média anual"
                    icon={<Activity className="h-5 w-5" />}
                    color="bg-primary/5 text-primary border border-primary/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 glass border-none medical-shadow">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-foreground/70">Fluxo de Atendimentos</CardTitle>
                        <CardDescription className="font-medium">Cadastros de pacientes nos últimos 7 dias</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorPacientes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="pacientes"
                                        stroke="#38bdf8"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorPacientes)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 glass border-none medical-shadow overflow-hidden flex flex-col">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-foreground/70">Uso do Plano</CardTitle>
                            <span className={`px-3 py-1 text-white text-[10px] font-black uppercase rounded-full tracking-tighter ${isTrial ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'bg-primary'
                                }`}>
                                {planInfo?.nombre || 'Solo'}
                            </span>
                        </div>
                        <CardDescription className="font-medium italic">Limite de base de pacientes</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center gap-6">
                        <div className="space-y-4">
                            <div className="flex items-end justify-between font-black">
                                <span className={`text-4xl ${isTrial ? 'text-amber-500' : 'text-primary'}`}>{usagePercentage.toFixed(1)}%</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{patientCount} / {planInfo?.limit || 2000} un.</span>
                            </div>
                            <Progress value={usagePercentage} className={`h-3 ${isTrial ? 'bg-amber-500/10 [&>div]:bg-amber-500' : 'bg-primary/10'}`} />
                        </div>

                        {isTrial && trialEndDate ? (
                            <div className="p-4 bg-amber-50 rounded-2xl flex items-start gap-3 border border-amber-100">
                                <Clock className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                                        Período de Teste Ativo
                                    </p>
                                    <p className="text-xs text-amber-700/80 font-medium">
                                        Expira em: <span className="font-bold">{trialEndDate.toLocaleDateString()}</span> ({daysRemaining} dias)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-muted/30 rounded-2xl flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 text-primary/60 mt-0.5" />
                                <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase tracking-tight">
                                    Seu plano atual permite até <span className="text-foreground">{planInfo?.limit.toLocaleString() || '2.000'}</span> pacientes cadastrados. Faça o upgrade para expandir sua operação.
                                </p>
                            </div>
                        )}

                        <Button variant="outline" className={`w-full h-11 rounded-xl border-dashed font-bold mt-2 ${isTrial
                                ? 'border-amber-500/30 text-amber-600 hover:bg-amber-50'
                                : 'border-primary/30 text-primary hover:bg-primary/5'
                            }`}>
                            {isTrial ? 'Assinar Agora' : 'Mudar de Plano'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-12 glass border-none medical-shadow">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-foreground/70">Atividades Recentes</CardTitle>
                            <CardDescription className="font-medium">Eventos em tempo real na clínica</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-primary" onClick={() => loadStats()}>
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ActivityItem
                                icon={<UserPlus className="h-4 w-4" />}
                                title="Novo Prontuário"
                                description="Cadastro realizado com sucesso."
                                time="Agora"
                            />
                            <ActivityItem
                                icon={<Calendar className="h-4 w-4" />}
                                title="Agendamento"
                                description="Consulta confirmada para amanhã."
                                time="12m"
                            />
                            <ActivityItem
                                icon={<FileText className="h-4 w-4" />}
                                title="Documento"
                                description="PDF anexado ao histórico."
                                time="1h"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatsCard({ title, value, subValue, icon, color }: {
    title: string, value: string, subValue: string, icon: React.ReactNode, color: string
}) {
    return (
        <Card className="glass border-none shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 cursor-default ring-1 ring-black/[0.03]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
                <div className={`p-3 rounded-2xl ${color}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-extrabold text-foreground/80">{value}</div>
                <p className="text-xs font-bold text-muted-foreground/60 mt-2 flex items-center">
                    <TrendingUp className="h-3 w-3 text-primary mr-1" />
                    {subValue}
                </p>
            </CardContent>
        </Card>
    )
}

function ActivityItem({ icon, title, description, time }: { icon: React.ReactNode, title: string, description: string, time: string }) {
    return (
        <div className="flex items-start gap-4 p-2 rounded-2xl hover:bg-primary/5 transition-colors">
            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-primary/5 mt-0.5 text-primary">
                {icon}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground/70">{title}</p>
                    <span className="text-[10px] font-bold text-muted-foreground/40">{time}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                    {description}
                </p>
            </div>
        </div>
    )
}
