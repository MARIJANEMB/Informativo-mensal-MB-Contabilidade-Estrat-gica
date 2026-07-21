import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppStoreProvider } from '@/stores/use-app-store'

import Layout from './components/Layout'
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
            <Route path="/" element={<Index />} />
            <Route path="/atendimentos" element={<ServiceLog />} />
            <Route path="/pendencias" element={<Pendencies />} />
            <Route path="/fechamento" element={<Closing />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppStoreProvider>
)

export default App
