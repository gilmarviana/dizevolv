
import { useEffect, useState } from "react"
import { documentService } from "@/services/documentService"
import { patientService } from "@/services/patientService"
import { type Patient } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import {
    FileText,
    Upload,
    Trash2,
    Loader2,
    ExternalLink,
    Search,
    Filter,
    FolderOpen
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function Documents() {
    useAuth()
    const [documents, setDocuments] = useState<any[]>([])
    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchTerm, setSearchTerm] = useState("")
    const [patientFilter, setPatientFilter] = useState("all")

    // Upload State
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadPatientId, setUploadPatientId] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Delete State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [docToDelete, setDocToDelete] = useState<any | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        filterDocuments()
    }, [documents, searchTerm, patientFilter])

    async function loadData() {
        try {
            setLoading(true)
            const [docsData, patientsData] = await Promise.all([
                documentService.getAll(),
                patientService.getAll()
            ])
            setDocuments(docsData)
            setPatients(patientsData)
        } catch (error) {
            console.error(error)
            toast.error("Erro ao carregar dados.")
        } finally {
            setLoading(false)
        }
    }

    function filterDocuments() {
        let filtered = [...documents]

        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            filtered = filtered.filter(doc =>
                doc.nome.toLowerCase().includes(lower) ||
                doc.pacientes?.nome?.toLowerCase().includes(lower)
            )
        }

        if (patientFilter && patientFilter !== "all") {
            filtered = filtered.filter(doc => doc.patient_id === patientFilter)
        }

        setFilteredDocuments(filtered)
    }

    async function handleUpload() {
        if (!selectedFile || !uploadPatientId) {
            toast.error("Selecione um paciente e um arquivo.")
            return
        }

        try {
            setUploading(true)
            await documentService.upload(uploadPatientId, selectedFile)
            toast.success("Documento enviado com sucesso!")
            setIsUploadOpen(false)
            setSelectedFile(null)
            setUploadPatientId("")
            loadData()
        } catch (error: any) {
            toast.error(error.message || "Erro ao realizar upload.")
        } finally {
            setUploading(false)
        }
    }

    function handleDelete(doc: any) {
        setDocToDelete(doc)
        setDeleteConfirmOpen(true)
    }

    async function confirmDelete() {
        if (!docToDelete) return

        try {
            await documentService.delete(docToDelete.id, docToDelete.url)
            toast.success("Documento removido.")
            setDocuments(prev => prev.filter(d => d.id !== docToDelete.id))
        } catch (_error) {
            toast.error("Erro ao excluir arquivo.")
        } finally {
            setDeleteConfirmOpen(false)
            setDocToDelete(null)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground/80">Gestão de Documentos</h1>
                    <p className="text-muted-foreground/80 font-medium">Central de arquivos e prontuários digitais.</p>
                </div>

                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full font-bold px-8 bg-primary medical-shadow h-12">
                            <Upload className="mr-2 h-5 w-5" />
                            Novo Documento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl medical-shadow border-none glass">
                        <DialogHeader>
                            <DialogTitle>Upload de Documento</DialogTitle>
                            <DialogDescription>
                                Selecione o paciente e o arquivo para anexar ao prontuário.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="patient">Paciente</Label>
                                <Select value={uploadPatientId} onValueChange={setUploadPatientId}>
                                    <SelectTrigger className="rounded-xl h-11 bg-white/50">
                                        <SelectValue placeholder="Selecione o paciente..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl medical-shadow border-none">
                                        {patients.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file">Arquivo</Label>
                                <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center bg-white/30 hover:bg-white/50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                    {selectedFile ? (
                                        <div className="text-center">
                                            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                                            <p className="text-sm font-bold text-foreground/80 truncate max-w-[200px]">{selectedFile.name}</p>
                                            <p className="text-xs text-muted-foreground">Clique para trocar</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                            <p className="text-sm font-bold text-muted-foreground">Clique ou arraste aqui</p>
                                            <p className="text-xs text-muted-foreground/60">PDF, JPG, PNG até 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpload} disabled={uploading || !selectedFile || !uploadPatientId} className="w-full rounded-xl h-11 font-bold">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                {uploading ? "Enviando..." : "Enviar Documento"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card className="glass border-none medical-shadow p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome do arquivo ou paciente..."
                            className="pl-10 h-11 rounded-xl bg-white/50 border-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-[250px]">
                        <Select value={patientFilter} onValueChange={setPatientFilter}>
                            <SelectTrigger className="h-11 rounded-xl bg-white/50 border-none">
                                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Filtrar por Paciente" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl medical-shadow border-none">
                                <SelectItem value="all">Todos os Pacientes</SelectItem>
                                {patients.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                    <p className="text-sm font-bold text-primary/30 uppercase tracking-widest">Carregando Documentos</p>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="py-20 bg-white/40 rounded-[2rem] border-2 border-dashed border-primary/5 flex flex-col items-center justify-center text-center px-6">
                    <FolderOpen className="h-16 w-16 text-primary/10 mb-4" />
                    <h3 className="text-xl font-bold text-foreground/60">Nenhum documento encontrado</h3>
                    <p className="text-muted-foreground/50 mt-1">Nenhum arquivo corresponde aos filtros selecionados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map(doc => (
                        <Card key={doc.id} className="glass border-none medical-shadow hover:scale-[1.02] transition-transform duration-300 group">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10" asChild>
                                            <a href={doc.url} target="_blank" rel="noreferrer">
                                                <ExternalLink className="h-4 w-4" />
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
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-base text-foreground/80 truncate pr-2" title={doc.nome}>{doc.nome}</h3>
                                    </div>
                                    <p className="text-xs font-bold text-primary/60 uppercase tracking-wide truncate">
                                        {doc.pacientes?.nome || 'Paciente Desconhecido'}
                                    </p>
                                    <div className="flex items-center gap-2 pt-2 text-[10px] font-medium text-muted-foreground/60">
                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="uppercase">{doc.tipo?.split('/')[1] || 'FILE'}</span>
                                        {doc.tamanho && (
                                            <>
                                                <span>•</span>
                                                <span>{(doc.tamanho / 1024).toFixed(1)} KB</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-3xl medical-shadow border-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apagar documento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação excluirá permanentemente o arquivo <strong>{docToDelete?.nome}</strong> do prontuário de {docToDelete?.pacientes?.nome}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                            Sim, apagar arquivo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
