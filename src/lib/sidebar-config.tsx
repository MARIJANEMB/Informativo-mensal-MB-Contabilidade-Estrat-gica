import {
  Briefcase,
  Calculator,
  Receipt,
  Settings as SettingsIcon,
  TrendingUp,
  Building2,
  Users,
  Trello,
  Calendar,
  FileText,
  ClipboardList,
  Sparkles,
  FileBarChart2,
  BarChart3,
  Image as ImageIcon,
  Bell,
  Zap,
  Upload,
} from 'lucide-react'
import type { ModuleName } from '@/lib/permissions'

export interface SubItem {
  path: string
  label: string
  icon: typeof Users
}

export interface ModuleSection {
  id: string
  label: string
  icon: typeof Briefcase
  checkModules: ModuleName[]
  pathPrefixes: string[]
  items: SubItem[]
}

export const moduleSections: ModuleSection[] = [
  {
    id: 'admin',
    label: 'Administrativo',
    icon: Briefcase,
    checkModules: ['admin'],
    pathPrefixes: ['/admin', '/administrativo'],
    items: [
      { path: '/administrativo/clientes', label: 'Clientes', icon: Building2 },
      { path: '/admin/colaboradores', label: 'Colaboradores', icon: Users },
      { path: '/administrativo/kanban', label: 'Kanban', icon: Trello },
      { path: '/administrativo/timeline', label: 'Timeline', icon: Calendar },
    ],
  },
  {
    id: 'contabil',
    label: 'Contábil',
    icon: Calculator,
    checkModules: ['contabil'],
    pathPrefixes: ['/contabil'],
    items: [
      { path: '/contabil/clientes', label: 'Clientes', icon: Building2 },
      { path: '/contabil/documentos', label: 'Documentos', icon: FileText },
    ],
  },
  {
    id: 'fiscal',
    label: 'Fiscal',
    icon: Receipt,
    checkModules: ['fiscal'],
    pathPrefixes: ['/fiscal'],
    items: [
      { path: '/fiscal/obrigacoes', label: 'Obrigações Fiscais', icon: ClipboardList },
      { path: '/fiscal/relatorios', label: 'Diagnóstico', icon: Sparkles },
    ],
  },
  {
    id: 'comercial',
    label: 'Comercial / Financeiro',
    icon: TrendingUp,
    checkModules: ['comercial', 'financeiro'],
    pathPrefixes: ['/comercial', '/financeiro'],
    items: [
      { path: '/comercial/propostas', label: 'Propostas', icon: FileBarChart2 },
      { path: '/financeiro/rentabilidade', label: 'Rentabilidade', icon: BarChart3 },
    ],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: SettingsIcon,
    checkModules: ['configuracoes'],
    pathPrefixes: ['/configuracoes'],
    items: [
      { path: '/configuracoes/marca', label: 'Marca', icon: ImageIcon },
      { path: '/configuracoes/notificacoes', label: 'Notificações', icon: Bell },
      { path: '/configuracoes/automacoes', label: 'Automações', icon: Zap },
      { path: '/configuracoes/importar', label: 'Importar', icon: Upload },
    ],
  },
]
