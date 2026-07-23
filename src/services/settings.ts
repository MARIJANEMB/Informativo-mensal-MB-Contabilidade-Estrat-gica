import pb from '@/lib/pocketbase/client'

export interface AppSettings {
  id: string
  logo: string
  brand_guide: string
  notification_email: string
  slack_webhook_url: string
}

export const getSettings = async (): Promise<AppSettings | null> => {
  try {
    const list = await pb.collection('settings').getList(1, 1)
    return (list.items[0] as unknown as AppSettings) || null
  } catch {
    return null
  }
}

export const updateSettings = (id: string, data: FormData | Partial<AppSettings>) =>
  pb.collection('settings').update(id, data)

export const createSettings = (data: FormData | Partial<AppSettings>) =>
  pb.collection('settings').create(data)

export const upsertSettings = (id: string | null, data: FormData | Partial<AppSettings>) =>
  id ? updateSettings(id, data) : createSettings(data)

export const getFileUrl = (id: string, filename: string) =>
  `${import.meta.env.VITE_POCKETBASE_URL}/api/files/settings/${id}/${filename}`
