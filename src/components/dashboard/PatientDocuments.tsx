import { useState, useEffect, memo } from "react"
import { documentService } from "@/services/documentService"
import { type PatientDocument } from "@/types"
import {
    FileText,
    Upload,
    Trash2,
    Loader2,
    File,
    ExternalLink,
    AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PatientDocumentsProps {
    patientId: string
    patientName: string
}

export const PatientDocuments = memo(function PatientDocuments({ patientId, patientName }: PatientDocumentsProps) {
    const [documents, setDocuments] = useState<PatientDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    // Delete Modal State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [docToDelete, setDocToDelete] = useState<PatientDocument | null>(null)

    useEffect(() => {
        loadDocuments()
    }, [patientId])

    async function loadDocuments() {
        try {
            setLoading(true)
            const data = await documentService.getByPatient(patientId)
            setDocuments(data)
        } catch (error) {
            toast.error("Erro ao carregar documentos.")
        } finally {
            setLoading(false)
        }
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            await documentService.upload(patientId, file)
            toast.success("Documento enviado com sucesso!")
            loadDocuments()
        } catch (error: any) {
            toast.error(error.message || "Erro ao realizar upload. Verifique se o bucket 'medical-records' existe.")
        } finally {
            setUploading(false)
        }
    }

    function handleDelete(doc: PatientDocument) {
        setDocToDelete(doc)
        setDeleteConfirmOpen(true)
    }

    async function confirmDelete() {
        if (!docToDelete) return

        try {
            await documentService.delete(docToDelete.id, docToDelete.url)
            toast.success("Documento removido.")
            setDocuments(prev => prev.filter(d => d.id !== docToDelete.id))
        } catch (error) {
            toast.error("Erro ao excluir arquivo.")
        } finally {
            setDeleteConfirmOpen(false)
            setDocToDelete(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground/80">Prontuário Digital</h3>
                    <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">Documentos de {patientName}</p>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <label htmlFor="file-upload">
                        <Button asChild className="rounded-full font-bold px-6 bg-primary medical-shadow cursor-pointer h-10" disabled={uploading}>
                            <span>
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                Upload Anexo
                            </span>
                        </Button>
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                    <p className="text-xs font-bold text-primary/30 uppercase">Sincronizando Arquivos</p>
                </div>
            ) : documents.length === 0 ? (
                <div className="py-16 bg-muted/20 rounded-[2rem] border-2 border-dashed border-primary/10 flex flex-col items-center justify-center text-center px-6">
                    <FileText className="h-12 w-12 text-primary/20 mb-4" />
                    <p className="font-bold text-muted-foreground/40 italic">Nenhum documento anexado ao prontuário deste paciente.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {documents.map(doc => (
                        <Card key={doc.id} className="glass border-none medical-shadow hover:scale-[1.01] transition-transform group">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <File className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm text-foreground/70 truncate max-w-[200px]">{doc.nome}</p>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground/40">
                                            {new Date(doc.created_at).toLocaleDateString()} • {doc.tipo?.split('/')[1]?.toUpperCase() || 'FILE'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" asChild>
                                        <a href={doc.url} target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4 text-primary/60" />
                                        </a>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(doc)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-semibold leading-relaxed">
                    Certifique-se de que o bucket <span className="font-black">medical-records</span> está configurado como público no Supabase para visualização direta, ou utilize URLs assinadas para maior segurança.
                </p>
            </div>

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apagar documento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação excluirá permanentemente o arquivo <strong>{docToDelete?.nome}</strong> do sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Sim, apagar arquivo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
});
