import { Outlet, Link, useLocation, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { usePermissions } from "@/hooks/usePermissions"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    LayoutDashboard,
    Users,
    Settings,
    Shield,
    LogOut,
    UserCircle,
    Stethoscope,
    Heart,
    FileLock2,
    ShieldCheck,
    Building2,
    CreditCard,
    TrendingUp,
    Clock,
    ClipboardList,
    FileText
} from "lucide-react"

function DoctorMenu() {
    const location = useLocation()
    const dashboardPerms = usePermissions('dashboard')
    const patientsPerms = usePermissions('patients')
    const appointmentsPerms = usePermissions('appointments')
    const documentsPerms = usePermissions('documents')

    return (
        <>
            {dashboardPerms.view && (
                <Link
                    to="/dashboard"
                    className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-2xl transition-all duration-300 group relative overflow-hidden ${location.pathname === "/dashboard"
                        ? "bg-primary text-white medical-shadow font-bold"
                        : "text-foreground/60 hover:bg-primary/5 hover:text-primary font-semibold"
                        }`}
                >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-sm tracking-wide">Visão Geral</span>
                </Link>
            )}
            {patientsPerms.view && (
                <Link
                    to="/dashboard/patients"
                    className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-2xl transition-all duration-300 group relative overflow-hidden ${location.pathname === "/dashboard/patients"
                        ? "bg-primary text-white medical-shadow font-bold"
                        : "text-foreground/60 hover:bg-primary/5 hover:text-primary font-semibold"
                        }`}
                >
                    <Users className="h-5 w-5" />
                    <span className="text-sm tracking-wide">Meus Pacientes</span>
                </Link>
            )}
            {appointmentsPerms.view && (
                <Link
                    to="/dashboard/appointments"
                    className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-2xl transition-all duration-300 group relative overflow-hidden ${location.pathname === "/dashboard/appointments" || location.pathname === "/dashboard/consultations"
                        ? "bg-primary text-white medical-shadow font-bold"
                        : "text-foreground/60 hover:bg-primary/5 hover:text-primary font-semibold"
                        }`}
                >
                    <ClipboardList className="h-5 w-5" />
                    <span className="text-sm tracking-wide">Atendimentos & Procedimentos</span>
                </Link>
            )}
            {documentsPerms.view && (
                <Link
                    to="/dashboard/documents"
                    className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-2xl transition-all duration-300 group relative overflow-hidden ${location.pathname === "/dashboard/documents"
                        ? "bg-primary text-white medical-shadow font-bold"
                        : "text-foreground/60 hover:bg-primary/5 hover:text-primary font-semibold"
                        }`}
                >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm tracking-wide">Documentos</span>
                </Link>
            )}
            <Link
                to="/dashboard/billing"
                className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-2xl transition-all duration-300 group relative overflow-hidden ${location.pathname === "/dashboard/billing"
                    ? "bg-primary text-white medical-shadow font-bold"
                    : "text-foreground/60 hover:bg-primary/5 hover:text-primary font-semibold"
                    }`}
            >
                <CreditCard className="h-5 w-5" />
                <span className="text-sm tracking-wide">Planos e Preços</span>
            </Link>
        </>
    )
}

export function AppLayout() {
    const { user, profile, loading, signOut } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/auth/login" replace />
    }

    const getPageTitle = (pathname: string) => {
        if (pathname === "/dashboard") return "Dashboard";
        if (pathname.includes("/patients")) return "Gestão de Pacientes";
        if (pathname.includes("/appointments")) return "Agenda Médica";
        if (pathname.includes("/team")) return "Gestão de Equipe";
        if (pathname.includes("/logs")) return "Auditoria do Sistema";
        if (pathname.includes("/master")) return "Dashboard Master";
        return "Painel de Controle";
    }

    const getDaysRemaining = () => {
        if (!profile?.clinica_trial_ends) return 0
        const end = new Date(profile.clinica_trial_ends)
        const now = new Date()
        const diff = end.getTime() - now.getTime()
        return Math.ceil(diff / (1000 * 3600 * 24))
    }

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            {/* Sidebar Clínica */}
            <aside className="hidden w-72 flex-col bg-white/40 backdrop-blur-xl border-r border-primary/10 md:flex">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-2xl shadow-sm border border-primary/20">
                            <Heart className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-bold tracking-tight text-foreground/80">
                                Clinic<span className="text-primary italic">Ops</span>
                            </h2>
                            {profile?.clinica_nome && (
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                    {profile.clinica_nome}
                                </p>
                            )}
                        </div>
                    </div>

                    {profile?.clinica_status === 'trial' && (
                        <div className="mt-6 p-3 bg-amber-100/50 border border-amber-200 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Modo Trial</p>
                                <p className="text-[10px] font-medium text-amber-700/80">
                                    {getDaysRemaining()} dias restantes
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="flex-1 space-y-2 px-6 py-4">
                    {profile?.role === 'superadmin' && (
                        <>
                            <div className="px-4 pt-2 pb-2">
                                <p className="text-[10px] uppercase font-black text-primary/40 tracking-[0.2em] ml-4">Plataforma Master</p>
                            </div>
                            <NavItem
                                href="/dashboard/master?tab=clinics"
                                icon={<Building2 className="h-5 w-5" />}
                                label="Gestão de Clínicas"
                                active={location.pathname === "/dashboard/master" && (location.search === "" || location.search.includes("tab=clinics"))}
                            />
                            <NavItem
                                href="/dashboard/master?tab=plans"
                                icon={<CreditCard className="h-5 w-5" />}
                                label="Gestão de Planos"
                                active={location.search.includes("tab=plans")}
                            />
                            <NavItem
                                href="/dashboard/master?tab=metrics"
                                icon={<TrendingUp className="h-5 w-5" />}
                                label="Métricas Globais"
                                active={location.search.includes("tab=metrics")}
                            />
                            <NavItem
                                href="/dashboard/master?tab=subscriptions"
                                icon={<ShieldCheck className="h-5 w-5" />}
                                label="Controle de Assinaturas"
                                active={location.search.includes("tab=subscriptions")}
                            />
                            <NavItem
                                href="/dashboard/logs"
                                icon={<FileLock2 className="h-5 w-5" />}
                                label="Logs do Sistema"
                                active={location.pathname === "/dashboard/logs"}
                            />
                        </>
                    )}

                    {/* Menu de Clínica (Apenas se vinculado) */}
                    {profile?.clinica_id && (
                        <>
                            <div className="px-4 pt-6 pb-2">
                                <p className="text-[10px] uppercase font-black text-muted-foreground/40 tracking-[0.2em] ml-4">Minha Clínica</p>
                            </div>

                            {/* Menu Específico para Médico/Profissional */}
                            {profile?.role === 'doctor' && <DoctorMenu />}

                            {/* Menu para Admin e Outros (Fallback/Legacy) */}
                            {profile?.role !== 'doctor' && (
                                <>
                                    {/* Visualização de uso do plano */}
                                    <NavItem
                                        href="/dashboard"
                                        icon={<LayoutDashboard className="h-5 w-5" />}
                                        label={profile?.role === 'admin' ? "Uso do Plano & Dashboard" : "Visão Geral"}
                                        active={location.pathname === "/dashboard"}
                                    />

                                    {/* Gestão de pacientes */}
                                    <NavItem
                                        href="/dashboard/patients"
                                        icon={<Users className="h-5 w-5" />}
                                        label="Gestão de Pacientes"
                                        active={location.pathname === "/dashboard/patients"}
                                    />

                                    {/* Agenda Médica (Apenas para não-admins que não são doctors - existia antes?) */}
                                    {profile?.role !== 'admin' && profile?.role !== 'doctor' && (
                                        <NavItem
                                            href="/dashboard/appointments"
                                            icon={<Stethoscope className="h-5 w-5" />}
                                            label="Agenda Médica"
                                            active={location.pathname === "/dashboard/appointments"}
                                        />
                                    )}
                                </>
                            )}

                            {/* Gestão administrativa exclusiva para Admin */}
                            {profile?.role === 'admin' && (
                                <>
                                    <div className="px-4 pt-6 pb-2">
                                        <p className="text-[10px] uppercase font-black text-muted-foreground/40 tracking-[0.2em] ml-4">Administração</p>
                                    </div>
                                    <NavItem
                                        href="/dashboard/team"
                                        icon={<Settings className="h-5 w-5" />}
                                        label="Gestão de usuários"
                                        active={location.pathname === "/dashboard/team"}
                                    />
                                    <NavItem
                                        href="/dashboard/permissions"
                                        icon={<Shield className="h-5 w-5" />}
                                        label="Controle de permissões"
                                        active={location.pathname === "/dashboard/permissions"}
                                    />
                                </>
                            )}
                        </>
                    )}
                </nav>

                <div className="p-6 mt-auto">
                    <div className="glass p-4 rounded-3xl flex items-center gap-3 medical-shadow">
                        <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                            {profile?.nome?.substring(0, 1).toUpperCase() || user.email?.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate text-foreground/80">{profile?.nome || 'Usuário'}</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 truncate">
                                {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'superadmin' ? 'Plataforma Master' : 'Profissional'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden relative">
                <header className="flex h-20 items-center justify-between px-8 bg-white/40 backdrop-blur-md border-b border-primary/5">
                    <h1 className="text-xl font-bold text-foreground/70">
                        {getPageTitle(location.pathname)}
                    </h1>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="rounded-full h-11 px-4 hover:bg-primary/5 gap-2 border border-primary/5">
                                    <UserCircle className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-sm text-muted-foreground">Minha Conta</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl medical-shadow">
                                <DropdownMenuLabel>Acesso Médico</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="rounded-xl cursor-not-allowed opacity-50"><Settings className="mr-2 h-4 w-4" /> Configurações</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()} className="rounded-xl text-destructive focus:bg-destructive/10 cursor-pointer font-bold">
                                    <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div >
    )
}

function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link
            to={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${active
                ? "bg-primary text-white medical-shadow scale-[1.02]"
                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                }`}
        >
            {icon}
            {label}
        </Link>
    )
}
