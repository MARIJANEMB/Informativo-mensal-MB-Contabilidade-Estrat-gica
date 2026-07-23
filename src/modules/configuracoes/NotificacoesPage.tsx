import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings } from '@/hooks/use-settings'
import { upsertSettings } from '@/services/settings'
import { toast } from 'sonner'
import { Loader2, Save, Mail, Webhook } from 'lucide-react'

export default function NotificacoesPage() {
  const { settings, refresh } = useSettings()
  const [email, setEmail] = useState('')
  const [webhook, setWebhook] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setEmail(settings.notification_email || '')
      setWebhook(settings.slack_webhook_url || '')
    }
  }, [settings])

  const validate = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email inválido. Verifique o formato.')
      return false
    }
    if (webhook && !webhook.startsWith('https://hooks.slack.com/')) {
      toast.error('Webhook URL deve começar com https://hooks.slack.com/')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await upsertSettings(settings?.id || null, {
        notification_email: email,
        slack_webhook_url: webhook,
      })
      toast.success('Configurações de notificação salvas!')
      refresh()
    } catch (err) {
      toast.error('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notificações</h1>
        <p className="text-slate-500 mt-1">Configure os canais de notificação do sistema.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" /> Email de Notificação
          </CardTitle>
          <CardDescription>Email que receberá alertas do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="notificacoes@mbcontabil.com"
            className="mt-1"
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" /> Slack Webhook
          </CardTitle>
          <CardDescription>URL do webhook do Slack para integração.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="webhook">Webhook URL</Label>
          <Input
            id="webhook"
            type="url"
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            placeholder="https://hooks.slack.com/services/..."
            className="mt-1"
          />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" /> Salvar
        </Button>
      </div>
    </div>
  )
}
