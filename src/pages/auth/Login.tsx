import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { Lock, Mail, Loader2, Heart, ArrowLeft } from "lucide-react"
import { useState } from "react"

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

const loginSchema = z.object({
    email: z.string().email({ message: "E-mail clínico inválido" }),
    password: z.string().min(6, { message: "Senha obrigatória" }),
})

type LoginValues = z.infer<typeof loginSchema>

export default function Login() {
    const navigate = useNavigate()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    async function onSubmit(values: LoginValues) {
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: values.email,
                password: values.password,
            })
            if (error) {
                console.error("Login failed:", error.message)
                if (error.message.includes("Email not confirmed")) {
                    setError("E-mail não confirmado. Verifique sua caixa de entrada do e-mail.")
                } else if (error.message.includes("Invalid login credentials")) {
                    setError("Credenciais incorretas. Verifique seu e-mail e senha.")
                } else {
                    setError("Erro ao entrar. " + error.message)
                }
            } else {
                navigate("/dashboard")
            }
        } catch (err) {
            setError("Erro de conexão. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent relative">
            <Link to="/" className="absolute top-8 left-8 group transition-all">
                <Button variant="ghost" className="rounded-2xl font-black text-muted-foreground hover:text-primary gap-2 h-12 px-6">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Site
                </Button>
            </Link>
            <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700">
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="bg-primary/20 rounded-2xl p-2.5 shadow-sm border border-primary/30">
                        <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground/70">Clinic<span className="text-primary italic">Ops</span></h1>
                </div>

                <Card className="glass border-none medical-shadow p-2">
                    <CardHeader className="space-y-1 pb-6 text-center">
                        <CardTitle className="text-2xl font-bold text-foreground/80">Painel Médico</CardTitle>
                        <CardDescription className="font-medium text-muted-foreground/70">
                            Acesse sua conta para gerenciar seus pacientes
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-4 text-sm font-bold text-destructive bg-destructive/5 border border-destructive/10 rounded-2xl text-center">
                                {error}
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-muted-foreground/80 ml-1 text-xs uppercase tracking-wider">E-mail</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                                                    <Input
                                                        placeholder="medico@exemplo.com"
                                                        className="h-14 pl-12 rounded-2xl bg-white/50 border-primary/10 focus:border-primary/30"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between ml-1">
                                                <FormLabel className="font-bold text-muted-foreground/80 text-xs uppercase tracking-wider">Senha</FormLabel>
                                                <Link to="/auth/forgot-password" className="text-xs text-primary font-bold hover:underline opacity-60">Esqueceu a senha?</Link>
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="h-14 pl-12 rounded-2xl bg-white/50 border-primary/10"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90 medical-shadow rounded-full transition-all active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Acessar Sistema"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col pt-4 pb-6">
                        <p className="text-center text-sm font-semibold text-muted-foreground/60">
                            Não possui conta?{" "}
                            <Link to="/auth/register" className="text-primary hover:underline font-extrabold ml-1">
                                Registrar Clínica
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
