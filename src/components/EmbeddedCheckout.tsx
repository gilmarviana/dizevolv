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
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
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
