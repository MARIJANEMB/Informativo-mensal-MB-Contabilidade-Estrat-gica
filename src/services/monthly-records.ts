import pb from '@/lib/pocketbase/client'

export interface MonthlyRecord {
  id: string
  client: string
  month: number
  year: number
  notes: string
  attachments: string[]
  created: string
  updated: string
}

export const getMonthlyRecord = async (
  clientId: string,
  month: number,
  year: number,
): Promise<MonthlyRecord | null> => {
  try {
    return await pb
      .collection('monthly_records')
      .getFirstListItem(`client = "${clientId}" && month = ${month} && year = ${year}`)
  } catch {
    return null
  }
}

export const getAllMonthlyRecords = (clientId: string) =>
  pb.collection('monthly_records').getFullList({
    filter: `client = "${clientId}"`,
    sort: '-year,-month',
  })

export const upsertMonthlyRecord = async (
  clientId: string,
  month: number,
  year: number,
  notes: string,
) => {
  const existing = await getMonthlyRecord(clientId, month, year)
  if (existing) {
    return pb.collection('monthly_records').update(existing.id, { notes })
  }
  return pb.collection('monthly_records').create({ client: clientId, month, year, notes })
}

export const uploadAttachments = async (id: string, files: File[], existingFiles: string[]) => {
  const formData = new FormData()
  existingFiles.forEach((f) => formData.append('attachments', f))
  files.forEach((f) => formData.append('attachments', f))
  return pb.collection('monthly_records').update(id, formData)
}

export const fileUrl = (recordId: string, filename: string) =>
  `${import.meta.env.VITE_POCKETBASE_URL}/api/files/monthly_records/${recordId}/${filename}?download=1`
