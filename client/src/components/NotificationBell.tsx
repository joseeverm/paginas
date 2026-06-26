import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell, User as UserIcon } from 'lucide-react'
import { getNotifications, markAllRead } from '../api/notifications'
import type { Notification } from '../types'

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

function notifText(n: Notification): string {
  const name = n.actor.display_name || `@${n.actor.username}`
  if (n.type === 'follow') return `${name} empezó a seguirte`
  const entryLabel = n.entry?.title ? `"${n.entry.title}"` : 'tu entrada'
  return n.type === 'reaction'
    ? `${name} reaccionó a ${entryLabel}`
    : `${name} comentó en ${entryLabel}`
}

function notifLink(n: Notification): string {
  if (n.type === 'follow') return `/perfil?u=${n.actor.username}`
  if (n.entry) return `/diarios?j=${n.entry.journal_id}`
  return `/perfil?u=${n.actor.username}`
}

interface Props {
  dropDirection?: 'up' | 'down'
}

export default function NotificationBell({ dropDirection = 'up' }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  async function load() {
    try {
      const res = await getNotifications()
      setNotifications(res.notifications)
      setUnreadCount(res.unread_count)
    } catch {
      // silencioso — no interrumpir la UI por fallo de notificaciones
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Cerrar al hacer clic fuera del panel
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleOpen() {
    setOpen(prev => !prev)
    if (!open && unreadCount > 0) {
      try {
        await markAllRead()
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      } catch {
        // silencioso
      }
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón campana */}
      <button
        onClick={handleOpen}
        className="relative flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={18} strokeWidth={1.75} />
        <span className="hidden md:inline">Notificaciones</span>
        {unreadCount > 0 && (
          <span className="absolute left-5 top-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {open && (
        <div className={`absolute ${dropDirection === 'up' ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0'} w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg overflow-hidden z-50`}>
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Notificaciones
            </h3>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-stone-400 dark:text-stone-500">
              No tienes notificaciones aún.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
              {notifications.map(n => (
                <li key={n.id}>
                  <Link
                    to={notifLink(n)}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 ${
                      !n.is_read
                        ? 'bg-stone-50 dark:bg-stone-800/50'
                        : 'bg-white dark:bg-stone-900'
                    }`}
                  >
                    {/* Avatar del actor */}
                    {n.actor.avatar_url ? (
                      <img
                        src={n.actor.avatar_url}
                        alt={n.actor.username}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-stone-200 dark:border-stone-700"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 mt-0.5 text-stone-400">
                        <UserIcon size={12} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-snug">
                        {notifText(n)}
                      </p>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 block">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>

                    {!n.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
