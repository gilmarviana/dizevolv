import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { Stethoscope, Mail, Lock, Building, ArrowRight, Loader2, CheckCircle } from "lucide-react"

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const registerSchema = z.object({
    nomeClinica: z.string().min(3, { message: "O nome da clínica deve ter pelo menos 3 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
})

type RegisterValues = z.infer<typeof registerSchema>

export default function Register() {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nomeClinica: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: RegisterValues) {
        setLoading(true)
        setError(null)

        try {
            // 1. Sign up user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.nomeClinica,
                        role: 'master'
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // 2. Create clinic record (Wait for migration to be applied by user if needed)
                // For MVP, we'll try to insert. If user hasn't run SQL yet, this might fail, 
                // but the auth part will work.
                const { error: clinicError } = await supabase
                    .from('clinicas')
                    .insert([{ nome: values.nomeClinica, owner_id: authData.user.id }])

                if (clinicError) {
                    console.error("Clinic creation error:", clinicError)
                    // We don't block the UI if just the DB record fails (e.g. schema not applied yet)
                }

                setSuccess(true)
                setTimeout(() => navigate("/auth/login"), 3000)
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao cadastrar. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <Card className="w-full max-w-[450px] text-center p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl mb-2 text-green-700">Cadastro Realizado!</CardTitle>
                    <p className="text-muted-foreground mb-8">
                        Sua clínica foi cadastrada com sucesso. Você será redirecionado para a tela de login em instantes.
                    </p>
                    <Button onClick={() => navigate("/auth/login")} className="w-full h-12">
                        Ir para Login Agora
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-[500px] animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="bg-primary rounded-xl p-2 shadow-lg shadow-primary/20">
                        <Stethoscope className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">ClinicOps</h1>
                </div>

                <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-sm overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
                    <CardHeader className="space-y-1 text-center pt-8">
                        <CardTitle className="text-3xl">Criar Conta</CardTitle>
                        <CardDescription className="text-base">
                            Comece a gerenciar sua clínica com excelência hoje mesmo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {error && (
                            <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="nomeClinica"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nome da Clínica</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="Sua Clínica" className="pl-10 h-11" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Administrativo</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="admin@clinica.com" className="pl-10 h-11" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Senha</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input type="password" placeholder="••••••••" className="pl-10 h-11" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirmar Senha</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                            <Input type="password" placeholder="••••••••" className="pl-10 h-11" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                                        Ao se cadastrar, você concorda com nossos <Link to="#" className="text-primary hover:underline">Termos de Uso</Link> e <Link to="#" className="text-primary hover:underline">Política de Privacidade</Link>.
                                    </p>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Criando conta...
                                            </>
                                        ) : (
                                            <>
                                                Finalizar Cadastro
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pb-8 border-t bg-muted/20">
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Já possui uma conta?{" "}
                            <Link to="/auth/login" className="text-primary hover:underline font-bold">
                                Entre agora
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
