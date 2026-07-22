import { useState, useEffect, useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Upload, Download } from 'lucide-react'
import {
  getTaxObligations,
  updateTaxObligation,
  uploadProof,
  createTaxObligation,
  PREDEFINED_OBLIGATIONS,
  type TaxObligation,
  type ObligationStatus,
  proofUrl,
} from '@/services/tax-obligations'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'

const STATUS_LABELS: Record<ObligationStatus, string> = {
  Pending: 'Pendente',
  Paid: 'Pago',
  Exempt: 'Isento',
  'Not Applicable': 'Não Aplicável',
}

export function TaxObligationList({
  clientId,
  month,
  year,
}: {
  clientId: string
  month: number
  year: number
}) {
  const { toast } = useToast()
  const [obligations, setObligations] = useState<TaxObligation[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      let obs = (await getTaxObligations(clientId, month, year)) as unknown as TaxObligation[]
      if (obs.length === 0) {
        for (const name of PREDEFINED_OBLIGATIONS) {
          await createTaxObligation({
            client: clientId,
            month,
            year,
            obligation_name: name,
            status: 'Pending',
          })
        }
        obs = (await getTaxObligations(clientId, month, year)) as unknown as TaxObligation[]
      }
      setObligations(obs)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }, [clientId, month, year])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('tax_obligations', () => {
    loadData()
  })

  const handleStatusChange = async (id: string, status: ObligationStatus) => {
    setObligations((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    try {
      await updateTaxObligation(id, { status })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDateChange = async (id: string, payment_date: string) => {
    setObligations((prev) => prev.map((o) => (o.id === id ? { ...o, payment_date } : o)))
    try {
      await updateTaxObligation(id, { payment_date })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleObsChange = async (id: string, observations: string) => {
    setObligations((prev) => prev.map((o) => (o.id === id ? { ...o, observations } : o)))
    try {
      await updateTaxObligation(id, { observations })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleProofUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const updated = (await uploadProof(id, file)) as unknown as TaxObligation
      setObligations((prev) => prev.map((o) => (o.id === id ? updated : o)))
      toast({ title: 'Comprovante enviado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
    e.target.value = ''
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Carregando...</div>

  return (
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead>Obrigação</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data Pagamento</TableHead>
          <TableHead>Comprovante</TableHead>
          <TableHead>Observações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {obligations.map((o) => (
          <TableRow key={o.id}>
            <TableCell className="font-medium text-slate-900">{o.obligation_name}</TableCell>
            <TableCell>
              <Select
                value={o.status}
                onValueChange={(v) => handleStatusChange(o.id, v as ObligationStatus)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                type="date"
                value={o.payment_date || ''}
                onChange={(e) => handleDateChange(o.id, e.target.value)}
                className="w-[150px]"
              />
            </TableCell>
            <TableCell>
              {o.proof ? (
                <div className="flex gap-1">
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
                    <Input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleProofUpload(o.id, e)}
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
                  <Input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleProofUpload(o.id, e)}
                  />
                </label>
              )}
            </TableCell>
            <TableCell>
              <Input
                value={o.observations || ''}
                onChange={(e) => handleObsChange(o.id, e.target.value)}
                placeholder="—"
                className="w-full"
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
