import { Link, Outlet, useLocation } from 'react-router-dom'
import { Home, Building2, Users, Bell, Search, LogOut } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/colaboradores', label: 'Colaboradores', icon: Users },
  { path: '/clientes', label: 'Clientes', icon: Building2 },
]

export default function Layout() {
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" className="border-r-0 shadow-lg">
          <SidebarHeader className="p-4 border-b border-sidebar-border/30">
            <div className="flex items-center gap-3 font-bold text-lg text-sidebar-foreground">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm shadow-inner">
                MB
              </div>
              <span className="tracking-tight">MB Contábil</span>
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
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden lg:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Buscar..." className="pl-9 w-64 bg-slate-50 border-slate-200" />
              </div>
              <Button variant="ghost" size="icon" className="relative text-slate-500">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarImage
                    src={
                      user?.avatar
                        ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
                        : undefined
                    }
                  />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 hidden md:block">
                  {user?.name || 'Usuário'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="text-slate-500 hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
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
