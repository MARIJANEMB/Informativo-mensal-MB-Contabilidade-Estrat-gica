import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSettings, type AppSettings } from '@/services/settings'

interface SettingsContextType {
  settings: AppSettings | null
  logoUrl: string | null
  notificationEmail: string
  slackWebhookUrl: string
  loading: boolean
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const s = await getSettings()
      setSettings(s)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const logoUrl = settings?.logo
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/settings/${settings.id}/${settings.logo}`
    : null

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-700">Erro ao carregar configurações</p>
          <button onClick={load} className="text-sm text-blue-600 underline hover:text-blue-700">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        logoUrl,
        notificationEmail: settings?.notification_email || '',
        slackWebhookUrl: settings?.slack_webhook_url || '',
        loading,
        refresh: load,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
