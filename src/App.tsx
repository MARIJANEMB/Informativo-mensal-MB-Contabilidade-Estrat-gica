import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { PermissionsProvider } from '@/hooks/use-permissions'
import { SettingsProvider } from '@/hooks/use-settings'

import Layout from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ModuleRoute } from './components/ModuleRoute'
import { ParamRedirect } from './components/ParamRedirect'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import MonthlyReport from './pages/MonthlyReport'

import DashboardPage from '@/modules/painel/DashboardPage'
import EmployeesPage from '@/modules/admin/EmployeesPage'
import SettingsPage from '@/modules/admin/SettingsPage'
import ClientsPage from '@/modules/contabil/ClientsPage'
import ClientProfilePage from '@/modules/contabil/ClientProfilePage'
import DocumentsPage from '@/modules/contabil/DocumentsPage'
import ObligationsPage from '@/modules/fiscal/ObligationsPage'
import ReportsPage from '@/modules/fiscal/ReportsPage'
import KanbanPage from '@/modules/administrativo/KanbanPage'
import TimelinePage from '@/modules/administrativo/TimelinePage'
import AdminClientsPage from '@/modules/administrativo/AdminClientsPage'
import PropostasPage from '@/modules/comercial/PropostasPage'
import RentabilidadePage from '@/modules/financeiro/RentabilidadePage'
import MarcaPage from '@/modules/configuracoes/MarcaPage'
import NotificacoesPage from '@/modules/configuracoes/NotificacoesPage'
import AutomacoesPage from '@/modules/configuracoes/AutomacoesPage'
import ImportarPage from '@/modules/configuracoes/ImportarPage'

const withBoundary = (element: React.ReactNode) => <ErrorBoundary>{element}</ErrorBoundary>

const withModule = (
  module: Parameters<typeof ModuleRoute>[0]['modules'][number],
  element: React.ReactNode,
) => withBoundary(<ModuleRoute modules={[module]}>{element}</ModuleRoute>)

const App = () => (
  <AuthProvider>
    <SettingsProvider>
      <PermissionsProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  {/* Painel Central */}
                  <Route path="/" element={withBoundary(<DashboardPage />)} />
                  <Route path="/painel" element={<Navigate to="/" replace />} />
                  {/* Administrativo */}
                  <Route path="/admin" element={<Navigate to="/admin/colaboradores" replace />} />
                  <Route
                    path="/admin/colaboradores"
                    element={withModule('admin', <EmployeesPage />)}
                  />
                  <Route
                    path="/admin/colaboradores/novo"
                    element={withModule('admin', <EmployeesPage />)}
                  />
                  <Route
                    path="/admin/configuracoes"
                    element={withModule('admin', <SettingsPage />)}
                  />
                  {/* Administrativo — Extended */}
                  <Route
                    path="/administrativo"
                    element={<Navigate to="/administrativo/clientes" replace />}
                  />
                  <Route
                    path="/administrativo/clientes"
                    element={withModule('admin', <AdminClientsPage />)}
                  />
                  <Route
                    path="/administrativo/clientes/:clientId"
                    element={withModule('admin', <ClientProfilePage />)}
                  />
                  <Route
                    path="/administrativo/kanban"
                    element={withModule('admin', <KanbanPage />)}
                  />
                  <Route
                    path="/administrativo/timeline"
                    element={withModule('admin', <TimelinePage />)}
                  />
                  {/* Contábil */}{' '}
                  <Route path="/contabil" element={<Navigate to="/contabil/clientes" replace />} />
                  <Route
                    path="/contabil/clientes"
                    element={withModule('contabil', <ClientsPage />)}
                  />
                  <Route
                    path="/contabil/clientes/:clientId"
                    element={withModule('contabil', <ClientProfilePage />)}
                  />
                  <Route
                    path="/contabil/clientes/:clientId/relatorio"
                    element={withModule('contabil', <MonthlyReport />)}
                  />
                  <Route
                    path="/contabil/documentos"
                    element={withModule('contabil', <DocumentsPage />)}
                  />
                  {/* Fiscal */}
                  <Route path="/fiscal" element={<Navigate to="/fiscal/obrigacoes" replace />} />
                  <Route
                    path="/fiscal/obrigacoes"
                    element={withModule('fiscal', <ObligationsPage />)}
                  />
                  <Route
                    path="/fiscal/relatorios"
                    element={withModule('fiscal', <ReportsPage />)}
                  />
                  <Route
                    path="/fiscal/relatorios/:clientId"
                    element={withModule('fiscal', <MonthlyReport />)}
                  />
                  {/* Comercial / Financeiro */}
                  <Route
                    path="/comercial"
                    element={<Navigate to="/comercial/propostas" replace />}
                  />
                  <Route
                    path="/comercial/propostas"
                    element={withModule('comercial', <PropostasPage />)}
                  />
                  <Route
                    path="/financeiro"
                    element={<Navigate to="/financeiro/rentabilidade" replace />}
                  />
                  <Route
                    path="/financeiro/rentabilidade"
                    element={withModule('financeiro', <RentabilidadePage />)}
                  />
                  {/* Configurações */}
                  <Route
                    path="/configuracoes"
                    element={<Navigate to="/configuracoes/marca" replace />}
                  />
                  <Route
                    path="/configuracoes/marca"
                    element={withModule('configuracoes', <MarcaPage />)}
                  />
                  <Route
                    path="/configuracoes/notificacoes"
                    element={withModule('configuracoes', <NotificacoesPage />)}
                  />
                  <Route
                    path="/configuracoes/automacoes"
                    element={withModule('configuracoes', <AutomacoesPage />)}
                  />
                  <Route
                    path="/configuracoes/importar"
                    element={withModule('configuracoes', <ImportarPage />)}
                  />
                  {/* Backward compatibility redirects */}{' '}
                  <Route
                    path="/colaboradores"
                    element={<Navigate to="/admin/colaboradores" replace />}
                  />
                  <Route path="/clientes" element={<Navigate to="/contabil/clientes" replace />} />
                  <Route
                    path="/clientes/:clientId"
                    element={<ParamRedirect to="/contabil/clientes/:clientId" />}
                  />
                  <Route
                    path="/clientes/:clientId/relatorio"
                    element={<ParamRedirect to="/contabil/clientes/:clientId/relatorio" />}
                  />
                  <Route
                    path="/admin/configuracoes-redirect"
                    element={<Navigate to="/configuracoes/marca" replace />}
                  />{' '}
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </PermissionsProvider>
    </SettingsProvider>
  </AuthProvider>
)

export default App
