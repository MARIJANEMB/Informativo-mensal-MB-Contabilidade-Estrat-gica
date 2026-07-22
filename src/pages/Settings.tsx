import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useSettings } from '@/hooks/use-settings'
import { upsertSettings, getFileUrl } from '@/services/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Upload, FileText, Image as ImageIcon } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const { settings, logoUrl, loading } = useSettings()
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [guideFile, setGuideFile] = useState<File | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const guideInputRef = useRef<HTMLInputElement>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-lg">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    )
  }

  const handleSave = async () => {
    if (!logoFile && !guideFile) {
      toast.error('Nenhuma alteração para salvar.')
      return
    }

    setSaving(true)
    const formData = new FormData()
    if (logoFile) formData.append('logo', logoFile)
    if (guideFile) formData.append('brand_guide', guideFile)

    try {
      await upsertSettings(settings?.id || null, formData)
      toast.success('Identidade visual atualizada com sucesso!')
      setLogoFile(null)
      setGuideFile(null)
    } catch (err) {
      toast.error('Erro ao salvar as configurações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Configurações do Sistema
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
          <CardDescription>
            Gerencie o logotipo e o manual de marca da Esfera MB. Estas configurações serão
            refletidas em toda a plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Upload */}
            <div className="space-y-4">
              <Label>Logotipo (Imagens)</Label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                  {logoFile ? (
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Current Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  )}
                  <div
                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/jpeg, image/png, image/svg+xml"
                    className="hidden"
                    ref={logoInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) setLogoFile(e.target.files[0])
                    }}
                  />
                  <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                    Escolher Imagem
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 2MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Guide Upload */}
            <div className="space-y-4">
              <Label>Manual da Marca (PDF)</Label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 relative group">
                  <FileText className="w-8 h-8 text-slate-400" />
                  <div
                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all rounded-xl"
                    onClick={() => guideInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={guideInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) setGuideFile(e.target.files[0])
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => guideInputRef.current?.click()}
                  >
                    Escolher PDF
                  </Button>
                  {guideFile ? (
                    <p className="text-sm font-medium text-primary line-clamp-1">
                      {guideFile.name}
                    </p>
                  ) : settings?.brand_guide ? (
                    <a
                      href={getFileUrl(settings.id, settings.brand_guide)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline block"
                    >
                      Visualizar Manual Atual
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum manual cadastrado.</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formato aceito: PDF. Tamanho máximo: 10MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving || (!logoFile && !guideFile)}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
