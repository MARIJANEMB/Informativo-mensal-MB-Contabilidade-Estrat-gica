import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, ChevronRight, Search, Bell, LogOut } from 'lucide-react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useSettings } from '@/hooks/use-settings'
import { usePermissions } from '@/hooks/use-permissions'
import { moduleSections } from '@/lib/sidebar-config'
import defaultLogoUrl from '@/assets/sem-nome-200-x-200-px-apresentacao202604291108480000-4abee.jpg'
import { cn } from '@/lib/utils'

function getModuleFromPath(pathname: string): string | null {
  for (const section of moduleSections) {
    if (section.pathPrefixes.some((p) => pathname.startsWith(p))) return section.id
  }
  return null
}

function isPathActive(pathname: string, itemPath: string): boolean {
  return pathname === itemPath || pathname.startsWith(itemPath + '/')
}

export default function Layout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { logoUrl } = useSettings()
  const { hasAccess } = usePermissions()
  const [expanded, setExpanded] = useState<string | null>(getModuleFromPath(location.pathname))

  useEffect(() => {
    const mod = getModuleFromPath(location.pathname)
    if (mod) setExpanded(mod)
  }, [location.pathname])

  const toggleSection = (id: string) => setExpanded((prev) => (prev === id ? null : id))

  const visibleSections = moduleSections.filter((s) => s.checkModules.some((m) => hasAccess(m)))

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" className="border-r-0 shadow-lg">
          <SidebarHeader className="p-4 border-b border-sidebar-border/30">
            <div className="flex items-center gap-3 font-bold text-lg text-sidebar-foreground">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img
                  src={logoUrl || defaultLogoUrl}
                  alt="MB Contábil"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="tracking-tight">MB Contábil</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2 pt-6 gap-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/'}
                  className="transition-all duration-200 py-5"
                >
                  <Link to="/" className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="font-medium text-[15px]">Painel Central</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {visibleSections.map((section) => (
                <Collapsible
                  key={section.id}
                  open={expanded === section.id}
                  onOpenChange={(open) => toggleSection(section.id)}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="transition-all duration-200 py-5 w-full">
                        <section.icon className="w-5 h-5" />
                        <span className="font-medium text-[15px] flex-1 text-left">
                          {section.label}
                        </span>
                        <ChevronRight
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            expanded === section.id && 'rotate-90',
                          )}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.items.map((item) => (
                          <SidebarMenuSubItem key={item.path}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isPathActive(location.pathname, item.path)}
                            >
                              <Link to={item.path} className="flex items-center gap-3">
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-20">
            <SidebarTrigger className="text-slate-500 hover:text-slate-900" />
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
