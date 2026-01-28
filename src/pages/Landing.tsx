import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
    CheckCircle2,
    ShieldCheck,
    Users,
    BarChart3,
    ArrowRight,
    Heart,
    Sparkles,
    Smartphone,
    ShieldAlert,
    Zap,
    Stethoscope,
    Smile,
    Quote,
    Building2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState, useEffect } from "react"
import { masterService, type PlanDetail } from "@/services/masterService"

export function LandingPage() {
    const [plans, setPlans] = useState<PlanDetail[]>([])

    useEffect(() => {
        masterService.getPlans().then(setPlans)
    }, [])
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header/Nav */}
            <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b bg-white/80 backdrop-blur-xl border-black/[0.05]">
                <div className="container mx-auto flex h-20 items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary rounded-2xl p-2.5 shadow-lg shadow-primary/20">
                            <Heart className="h-6 w-6 text-white fill-white/20" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-foreground">Clinic<span className="text-primary italic">Ops</span></span>
                    </div>
                    <nav className="hidden lg:flex gap-10 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        <a href="#features" className="hover:text-primary transition-colors hover:translate-y-[-1px]">Funcionalidades</a>
                        <a href="#workflow" className="hover:text-primary transition-colors hover:translate-y-[-1px]">Fluxo</a>
                        <a href="#mobile" className="hover:text-primary transition-colors hover:translate-y-[-1px]">Mobile</a>
                        <a href="#pricing" className="hover:text-primary transition-colors hover:translate-y-[-1px]">Planos</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/auth/login" className="hidden sm:block">
                            <Button variant="ghost" className="text-sm font-black text-foreground hover:text-primary tracking-tight">Entrar</Button>
                        </Link>
                        <Link to="/auth/register">
                            <Button className="h-12 text-sm font-black bg-primary hover:bg-primary/90 text-white rounded-full px-8 premium-shadow transition-all hover:scale-105 active:scale-95">
                                Experimentar Grátis
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">

                {/* SECTION 1: HERO (High Contrast) */}
                <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden section-dot-pattern">
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <div className="inline-flex items-center rounded-full border-2 border-primary/20 px-6 py-2 text-sm font-black mb-10 bg-primary/5 text-primary animate-in fade-in slide-in-from-top-4 duration-700 uppercase tracking-widest">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Upgrade na sua Gestão Clínica
                        </div>
                        <h1 className="text-6xl font-black tracking-tight sm:text-7xl md:text-8xl mb-8 leading-[0.95] text-foreground">
                            Gestão que cuida de <br />
                            quem <span className="heading-vibrant italic">cuida.</span>
                        </h1>
                        <p className="mx-auto max-w-[850px] text-xl md:text-2xl text-muted-foreground font-medium mb-14 leading-relaxed">
                            O ClinicOps simplifica o operacional médico com <span className="text-foreground font-black">segurança RLS</span>,
                            interface premium e compliance total. O futuro da saúde é digital.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
                            <Link to="/auth/register">
                                <Button size="lg" className="h-16 px-12 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-white premium-shadow transition-all hover:scale-105">
                                    Começar Jornada Digital
                                </Button>
                            </Link>
                            <Link to="/auth/login" className="group">
                                <div className="flex items-center text-foreground font-black text-lg px-8 py-3 bg-white border-2 border-black/[0.07] rounded-2xl hover:bg-black/[0.02] transition-colors">
                                    Ver demonstração
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>

                        <div className="max-w-6xl mx-auto rounded-[3rem] border-8 border-white shadow-[0_50px_100px_-15px_rgba(0,0,0,0.15)] overflow-hidden relative group">
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                            <img
                                src="/doctor_using_tablet.png"
                                alt="ClinicOps Dashboard"
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-1000"
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 2: PARTNERS (Subtle Contrast) */}
                <section className="py-20 border-y border-black/[0.05] bg-muted/50">
                    <div className="container mx-auto px-6">
                        <p className="text-center text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-12">Consolidado em grandes redes médicas</p>
                        <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter text-foreground">VeroClin</div>
                            <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter text-foreground">MedCenter</div>
                            <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter text-foreground">NovaSaúde</div>
                            <div className="flex items-center gap-2 font-black text-2xl uppercase tracking-tighter text-foreground">BioVida</div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: FEATURES (Modern Cards) */}
                <section id="features" className="py-32 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-20 text-left">
                            <div className="space-y-6">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
                                    Arquitetura pensada na <br />
                                    <span className="text-primary italic">segurança e fluidez.</span>
                                </h2>
                                <p className="text-muted-foreground text-xl font-medium max-w-xl">
                                    Tecnologias de ponta integradas para que você nunca precise se preocupar com travamentos ou vazamentos de dados.
                                </p>
                            </div>
                            <div className="flex justify-start lg:justify-end">
                                <Button variant="outline" className="h-14 px-8 rounded-2xl font-black text-foreground border-black/10 hover:bg-black/5">Explorar Todas Funções</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <FeatureCard
                                icon={<ShieldCheck className="h-7 w-7" />}
                                title="Isolamento RLS"
                                description="Seus dados são blindados por Row Level Security nativo no Postgres. Blindagem 100% garantida."
                                color="bg-primary/10"
                            />
                            <FeatureCard
                                icon={<Smartphone className="h-7 w-7" />}
                                title="Sempre Mobile"
                                description="Nascemos no celular. App React Native fluido para iOS e Android com biometria facial."
                                color="bg-secondary/10"
                            />
                            <FeatureCard
                                icon={<BarChart3 className="h-7 w-7" />}
                                title="Analytics"
                                description="Dashboard financeiro e clínico com previsibilidade de caixa e taxa de conversão."
                                color="bg-primary/10"
                            />
                            <FeatureCard
                                icon={<Users className="h-7 w-7" />}
                                title="Multi-tenant"
                                description="Gerencie 1 ou 100 clínicas sob o mesmo teto digital com controle total de equipe."
                                color="bg-secondary/10"
                            />
                            <FeatureCard
                                icon={<ShieldAlert className="h-7 w-7" />}
                                title="LGPD Compliance"
                                description="Nativa de cabo a rabo. Termos de consentimento digital e trilhas de auditoria imutáveis."
                                color="bg-primary/10"
                            />
                            <FeatureCard
                                icon={<Zap className="h-7 w-7" />}
                                title="Performance"
                                description="Tempo de resposta inferior a 100ms. O sistema mais rápido do mercado, garantido."
                                color="bg-secondary/10"
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 4: WORKFLOW (Visual timeline) */}
                <section id="workflow" className="py-32 bg-foreground text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 skew-x-[-12deg] translate-x-12" />
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                            <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">Implementação <span className="text-primary italic">Relâmpago.</span></h2>
                            <p className="text-white/60 text-xl font-medium">Do cadastro à primeira consulta em apenas 15 minutos.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                            <div className="space-y-6 group">
                                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-4xl font-black text-primary mx-auto group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    01
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tight">Configure</h4>
                                <p className="text-white/40 text-lg font-medium leading-relaxed">Personalize sua clínica, serviços e valores de atendimento de forma intuitiva.</p>
                            </div>
                            <div className="space-y-6 group">
                                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-4xl font-black text-primary mx-auto group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    02
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tight">Migre</h4>
                                <p className="text-white/40 text-lg font-medium leading-relaxed">Importe pacientes e históricos via CSV com nosso assistente inteligente.</p>
                            </div>
                            <div className="space-y-6 group">
                                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-4xl font-black text-primary mx-auto group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    03
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tight">Atenda</h4>
                                <p className="text-white/40 text-lg font-medium leading-relaxed">Emita receitas, registros e agendamentos instantaneamente em qualquer tela.</p>
                            </div>
                        </div>

                        <div className="mt-32 p-4 bg-white/5 border-2 border-white/10 rounded-[3.5rem] overflow-hidden backdrop-blur-md">
                            <img
                                src="/medical_dashboard_mockup.png"
                                alt="Painel de Agendamento"
                                className="w-full h-auto rounded-[3rem] shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 5: MOBILE (High Impact) */}
                <section id="mobile" className="py-40 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                            <div className="space-y-10 order-2 lg:order-1 flex justify-center lg:justify-start">
                                <div className="relative group">
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-primary/20 blur-[120px] rounded-full" />
                                    <img
                                        src="/mobile_app_mockup.png"
                                        alt="App Mobile Mockup"
                                        className="relative z-10 w-[380px] h-auto rounded-[4rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.2)] border-[12px] border-black transition-transform duration-1000 group-hover:-rotate-3"
                                    />
                                </div>
                            </div>
                            <div className="space-y-10 order-1 lg:order-2 text-center lg:text-left">
                                <div className="space-y-6">
                                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-foreground">
                                        Mobilidade é <br />
                                        sua <span className="text-primary italic underline decoration-primary/20 underline-offset-8">liberdade.</span>
                                    </h2>
                                    <p className="text-muted-foreground text-2xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                        Prontuários, agenda e notificações em tempo real. Compatível com biometria para segurança absoluta do prontuário médico.
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                                    <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-white bg-foreground hover:bg-black transition-all hover:translate-y-[-4px] text-lg">
                                        App Store
                                    </Button>
                                    <Button size="lg" className="h-16 px-10 rounded-2xl font-black text-foreground bg-white border-2 border-black/[0.07] hover:bg-black/5 transition-all hover:translate-y-[-4px] text-lg">
                                        Google Play
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 6: TESTIMONIALS (Clean & Trust) */}
                <section className="py-32 bg-muted/30 border-y border-black/[0.05]">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-24 space-y-4">
                            <h2 className="text-5xl font-black text-foreground tracking-tight">O que dizem os <span className="text-primary italic">pioneiros.</span></h2>
                            <p className="text-muted-foreground text-xl font-medium">Junte-se a mais de 500 clínicas que já subiram de nível.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <TestimonialCard
                                name="Dr. Ricardo Martins"
                                role="Cardiologista"
                                text="A experiência ClinicOps é superior a qualquer sistema que já usei em 20 anos de profissão. O design ajuda a manter o foco no paciente."
                            />
                            <TestimonialCard
                                name="Dra. Helena Souza"
                                role="Gestora Clínica"
                                text="Como gestora, o Dashboard me deu a visão que eu não tinha sobre a rentabilidade real de cada procedimento."
                            />
                            <TestimonialCard
                                name="Dr. Fabio Alencar"
                                role="Clínico Geral"
                                text="Atender via tablet e saber que os dados estão seguros me dá uma liberdade que eu nunca tive antes de conhecer o ClinicOps."
                            />
                        </div>
                    </div>
                </section>

                {/* SECTION 7: FAQ (Clean Accordion) */}
                <section className="py-32 bg-white">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="text-center mb-24 space-y-4">
                            <h2 className="text-5xl font-black text-foreground tracking-tight">Dúvidas? <span className="text-primary italic">Damos a resposta.</span></h2>
                            <p className="text-muted-foreground text-xl font-medium">Tudo o que você precisa saber antes de começar.</p>
                        </div>
                        <Accordion type="single" collapsible className="w-full space-y-6">
                            <AccordionItem value="item-1" className="bg-muted/50 border-none px-8 rounded-3xl transition-all data-[state=open]:bg-primary/5 data-[state=open]:ring-2 data-[state=open]:ring-primary/20">
                                <AccordionTrigger className="font-black text-xl text-foreground hover:no-underline py-8">Os meus dados estão seguros?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-lg pb-8 leading-relaxed font-medium">
                                    Seus dados são criptografados e isolados via Row Level Security (RLS) diretamente no banco de dados. Cada clínica possui sua própria camada lógica de segurança, impedindo qualquer vazamento inadvertido.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="bg-muted/50 border-none px-8 rounded-3xl transition-all data-[state=open]:bg-primary/5 data-[state=open]:ring-2 data-[state=open]:ring-primary/20">
                                <AccordionTrigger className="font-black text-xl text-foreground hover:no-underline py-8">Como funciona a migração de dados?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-lg pb-8 leading-relaxed font-medium">
                                    Nossa equipe técnica ajuda você a exportar seus dados do sistema antigo e importar para o ClinicOps via CSV ou integração direta, garantindo que nenhum histórico de paciente seja perdido.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="bg-muted/50 border-none px-8 rounded-3xl transition-all data-[state=open]:bg-primary/5 data-[state=open]:ring-2 data-[state=open]:ring-primary/20">
                                <AccordionTrigger className="font-black text-xl text-foreground hover:no-underline py-8">O suporte responde rápido?</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-lg pb-8 leading-relaxed font-medium">
                                    Sim! Temos um time de suporte especializado em rotinas clínicas disponível 24/7 via chat e WhatsApp (plano Multi-Clínica), com tempo médio de resposta inferior a 5 minutos.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </section>

                {/* SECTION 8: PRICING (High Contrast & Premium) */}
                <section id="pricing" className="py-40 bg-muted/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 section-dot-pattern" />
                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <div className="max-w-3xl mx-auto mb-24 space-y-6">
                            <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-tight text-foreground">Escolha seu <br /><span className="text-primary italic">próximo nível.</span></h2>
                            <p className="text-muted-foreground text-2xl font-medium italic">Simples demais. Sem letras miúdas ou taxas extras.</p>
                        </div>

                        <div className={`grid grid-cols-1 ${plans.length === 1 ? 'max-w-xl' :
                            plans.length === 2 ? 'md:grid-cols-2 max-w-5xl' :
                                plans.length === 3 ? 'md:grid-cols-3 max-w-7xl' :
                                    'lg:grid-cols-4 max-w-[95rem]'
                            } gap-8 mx-auto items-stretch`}>
                            {plans.map((plan, index) => {
                                // Dynamic premium logic: 
                                // - If 1-3 plans: 2nd plan is premium
                                // - If 4 plans: 3rd plan (index 2) is premium (usually the 'Gold' level)
                                const isPremium = plans.length >= 4 ? index === 2 : index === 1 || plans.length === 1;
                                const isLargeGrid = plans.length >= 4;

                                return (
                                    <Card
                                        key={plan.id}
                                        className={`relative ${isPremium ? 'bg-foreground border-none scale-105 z-10 shadow-[0_50px_100px_-20px_rgba(37,99,235,0.25)]' : 'bg-white border-2 border-black/[0.05] shadow-xl hover:border-primary/30'} ${isLargeGrid ? 'p-8' : 'p-12'} rounded-[3rem] transition-all duration-500 flex flex-col items-center group overflow-hidden`}
                                    >
                                        {isPremium && (
                                            <>
                                                <div className="absolute top-0 right-0 w-full h-2 bg-primary" />
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black px-6 py-2.5 rounded-full uppercase tracking-[0.3em] shadow-xl group-hover:scale-110 transition-transform whitespace-nowrap">
                                                    Mais Escolhido
                                                </div>
                                            </>
                                        )}

                                        <div className={`h-14 w-14 ${isPremium ? 'bg-white/10 mt-2' : 'bg-primary/10'} rounded-2xl flex items-center justify-center mb-6 shadow-2xl transition-transform group-hover:scale-110`}>
                                            {index === 0 ? <Stethoscope className={`h-7 w-7 ${isPremium ? 'text-white' : 'text-primary'}`} /> :
                                                index === 1 ? <Users className={`h-7 w-7 ${isPremium ? 'text-white' : 'text-primary'}`} /> :
                                                    index === 2 ? <ShieldCheck className={`h-7 w-7 ${isPremium ? 'text-white' : 'text-primary'}`} /> :
                                                        <Building2 className={`h-7 w-7 ${isPremium ? 'text-white' : 'text-primary'}`} />}
                                        </div>

                                        <h3 className={`text-2xl font-black mb-1 uppercase tracking-tighter ${isPremium ? 'text-white' : 'text-foreground'}`}>{plan.nome}</h3>
                                        <p className={`${isPremium ? 'text-white/40' : 'text-muted-foreground'} font-black mb-8 uppercase tracking-widest text-[10px]`}>
                                            {plan.limite_pacientes >= 9999 ? 'Escala Ilimitada' : `${plan.limite_pacientes.toLocaleString()} Pacientes`}
                                        </p>

                                        <div className={`mb-10 ${isPremium ? 'text-white' : 'text-foreground'}`}>
                                            <span className={`text-xs font-black align-top mr-1 ${isPremium ? 'text-white/40' : 'text-muted-foreground'}`}>R$</span>
                                            <span className={`${isLargeGrid ? 'text-5xl' : 'text-7xl'} font-black tracking-tighter`}>{(plan.preco_mensal / 100).toString().split('.')[0]}</span>
                                            <span className={`font-black ml-1 text-base ${isPremium ? 'text-white/40' : 'text-muted-foreground'}`}>/mês</span>
                                        </div>

                                        <div className="space-y-4 w-full mb-10 flex-1">
                                            <PricingItem label="Prontuário Digital" color={isPremium ? 'text-white' : 'text-foreground'} size="sm" />
                                            <PricingItem label="App App Mobile" color={isPremium ? 'text-white' : 'text-foreground'} size="sm" />
                                            <PricingItem label="Agenda Inteligente" color={isPremium ? 'text-white' : 'text-foreground'} size="sm" />
                                            <PricingItem label="Segurança RLS" color={isPremium ? 'text-white' : 'text-foreground'} size="sm" />
                                            {plan.preco_mensal > 500 && <PricingItem label="Suporte VIP 24/7" color={isPremium ? 'text-white' : 'text-foreground'} bold={isPremium} size="sm" />}
                                        </div>

                                        <Link to="/auth/register" className="w-full">
                                            <Button
                                                variant={isPremium ? 'default' : 'outline'}
                                                className={`w-full h-14 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95 ${isPremium
                                                    ? 'bg-primary hover:bg-primary/90 text-white premium-shadow'
                                                    : 'text-primary border-primary/20 hover:bg-primary/5'
                                                    }`}
                                            >
                                                {isPremium ? 'Selecionar Plano' : 'Começar Agora'}
                                            </Button>
                                        </Link>
                                    </Card>
                                )
                            })}
                        </div>

                        <p className="mt-20 text-muted-foreground font-black flex items-center justify-center gap-3 text-sm uppercase tracking-widest">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            Sem fidelidade. Cancele com um clique.
                        </p>
                    </div>
                </section>

            </main>

            <footer className="py-24 bg-white border-t border-black/[0.05]">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
                        <div className="space-y-8 col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2">
                                <Heart className="h-7 w-7 text-primary fill-primary/20" />
                                <span className="text-3xl font-black tracking-tighter">ClinicOps</span>
                            </div>
                            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                                Redefinindo o padrão de eficiência na saúde brasileira com tecnologia de ponta para quem cuida da vida.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-black text-foreground mb-8 uppercase text-xs tracking-[0.4em]">Produto</h4>
                            <ul className="space-y-5 text-sm font-black text-muted-foreground uppercase tracking-widest">
                                <li><a href="#" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">App Mobile</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Segurança RLS</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-foreground mb-8 uppercase text-xs tracking-[0.4em]">Infra</h4>
                            <ul className="space-y-5 text-sm font-black text-muted-foreground uppercase tracking-widest">
                                <li><a href="#" className="hover:text-primary transition-colors">Compliance LGPD</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-foreground mb-8 uppercase text-xs tracking-[0.4em]">Suporte</h4>
                            <ul className="space-y-5 text-sm font-black text-muted-foreground uppercase tracking-widest">
                                <li><a href="#" className="text-primary font-black">comercial@clinicops.com</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Ajuda 24/7</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-black/[0.05] flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                        <p>© 2026 CLINICOPS. SISTEMAS DE GESTÃO PARA SAÚDE.</p>
                        <div className="flex gap-12">
                            <span className="hover:text-primary transition-colors cursor-pointer">SÃO PAULO / BR</span>
                            <span className="text-primary/40">V1.5.0 STABLE</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
    return (
        <Card className="bg-white border-2 border-black/[0.05] p-10 rounded-[2.5rem] hover:border-primary/50 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group">
            <CardHeader className="p-0 mb-8">
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-6 shadow-sm`}>
                    {icon}
                </div>
                <CardTitle className="text-2xl font-black text-foreground tracking-tight">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <p className="text-muted-foreground leading-relaxed font-medium text-lg">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

function PricingItem({ label, color, bold = false, size = 'lg' }: { label: string, color: string, bold?: boolean, size?: 'sm' | 'lg' }) {
    return (
        <div className={`flex items-center ${size === 'sm' ? 'gap-3' : 'gap-4'}`}>
            <div className={`${size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} rounded-full bg-primary/10 flex items-center justify-center shrink-0`}>
                <CheckCircle2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} text-primary`} />
            </div>
            <span className={`${size === 'sm' ? 'text-sm' : 'text-lg'} ${color} ${bold ? 'font-black' : 'font-medium opacity-80'}`}>{label}</span>
        </div>
    )
}

function TestimonialCard({ name, role, text }: { name: string, role: string, text: string }) {
    return (
        <Card className="bg-white border-none p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 relative h-full flex flex-col">
            <div className="absolute top-10 right-10 opacity-5">
                <Quote className="h-16 w-16 text-foreground fill-foreground" />
            </div>
            <CardContent className="p-0 space-y-8 flex-1 flex flex-col">
                <div className="flex text-primary gap-1">
                    {[1, 2, 3, 4, 5].map(i => <Smile key={i} className="h-5 w-5 fill-primary/20" />)}
                </div>
                <p className="text-foreground/70 text-xl italic font-medium leading-relaxed flex-1">"{text}"</p>
                <div className="flex items-center gap-5 pt-8 border-t border-black/[0.05]">
                    <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
                        {name[0]}{name.split(' ')[1]?.[0]}
                    </div>
                    <div>
                        <p className="font-black text-lg text-foreground tracking-tight">{name}</p>
                        <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">{role}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
