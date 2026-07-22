import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'

import Layout from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Clients from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import MonthlyReport from './pages/MonthlyReport'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route
                path="/"
                element={
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/colaboradores"
                element={
                  <ErrorBoundary>
                    <Employees />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ErrorBoundary>
                    <Clients />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/clientes/:clientId"
                element={
                  <ErrorBoundary>
                    <ClientProfile />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/clientes/:clientId/relatorio"
                element={
                  <ErrorBoundary>
                    <MonthlyReport />
                  </ErrorBoundary>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AuthProvider>
)

export default App
