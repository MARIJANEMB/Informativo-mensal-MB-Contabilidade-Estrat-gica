import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppStoreProvider } from '@/stores/use-app-store'

import Layout from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import NotFound from './pages/NotFound'
import Index from './pages/Index'
import ServiceLog from './pages/ServiceLog'
import Pendencies from './pages/Pendencies'
import Closing from './pages/Closing'

const App = () => (
  <AppStoreProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Index />
                </ErrorBoundary>
              }
            />
            <Route
              path="/atendimentos"
              element={
                <ErrorBoundary>
                  <ServiceLog />
                </ErrorBoundary>
              }
            />
            <Route
              path="/pendencias"
              element={
                <ErrorBoundary>
                  <Pendencies />
                </ErrorBoundary>
              }
            />
            <Route
              path="/fechamento"
              element={
                <ErrorBoundary>
                  <Closing />
                </ErrorBoundary>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppStoreProvider>
)

export default App
