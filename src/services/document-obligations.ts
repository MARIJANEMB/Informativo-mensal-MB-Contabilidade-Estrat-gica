import pb from '@/lib/pocketbase/client'

export type DocumentType = 'XML' | 'Extrato' | 'Comprovante de Pagamento' | 'Outros'
export type DocumentStatus = 'Pendente' | 'Recebido' | 'Não Necessário'

export interface DocumentObligation {
  id: string
  client: string
  month: number
  year: number
  document_type: DocumentType
  status: DocumentStatus
  proof: string
  observations: string
  created: string
  updated: string
}

export const DOCUMENT_TYPES: DocumentType[] = [
  'XML',
  'Extrato',
  'Comprovante de Pagamento',
  'Outros',
]
export const DOCUMENT_STATUSES: DocumentStatus[] = ['Pendente', 'Recebido', 'Não Necessário']

export const getDocumentObligations = (clientId: string, month: number, year: number) =>
  pb.collection('document_obligations').getFullList({
    filter: `client = "${clientId}" && month = ${month} && year = ${year}`,
  })

export const createDocumentObligation = (data: Partial<DocumentObligation>) =>
  pb.collection('document_obligations').create(data)

export const updateDocumentObligation = (id: string, data: Partial<DocumentObligation>) =>
  pb.collection('document_obligations').update(id, data)

export const deleteDocumentObligation = (id: string) =>
  pb.collection('document_obligations').delete(id)

export const uploadProof = (id: string, file: File) => {
  const formData = new FormData()
  formData.append('proof', file)
  return pb.collection('document_obligations').update(id, formData)
}

export const proofUrl = (recordId: string, filename: string) =>
  `${import.meta.env.VITE_POCKETBASE_URL}/api/files/document_obligations/${recordId}/${filename}?download=1`

export const generateDiagnosis = (clientId: string, month: number, year: number) =>
  pb.send('/backend/v1/reports/diagnosis', {
    method: 'POST',
    body: JSON.stringify({ clientId, month, year }),
    headers: { 'Content-Type': 'application/json' },
  })
