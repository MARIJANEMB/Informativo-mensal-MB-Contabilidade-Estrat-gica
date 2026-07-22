import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  createDocumentObligation,
  updateDocumentObligation,
  uploadProof,
  DOCUMENT_TYPES,
  DOCUMENT_STATUSES,
  type DocumentObligation,
  type DocumentType,
  type DocumentStatus,
} from '@/services/document-obligations'
import { Loader2, Upload } from 'lucide-react'

interface DocumentObligationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  month: number
  year: number
  editing: DocumentObligation | null
  onSaved: () => void
}

export function DocumentObligationForm({
  open,
  onOpenChange,
  clientId,
  month,
  year,
  editing,
  onSaved,
}: DocumentObligationFormProps) {
  const { toast } = useToast()
  const [documentType, setDocumentType] = useState<DocumentType>('XML')
  const [status, setStatus] = useState<DocumentStatus>('Pendente')
  const [observations, setObservations] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editing) {
      setDocumentType(editing.document_type)
      setStatus(editing.status)
      setObservations(editing.observations || '')
    } else {
      setDocumentType('XML')
      setStatus('Pendente')
      setObservations('')
    }
    setFile(null)
  }, [editing, open])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      let savedId: string
      if (editing) {
        const updated = await updateDocumentObligation(editing.id, {
          document_type: documentType,
          status,
          observations,
        })
        savedId = (updated as unknown as DocumentObligation).id
      } else {
        const created = await createDocumentObligation({
          client: clientId,
          month,
          year,
          document_type: documentType,
          status,
          observations,
        })
        savedId = (created as unknown as DocumentObligation).id
      }
      if (file) {
        await uploadProof(savedId, file)
      }
      toast({ title: editing ? 'Documento atualizado.' : 'Documento adicionado.' })
      onSaved()
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Documento' : 'Adicionar Documento'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Documento</Label>
            <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DocumentStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Arquivo</Label>
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer">
                <Button variant="outline" className="w-full" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {file ? file.name : 'Selecionar arquivo'}
                  </span>
                </Button>
                <Input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.png,.xls,.xlsx"
                />
              </label>
            </div>
            <p className="text-xs text-slate-400">PDF, PNG, JPG, XLS, XLSX</p>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações sobre o documento..."
              className="min-h-[80px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editing ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
