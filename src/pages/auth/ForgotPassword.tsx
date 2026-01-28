import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Heart, ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
    email: z.string().email({ message: "E-mail inválido" }),
})

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })
            if (error) throw error
            setSent(true)
            toast.success("Link de recuperação enviado!")
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar e-mail.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -z-10 animate-pulse" />

            <Card className="w-full max-w-md glass border-none medical-shadow overflow-hidden rounded-[2.5rem] relative after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-2 after:bg-primary">
                <CardHeader className="pt-12 pb-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-primary/10 p-4 rounded-[1.5rem] shadow-inner">
                            <Heart className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black text-foreground/80 tracking-tighter">
                        {sent ? "E-mail Enviado" : "Recuperar Acesso"}
                    </CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/60 text-sm uppercase tracking-widest mt-2">
                        {sent ? "Verifique sua caixa de entrada" : "Redefinição de Senha Profissional"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-12">
                    {sent ? (
                        <div className="space-y-8 text-center">
                            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 animate-in zoom-in duration-500">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium leading-relaxed italic">
                                    Enviamos as instruções para o e-mail informado. <br />Não esqueça de checar a pasta de SPAM.
                                </p>
                            </div>
                            <Link to="/auth/login">
                                <Button variant="ghost" className="w-full font-black text-primary hover:bg-primary/5 rounded-2xl h-14">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">E-mail Cadastrado</FormLabel>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                    <Input
                                                        placeholder="contato@clinicops.com"
                                                        className="h-14 pl-12 rounded-2xl glass border-primary/10 focus:border-primary/40 focus:ring-primary/20 transition-all font-medium"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-4">
                                    <Button type="submit" className="w-full h-14 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white premium-shadow text-lg tracking-tight" disabled={loading}>
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Solicitar Redefinição"}
                                    </Button>

                                    <Link to="/auth/login" className="block text-center">
                                        <Button variant="ghost" className="text-xs font-black text-muted-foreground/60 hover:text-primary uppercase tracking-[0.2em]">
                                            <ArrowLeft className="mr-2 h-3 w-3" /> Lembrou a senha? Entrar
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
