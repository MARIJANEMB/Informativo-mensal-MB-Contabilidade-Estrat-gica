import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSettings, type AppSettings } from '@/services/settings'

interface SettingsContextType {
  settings: AppSettings | null
  logoUrl: string | null
  notificationEmail: string
  slackWebhookUrl: string
  refresh: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null)

  const load = async () => {
    const s = await getSettings()
    setSettings(s)
  }

  useEffect(() => {
    load()
  }, [])

  const logoUrl = settings?.logo
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/settings/${settings.id}/${settings.logo}`
    : null

  return (
    <SettingsContext.Provider
      value={{
        settings,
        logoUrl,
        notificationEmail: settings?.notification_email || '',
        slackWebhookUrl: settings?.slack_webhook_url || '',
        refresh: load,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
