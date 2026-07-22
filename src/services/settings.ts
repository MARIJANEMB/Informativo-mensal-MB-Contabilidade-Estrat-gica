import pb from '@/lib/pocketbase/client'

export interface Settings {
  id: string
  logo: string
  brand_guide: string
  created: string
  updated: string
}

export const getSettings = async () => {
  const list = await pb.collection('settings').getFullList<Settings>({ requestKey: null })
  return list[0] || null
}

export const upsertSettings = async (id: string | null, data: FormData) => {
  if (id) {
    return pb.collection('settings').update<Settings>(id, data)
  } else {
    return pb.collection('settings').create<Settings>(data)
  }
}

export const getFileUrl = (recordId: string, filename: string) => {
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/settings/${recordId}/${filename}`
}
