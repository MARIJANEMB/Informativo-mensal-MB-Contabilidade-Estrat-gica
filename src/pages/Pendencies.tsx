import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileWarning,
  FolderOpen,
} from 'lucide-react'
import useAppStore from '@/stores/use-app-store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function Pendencies() {
  const { pendencies, taxes, markPendencyUploaded } = useAppStore()
  const { toast } = useToast()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null)

  const handleUpload = () => {
    if (activeUploadId) {
      markPendencyUploaded(activeUploadId)
      setUploadDialogOpen(false)
      toast({
        title: 'Sucesso',
        description: 'Documento enviado com sucesso. Aguardando validação.',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" /> Pendente
          </Badge>
        )
      case 'uploaded':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <UploadCloud className="w-3 h-3 mr-1" /> Enviado
          </Badge>
        )
      case 'validated':
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Validado
          </Badge>
        )
      default:
        return null
    }
  }

  const getTaxStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            Pago
          </Badge>
        )
      case 'awaiting':
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-800">
            Aguardando Guia
          </Badge>
        )
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Pendências</h1>
        <p className="text-slate-500 mt-1">
          Controle de documentos faltantes e obrigações tributárias.
        </p>
      </div>

      <Tabs defaultValue="docs" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="docs" className="text-base px-6">
            Documentos
          </TabsTrigger>
          <TabsTrigger value="taxes" className="text-base px-6">
            Impostos & Tributos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="docs">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[300px]">Documento Requisitado</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Prazo Final</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                        <FolderOpen className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <p className="font-medium">Nenhuma pendência encontrada</p>
                        <p className="text-sm mt-1">Todos os documentos foram entregues.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendencies.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-slate-900">{p.title}</TableCell>
                        <TableCell>
                          <span className="capitalize text-slate-500 text-sm">
                            {p.dept === 'fiscal'
                              ? 'Fiscal'
                              : p.dept === 'hr'
                                ? 'Departamento Pessoal'
                                : 'Contábil'}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-500">{p.deadline}</TableCell>
                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                        <TableCell className="text-right">
                          {p.status === 'pending' && (
                            <Dialog
                              open={uploadDialogOpen && activeUploadId === p.id}
                              onOpenChange={(open) => {
                                setUploadDialogOpen(open)
                                if (open) setActiveUploadId(p.id)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-white hover:bg-slate-50"
                                >
                                  Anexar Arquivo
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Enviar {p.title}</DialogTitle>
                                </DialogHeader>
                                <div
                                  className="border-2 border-dashed border-primary/30 rounded-xl p-10 mt-4 text-center hover:bg-primary/5 transition-colors cursor-pointer bg-slate-50"
                                  onClick={handleUpload}
                                >
                                  <UploadCloud className="mx-auto h-12 w-12 text-primary mb-4 opacity-80" />
                                  <h3 className="text-lg font-semibold mb-1">
                                    Clique ou arraste seu arquivo
                                  </h3>
                                  <p className="text-sm text-slate-500">
                                    Suporta PDF, JPG, PNG e XML (Máx 10MB)
                                  </p>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taxes.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
                <FolderOpen className="h-10 w-10 text-slate-300 mb-3" />
                <p className="font-medium">Nenhuma obrigação tributária encontrada</p>
                <p className="text-sm mt-1">Não há impostos pendentes para este período.</p>
              </div>
            ) : (
              taxes.map((tax) => (
                <Card
                  key={tax.id}
                  className={cn(
                    'shadow-sm transition-all hover:shadow-md',
                    tax.status === 'overdue' &&
                      'border-destructive border-opacity-50 bg-rose-50/30',
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FileWarning
                          className={cn(
                            'w-5 h-5',
                            tax.status === 'overdue' ? 'text-destructive' : 'text-slate-500',
                          )}
                        />
                      </div>
                      {getTaxStatus(tax.status)}
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-1">{tax.name}</h3>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                          Vencimento
                        </p>
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            tax.status === 'overdue' ? 'text-destructive' : 'text-slate-700',
                          )}
                        >
                          {tax.dueDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                          Valor
                        </p>
                        <p className="text-lg font-bold text-slate-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(tax.amount)}
                        </p>
                      </div>
                    </div>
                    {tax.status === 'awaiting' && (
                      <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" /> Aguardando processamento
                      </div>
                    )}
                    {tax.status === 'overdue' && (
                      <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2 text-sm text-destructive font-medium">
                        <AlertCircle className="w-4 h-4" /> Regularização Necessária
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
