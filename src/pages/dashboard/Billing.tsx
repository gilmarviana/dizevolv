import { useState, useEffect } from "react"
import { Check, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatPrice } from "@/lib/stripe-config"
import { type Subscription } from "@/services/billingService"
import { supabase } from "@/lib/supabase"
import EmbeddedCheckout from "@/components/EmbeddedCheckout"
import { masterService, type PlanDetail } from "@/services/masterService"
import { useAuth } from "@/contexts/AuthContext"

export default function Billing() {
    const { refreshProfile } = useAuth()
    const [loading, setLoading] = useState(true)
    const [dbPlans, setDbPlans] = useState<PlanDetail[]>([])
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
    const [clinicaId, setClinicaId] = useState<string>("")
    const [patientCount, setPatientCount] = useState<number>(0)
    const [checkoutOpen, setCheckoutOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<{ name: string, id: string, amount: number } | null>(null)

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            await Promise.all([
                loadPlans(),
                loadSubscriptionData()
            ])
            setLoading(false)
        }
        init()
    }, [])

    useEffect(() => {
        if (currentSubscription) {
            console.log('Billing - Current Sub Plan ID:', currentSubscription.plan_id);
            console.log('Billing - Loaded DB Plans:', dbPlans.map(p => ({ id: p.id, name: p.nome })));
        }
    }, [currentSubscription, dbPlans]);

    async function loadPlans() {
        try {
            const plans = await masterService.getPlans()
            setDbPlans(plans)
        } catch (error) {
            console.error("Error loading plans:", error)
            toast.error("Erro ao carregar planos do banco de dados")
        }
    }

    async function loadSubscriptionData() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('usuarios')
                .select('clinica_id, clinicas(status, trial_ends_at, plano_id)')
                .eq('id', user.id)
                .single()

            if (profile) {
                setClinicaId(profile.clinica_id)

                // Get patient count for this clinic
                const { count: pCount } = await supabase
                    .from('pacientes')
                    .select('*', { count: 'exact', head: true })
                    .eq('clinica_id', profile.clinica_id)

                setPatientCount(pCount || 0)

                // Supabase returns an object OR an array depending on relation type
                const clinic = Array.isArray(profile.clinicas) ? profile.clinicas[0] : profile.clinicas;

                if (clinic) {
                    const status = clinic.status
                    setCurrentSubscription({
                        id: 'demo',
                        status: status === 'trial' ? 'trialing' : 'active',
                        plan_id: clinic.plano_id,
                        current_period_end: clinic.trial_ends_at || new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString()
                    } as any)

                    if (status === 'trial' && clinic.trial_ends_at) {
                        // Trial logic handled via current_period_end above
                    }
                }
            }
        } catch (error) {
            console.error('Error loading data:', error)
        }
    }

    async function handleSubscribe(planId: string, planName: string) {
        if (!clinicaId) {
            toast.error("Erro ao identificar clínica")
            return
        }

        const plan = dbPlans.find(p => p.id === planId)
        if (!plan) {
            toast.error("Plano não encontrado")
            return
        }

        setSelectedPlan({
            name: planName,
            id: plan.id,
            amount: plan.preco_mensal
        })
        setCheckoutOpen(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 space-y-12">
            <div className="text-center space-y-4">
                <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5 text-primary animate-pulse">
                    🚀 Escalabilidade para sua Clínica
                </Badge>
                <h1 className="text-4xl font-black text-foreground/90 uppercase tracking-tighter sm:text-6xl italic">
                    Planos e Preços
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    Escolha o plano ideal para o momento da sua clínica. Todos os planos incluem as funcionalidades principais.
                </p>
            </div>

            {/* Resumo do Plano Atual */}
            {currentSubscription && (
                <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-primary/5 shadow-xl overflow-hidden">
                    <CardHeader className="bg-primary/10 border-b border-primary/10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Assinatura Atual</p>
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight italic">
                                        Plano {dbPlans.find(p => p.id === currentSubscription.plan_id)?.nome || "Bronze"}
                                    </CardTitle>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vencimento</p>
                                    <p className="text-sm font-black text-foreground">
                                        {new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="bg-white border-2 border-primary/20 hover:border-primary/40 text-primary font-black uppercase tracking-widest text-[10px] px-6 py-4 rounded-xl"
                                    onClick={() => {
                                        document.getElementById('plans-grid')?.scrollIntoView({ behavior: 'smooth' })
                                    }}
                                >
                                    Fazer Upgrade
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="py-8 px-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-muted-foreground">Uso de Pacientes</p>
                                        <p className="text-4xl font-black tracking-tighter">
                                            {patientCount} <span className="text-xl text-muted-foreground">/ {dbPlans.find(p => p.id === currentSubscription.plan_id)?.limite_pacientes || 200}</span>
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest border-2">
                                        {Math.round((patientCount / (dbPlans.find(p => p.id === currentSubscription.plan_id)?.limite_pacientes || 200)) * 100)}%
                                    </Badge>
                                </div>
                                <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(100, (patientCount / (dbPlans.find(p => p.id === currentSubscription.plan_id)?.limite_pacientes || 200)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-white/50 border border-primary/10 rounded-2xl p-6 space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Próximos passos</h4>
                                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                                    Ao atingir o limite de pacientes, você precisará fazer um upgrade para continuar cadastrando novos prontuários.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div id="plans-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
                {dbPlans.map((plan) => {
                    // @ts-ignore
                    const isCurrent = String(currentSubscription?.plan_id) === String(plan.id);

                    return (
                        <Card
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] border-2 group ${isCurrent ? 'border-primary bg-primary/5 shadow-lg ring-1 ring-primary/20' : 'border-border'
                                }`}
                        >
                            <CardHeader className="text-center pb-2">
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{plan.nome}</CardTitle>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-black">{formatPrice(plan.preco_mensal)}</span>
                                        <span className="text-muted-foreground font-bold">/mês</span>
                                    </div>
                                    <CardDescription className="font-semibold text-primary/60">
                                        Até {plan.limite_pacientes} pacientes
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 pt-4">
                                <div className="space-y-3">
                                    {plan.recursos && Object.entries(plan.recursos).map(([feature, enabled], index) => (
                                        <div key={index} className={`flex items-center gap-3 group/item ${!enabled ? 'opacity-40' : ''}`}>
                                            <div className="rounded-full p-1 bg-primary/10 transition-colors group-hover/item:bg-primary/20">
                                                <Check className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-sm font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter className="pt-2">
                                <Button
                                    className={`w-full py-6 font-black uppercase tracking-widest text-sm rounded-xl transition-all ${isCurrent
                                        ? 'bg-muted text-muted-foreground cursor-default hover:bg-muted font-black border-2 border-primary/20'
                                        : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98]'
                                        }`}
                                    onClick={() => !isCurrent && handleSubscribe(plan.id, plan.nome)}
                                    disabled={isCurrent}
                                >
                                    {isCurrent ? "Seu Plano Atual" : "Selecionar Plano"}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <Card className="max-w-2xl mx-auto border-dashed bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-xl font-black uppercase italic tracking-tight">Dúvidas Frequentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-bold text-foreground mb-2">Como funciona o período de teste?</h3>
                        <p className="text-sm text-muted-foreground font-medium">
                            Todas as novas clínicas recebem um período de teste gratuito configurado pelo administrador para explorar a plataforma.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground mb-2">Posso mudar de plano?</h3>
                        <p className="text-sm text-muted-foreground font-medium">
                            Sim! Oferecemos upgrade instantâneo para que sua clínica nunca pare de crescer.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Embedded Checkout Modal */}
            {checkoutOpen && selectedPlan && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl transform transition-all animate-in zoom-in-95 duration-300">
                        <EmbeddedCheckout
                            planName={selectedPlan.name}
                            planId={selectedPlan.id}
                            amount={selectedPlan.amount}
                            onSuccess={() => {
                                setCheckoutOpen(false)
                                setSelectedPlan(null)
                                refreshProfile()
                                loadSubscriptionData()
                            }}
                            onCancel={() => {
                                setCheckoutOpen(false)
                                setSelectedPlan(null)
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
