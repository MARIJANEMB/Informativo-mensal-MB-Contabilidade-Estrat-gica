import { useState, useEffect, useRef } from 'react'
import { Bell, AlertCircle, Clock, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

interface Notification {
  id: string
  type: 'overdue' | 'urgent' | 'warning'
  title: string
  subtitle: string
  days: number
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = (await pb.send('/backend/v1/notifications/check', { method: 'GET' })) as {
          notifications: Notification[]
        }
        setNotifications(res.notifications || [])
      } catch {
        setNotifications([])
      }
    }
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const iconFor = (type: string) => {
    if (type === 'overdue') return <AlertCircle className="w-4 h-4 text-destructive" />
    if (type === 'urgent') return <Clock className="w-4 h-4 text-amber-500" />
    return <CalendarClock className="w-4 h-4 text-blue-500" />
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-slate-500"
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center font-bold">
            {notifications.length}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Tudo em dia! Sem notificações.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-3 p-3 border-b border-slate-100 last:border-0',
                  n.type === 'overdue' && 'bg-rose-50/50',
                  n.type === 'urgent' && 'bg-amber-50/50',
                )}
              >
                <div className="mt-0.5">{iconFor(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {n.subtitle}
                    {n.days < 0
                      ? ` • ${Math.abs(n.days)} dia(s) em atraso`
                      : n.days === 0
                        ? ' • Vence hoje'
                        : ` • Vence em ${n.days} dia(s)`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
