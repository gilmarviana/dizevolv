import { useEffect, useState } from 'react'
import { Download, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function PWAPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error)
        },
    })

    const [installPrompt, setInstallPrompt] = useState<any>(null)

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            setInstallPrompt(e)
        })
    }, [])

    const handleInstall = async () => {
        if (!installPrompt) return
        installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === 'accepted') {
            setInstallPrompt(null)
        }
    }

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    if (!offlineReady && !needRefresh && !installPrompt) return null

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white rounded-2xl border border-primary/10 shadow-2xl p-6 max-w-sm glass relative overflow-hidden">
                <button
                    onClick={close}
                    className="absolute top-2 right-2 p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        {installPrompt ? <Download className="h-6 w-6 text-primary" /> : <RefreshCw className="h-6 w-6 text-primary animate-spin" />}
                    </div>

                    <div className="space-y-1">
                        <h4 className="font-bold text-foreground/80">
                            {installPrompt ? 'Instalar ClinicOps' : needRefresh ? 'Nova Versão Disponível' : 'Pronto para Offline'}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {installPrompt
                                ? 'Adicione à tela inicial para acesso rápido e melhor performance.'
                                : needRefresh
                                    ? 'Uma atualização está disponível. Clique para atualizar agora.'
                                    : 'O aplicativo já pode ser usado sem conexão com a internet.'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    {installPrompt && (
                        <Button onClick={handleInstall} className="flex-1 rounded-full font-bold">
                            Instalar Agora
                        </Button>
                    )}
                    {needRefresh && (
                        <Button onClick={() => updateServiceWorker(true)} className="flex-1 rounded-full font-bold">
                            Atualizar
                        </Button>
                    )}
                    <Button variant="ghost" onClick={close} className="rounded-full text-muted-foreground font-medium">
                        Depois
                    </Button>
                </div>
            </div>
        </div>
    )
}
