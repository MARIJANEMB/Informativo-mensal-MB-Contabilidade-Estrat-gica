import { Link, Outlet, useLocation } from 'react-router-dom'
import { Home, MessageSquare, FileCheck2, PieChart, Bell, Search, User } from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/atendimentos', label: 'Atendimentos', icon: MessageSquare },
  { path: '/pendencias', label: 'Pendências', icon: FileCheck2 },
  { path: '/fechamento', label: 'Fechamento & Relatórios', icon: PieChart },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" className="border-r-0 shadow-lg">
          <SidebarHeader className="p-4 border-b border-sidebar-border/30">
            <div className="flex items-center gap-3 font-bold text-lg text-sidebar-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xl shadow-inner">
                S
              </div>
              <span className="tracking-tight">Skip Contábil</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2 pt-6 gap-1">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="transition-all duration-200 py-5"
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-[15px]">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 hover:text-slate-900" />
              <div className="hidden md:block w-px h-6 bg-slate-200 mx-2" />
              <Select defaultValue="acme">
                <SelectTrigger className="w-[200px] border-none bg-transparent shadow-none focus:ring-0 font-semibold text-slate-800">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acme">Acme Corp LTDA</SelectItem>
                  <SelectItem value="stark">Stark Industries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar tickets ou docs..."
                  className="pl-9 w-64 bg-slate-50 border-slate-200 focus-visible:ring-primary"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative text-slate-500">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
