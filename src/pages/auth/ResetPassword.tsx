import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
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
import { Heart, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
    password: z.string().min(8, { message: "Mínimo 8 caracteres" }),
    confirmPassword: z.string().min(8, { message: "Mínimo 8 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
})

export default function ResetPassword() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { password: "", confirmPassword: "" },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: values.password
            })
            if (error) throw error
            toast.success("Senha atualizada com sucesso!")
            navigate("/auth/login")
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar senha.")
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
                        Nova Senha
                    </CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/60 text-sm uppercase tracking-widest mt-2">
                        Defina suas credenciais com segurança
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-12">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Nova Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    type="password"
                                                    placeholder="********"
                                                    className="h-14 pl-12 rounded-2xl glass border-primary/10 transition-all font-medium"
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
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] uppercase font-black text-muted-foreground tracking-widest ml-1">Confirmar Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    type="password"
                                                    placeholder="********"
                                                    className="h-14 pl-12 rounded-2xl glass border-primary/10 transition-all font-medium"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full h-14 rounded-2xl font-black bg-primary hover:bg-primary/90 text-white premium-shadow text-lg tracking-tight mt-4" disabled={loading}>
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Atualizar e Acessar"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
