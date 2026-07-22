import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  getMonthlyRecord,
  upsertMonthlyRecord,
  uploadAttachments,
  fileUrl,
  type MonthlyRecord,
} from '@/services/monthly-records'
import { FileText, Upload, Download, Save } from 'lucide-react'

export function MonthlyDataForm({
  clientId,
  month,
  year,
}: {
  clientId: string
  month: number
  year: number
}) {
  const { toast } = useToast()
  const [record, setRecord] = useState<MonthlyRecord | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMonthlyRecord(clientId, month, year)
      .then((r) => {
        setRecord(r as unknown as MonthlyRecord)
        setNotes(r?.notes || '')
      })
      .finally(() => setLoading(false))
  }, [clientId, month, year])

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = await upsertMonthlyRecord(clientId, month, year, notes)
      setRecord(r as unknown as MonthlyRecord)
      toast({ title: 'Notas salvas.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
    setSaving(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    try {
      let id = record?.id
      if (!id) {
        const r = await upsertMonthlyRecord(clientId, month, year, notes)
        id = (r as unknown as MonthlyRecord).id
        setRecord(r as unknown as MonthlyRecord)
      }
      const updated = await uploadAttachments(id, files, record?.attachments || [])
      setRecord(updated as unknown as MonthlyRecord)
      toast({ title: 'Arquivos enviados.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Notas do Mês</h3>
          <Button size="sm" onClick={handleSave} disabled={saving || loading}>
            <Save className="w-4 h-4 mr-1" /> {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Registre eventos, instruções e informações relevantes do mês..."
          className="min-h-[200px]"
          disabled={loading}
        />
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-800">Documentos Anexados</h3>
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
          <label className="cursor-pointer">
            <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Clique para anexar arquivos</p>
            <Input
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.jpg,.png,.xlsx,.xls"
            />
          </label>
        </div>
        {record?.attachments && record.attachments.length > 0 && (
          <div className="space-y-2">
            {record.attachments.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
                <a href={fileUrl(record.id, f)} download>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
