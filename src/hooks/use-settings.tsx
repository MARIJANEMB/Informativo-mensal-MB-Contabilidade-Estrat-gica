import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Settings, getSettings, getFileUrl } from '@/services/settings'
import { useRealtime } from '@/hooks/use-realtime'

interface SettingsContextType {
  settings: Settings | null
  logoUrl: string | null
  loading: boolean
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  logoUrl: null,
  loading: true,
})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const s = await getSettings()
      setSettings(s)
    } catch {
      setSettings(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('settings', () => {
    load()
  })

  const logoUrl = settings?.logo ? getFileUrl(settings.id, settings.logo) : null

  return (
    <SettingsContext.Provider value={{ settings, logoUrl, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}
