import pb from '@/lib/pocketbase/client'

export type ObligationStatus = 'Pending' | 'Paid' | 'Exempt' | 'Not Applicable'

export interface TaxObligation {
  id: string
  client: string
  month: number
  year: number
  obligation_name: string
  status: ObligationStatus
  payment_date: string
  proof: string
  observations: string
  created: string
  updated: string
}

export const PREDEFINED_OBLIGATIONS = [
  'FGTS',
  'DAS',
  'IRPJ',
  'CSLL',
  'PIS',
  'COFINS',
  'ISS',
  'ICMS',
]

export const getTaxObligations = (clientId: string, month: number, year: number) =>
  pb.collection('tax_obligations').getFullList({
    filter: `client = "${clientId}" && month = ${month} && year = ${year}`,
  })

export const getAllTaxObligations = (month: number, year: number) =>
  pb.collection('tax_obligations').getFullList({
    filter: `month = ${month} && year = ${year}`,
  })

export const updateTaxObligation = (id: string, data: Partial<TaxObligation>) =>
  pb.collection('tax_obligations').update(id, data)

export const createTaxObligation = (data: Partial<TaxObligation>) =>
  pb.collection('tax_obligations').create(data)

export const uploadProof = (id: string, file: File) => {
  const formData = new FormData()
  formData.append('proof', file)
  return pb.collection('tax_obligations').update(id, formData)
}

export const proofUrl = (recordId: string, filename: string) =>
  `${import.meta.env.VITE_POCKETBASE_URL}/api/files/tax_obligations/${recordId}/${filename}?download=1`
