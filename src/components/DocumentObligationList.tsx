import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Download, Upload } from 'lucide-react'
import {
  getDocumentObligations,
  deleteDocumentObligation,
  uploadProof,
  proofUrl,
  type DocumentObligation,
  type DocumentStatus,
} from '@/services/document-obligations'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { DocumentObligationForm } from './DocumentObligationForm'

const STATUS_VARIANTS: Record<DocumentStatus, 'destructive' | 'default' | 'secondary'> = {
  Pendente: 'destructive',
  Recebido: 'default',
  'Não Necessário': 'secondary',
}

export function DocumentObligationList({
  clientId,
  month,
  year,
}: {
  clientId: string
  month: number
  year: number
}) {
  const { toast } = useToast()
  const [obligations, setObligations] = useState<DocumentObligation[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DocumentObligation | null>(null)

  const loadData = useCallback(async () => {
    try {
      const obs = (await getDocumentObligations(
        clientId,
        month,
        year,
      )) as unknown as DocumentObligation[]
      setObligations(obs)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }, [clientId, month, year])

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [loadData])

  useRealtime('document_obligations', () => {
    loadData()
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteDocumentObligation(id)
      toast({ title: 'Documento removido.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleUploadProof = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await uploadProof(id, file)
      toast({ title: 'Arquivo enviado.' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
    e.target.value = ''
  }

  const handleEdit = (ob: DocumentObligation) => {
    setEditing(ob)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar Documento
        </Button>
      </div>
      {obligations.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          Nenhum documento registrado para este mês.
        </div>
      ) : (
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Arquivo</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obligations.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium text-slate-900">{o.document_type}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANTS[o.status]}>{o.status}</Badge>
                </TableCell>
                <TableCell>
                  {o.proof ? (
                    <div className="flex items-center gap-1">
                      <a href={proofUrl(o.id, o.proof)} download>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                      <label>
                        <Button size="sm" variant="ghost" asChild>
                          <span>
                            <Upload className="w-4 h-4" />
                          </span>
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleUploadProof(o.id, e)}
                          accept=".pdf,.jpg,.png,.xls,.xlsx"
                        />
                      </label>
                    </div>
                  ) : (
                    <label>
                      <Button size="sm" variant="outline" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-1" /> Enviar
                        </span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUploadProof(o.id, e)}
                        accept=".pdf,.jpg,.png,.xls,.xlsx"
                      />
                    </label>
                  )}
                </TableCell>
                <TableCell className="text-slate-500 max-w-[200px] truncate">
                  {o.observations || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(o)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(o.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <DocumentObligationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        clientId={clientId}
        month={month}
        year={year}
        editing={editing}
        onSaved={loadData}
      />
    </div>
  )
}
