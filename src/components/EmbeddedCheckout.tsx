import { useState } from 'react'
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

interface CheckoutFormProps {
    planName: string
    planId: string
    amount: number
    onSuccess: () => void
    onCancel: () => void
}

function CheckoutForm({ planName, planId, amount, onSuccess, onCancel }: CheckoutFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setLoading(true)

        try {
            // Get current user and clinic
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('Usuário não autenticado')
            }

            const { data: userProfile } = await supabase
                .from('usuarios')
                .select('clinica_id')
                .eq('id', user.id)
                .single()

            if (!userProfile?.clinica_id) {
                throw new Error('Clínica não encontrada')
            }

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Update clinic plan in database
            console.log('Attempting to update clinic:', userProfile.clinica_id, 'with plan ID:', planId);

            const { data: updateData, error: updateError, count } = await supabase
                .from('clinicas')
                .update({
                    plano_id: planId,
                    status: 'active',
                    trial_ends_at: null
                }, { count: 'exact' })
                .eq('id', userProfile.clinica_id)
                .select()

            if (updateError) {
                console.error('Error updating clinic:', updateError)
                throw new Error('Erro ao atualizar plano da clínica: ' + updateError.message)
            }

            console.log('Update result data:', updateData);
            console.log('Rows affected:', count);

            if (!updateData || updateData.length === 0) {
                console.error('No rows were updated. Check clinic ID and permissions.');
                // We won't throw here to avoid user frustration, but let's log it clearly
            }

            // Show success
            setPaymentSuccess(true)
            toast.success('Pagamento Aprovado!', {
                description: `Assinatura do plano ${planName} ativada com sucesso.`
            })

            setTimeout(() => {
                onSuccess()
            }, 2000)

        } catch (error: any) {
            console.error('Payment error:', error)
            toast.error('Erro no pagamento', {
                description: error.message || 'Tente novamente ou entre em contato com o suporte.'
            })
            setLoading(false)
        }
    }

    if (paymentSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="text-2xl font-bold">Pagamento Aprovado!</h3>
                <p className="text-muted-foreground">Redirecionando...</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">Plano:</span>
                        <span>{planName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold">Valor:</span>
                        <span className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(amount / 100)}
                            <span className="text-sm font-normal text-muted-foreground">/mês</span>
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Dados do Cartão de Teste</label>
                    <div className="p-4 border rounded-lg space-y-3">
                        <div>
                            <label className="text-xs text-muted-foreground">Número do Cartão</label>
                            <input
                                type="text"
                                value="4242 4242 4242 4242"
                                readOnly
                                className="w-full p-2 mt-1 border rounded bg-background"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground">Validade</label>
                                <input
                                    type="text"
                                    value="12/34"
                                    readOnly
                                    className="w-full p-2 mt-1 border rounded bg-background"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground">CVV</label>
                                <input
                                    type="text"
                                    value="123"
                                    readOnly
                                    className="w-full p-2 mt-1 border rounded bg-background"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Nome no Cartão</label>
                            <input
                                type="text"
                                placeholder="Digite seu nome"
                                className="w-full p-2 mt-1 border rounded bg-background"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        ℹ️ Modo de teste: Use os dados acima para simular um pagamento aprovado
                    </p>
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={loading || !stripe}
                    className="flex-1"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Confirmar Pagamento
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}

interface EmbeddedCheckoutProps {
    planName: string
    planId: string
    amount: number
    onSuccess: () => void
    onCancel: () => void
}

export default function EmbeddedCheckout({ planName, planId, amount, onSuccess, onCancel }: EmbeddedCheckoutProps) {
    return (
        <Card className="max-w-lg mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <img src="data:image/png;base64,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" className="h-8 w-auto mix-blend-multiply" alt="Stripe" />
                    <span className="text-muted-foreground/40 font-thin text-2xl">|</span>
                    Checkout Seguro
                </CardTitle>
                <CardDescription>
                    Complete os dados abaixo para finalizar sua assinatura
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        planName={planName}
                        planId={planId}
                        amount={amount}
                        onSuccess={onSuccess}
                        onCancel={onCancel}
                    />
                </Elements>
            </CardContent>
        </Card>
    )
}
