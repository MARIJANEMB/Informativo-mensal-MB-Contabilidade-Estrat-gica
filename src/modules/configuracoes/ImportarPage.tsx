import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react'
import { parseCSV, mapColumns } from '@/lib/csv-parser'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

const COLLECTIONS = [
  { key: 'clients', label: 'Clientes', dupField: 'cnpj' },
  { key: 'tarefas', label: 'Tarefas', dupField: null },
  { key: 'propostas', label: 'Propostas', dupField: null },
  { key: 'faturamento_mensal', label: 'Faturamento Mensal', dupField: null },
]

interface ImportState {
  headers: string[]
  rows: string[][]
  mapping: Record<number, string>
  importing: boolean
  done: boolean
}

export default function ImportarPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('clients')
  const [states, setStates] = useState<Record<string, ImportState | null>>({})
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFile = (key: string, file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const { headers, rows } = parseCSV(text)
      const mapping = mapColumns(key, headers)
      setStates((prev) => ({
        ...prev,
        [key]: { headers, rows: rows.slice(0, 5), mapping, importing: false, done: false },
      }))
    }
    reader.readAsText(file)
  }

  const handleImport = async (key: string) => {
    const col = COLLECTIONS.find((c) => c.key === key)!
    const state = states[key]
    if (!state) return

    setStates((prev) => ({ ...prev, [key]: { ...state, importing: true } }))

    const reader = new FileReader()
    reader.onload = async () => {
      const text = reader.result as string
      const { headers, rows } = parseCSV(text)
      const mapping = mapColumns(key, headers)
      let created = 0,
        skipped = 0

      for (const row of rows) {
        const record: Record<string, any> = {}
        Object.entries(mapping).forEach(([idx, field]) => {
          const val = row[Number(idx)]
          if (val !== undefined && val !== '') {
            record[field] = isNaN(Number(val)) ? val : Number(val)
          }
        })
        if (Object.keys(record).length === 0) {
          skipped++
          continue
        }
        try {
          if (col.dupField && record[col.dupField]) {
            try {
              const existing = await pb
                .collection(key)
                .getFirstListItem(`${col.dupField} = "${record[col.dupField]}"`)
              skipped++
              continue
            } catch {
              /* intentionally ignored */
            }
          }
          await pb.collection(key).create(record)
          created++
        } catch (_) {
          skipped++
        }
      }

      setStates((prev) => ({ ...prev, [key]: { ...state, importing: false, done: true } }))
      toast({
        title: 'Importação concluída',
        description: `${created} registros criados, ${skipped} pulados.`,
      })
    }
    reader.readAsText(fileRefs.current[key]?.files?.[0] as File)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Importar Dados</h1>
        <p className="text-slate-500 mt-1">
          Importe dados via arquivos CSV para as coleções do sistema.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          {COLLECTIONS.map((c) => (
            <TabsTrigger key={c.key} value={c.key}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {COLLECTIONS.map((col) => {
          const state = states[col.key]
          return (
            <TabsContent key={col.key} value={col.key} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" /> {col.label}
                  </CardTitle>
                  <CardDescription>Selecione um arquivo CSV para importar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                    <input
                      ref={(el) => {
                        fileRefs.current[col.key] = el
                      }}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && handleFile(col.key, e.target.files[0])
                      }
                    />
                    <Button variant="outline" onClick={() => fileRefs.current[col.key]?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> Selecionar CSV
                    </Button>
                  </div>
                  {state && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">
                          Pré-visualização (5 primeiras linhas):
                        </p>
                        <div className="overflow-x-auto rounded border border-slate-100">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                {state.headers.map((h, i) => (
                                  <TableHead key={i}>
                                    {h}
                                    <br />
                                    <span className="text-[10px] text-primary">
                                      {state.mapping[i] ? `→ ${state.mapping[i]}` : '—'}
                                    </span>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {state.rows.map((row, i) => (
                                <TableRow key={i}>
                                  {row.map((cell, j) => (
                                    <TableCell key={j} className="text-xs">
                                      {cell}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                      {state.done ? (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm">
                          <CheckCircle2 className="w-4 h-4" /> Importação concluída!
                        </div>
                      ) : (
                        <Button onClick={() => handleImport(col.key)} disabled={state.importing}>
                          {state.importing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importando...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" /> Confirmar Importação
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
