import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, Compass, Pencil, BookOpen, User, Sun, Moon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTheme } from '../store/useTheme'
import NotificationBell from '../components/NotificationBell'
import Logo from '../components/Logo'

function contentMaxWidth(pathname: string) {
  if (pathname.startsWith('/escribir')) return 'max-w-3xl'
  if (pathname.startsWith('/perfil')) return 'max-w-xl'
  return 'max-w-2xl'
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/home', label: 'Inicio', icon: Home },
  { to: '/explorar', label: 'Explorar', icon: Compass },
  { to: '/diarios', label: 'Mis diarios', icon: BookOpen },
  { to: '/perfil', label: 'Perfil', icon: User },
]

const WRITE_PATH = '/escribir'

function navLinkClass(isActive: boolean, compact = false) {
  const base = compact
    ? 'flex flex-col items-center gap-0.5 flex-1 py-1'
    : 'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors'

  if (isActive) {
    return compact
      ? `${base} text-stone-800 dark:text-stone-100`
      : `${base} bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100`
  }

  return compact
    ? `${base} text-stone-400 dark:text-stone-500`
    : `${base} text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400`
}

export default function AppLayout() {
  const { dark, toggle } = useTheme()
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
      {/* Top bar — mobile only */}
      <header className="md:hidden sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-sm">
        <Logo size={22} />
        <div className="flex items-center gap-1">
          <NotificationBell dropDirection="down" />
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            aria-label="Cambiar tema"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-45px)] md:min-h-screen">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex w-[220px] shrink-0 flex-col sticky top-0 h-screen border-r border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3 py-4">
          <Logo size={26} className="mb-4 px-1" />

          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => navLinkClass(isActive)}>
                <Icon size={18} strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-4 space-y-2">
            <NotificationBell />

            <button
              onClick={toggle}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
              aria-label="Cambiar tema"
            >
              {dark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
              {dark ? 'Modo claro' : 'Modo oscuro'}
            </button>

            <NavLink
              to={WRITE_PATH}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-700 dark:bg-stone-200 text-stone-50 dark:text-stone-900'
                    : 'bg-stone-800 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-stone-200'
                }`
              }
            >
              <Pencil size={18} strokeWidth={1.75} />
              Escribir
            </NavLink>
          </div>
        </aside>

        {/* Content — fondo distinto al sidebar en desktop */}
        <main className="flex-1 px-3 py-3 pb-20 md:px-8 md:py-6 md:pb-6 bg-stone-50 dark:bg-stone-950 md:bg-stone-100/80 md:dark:bg-stone-900/50">
          <div className={`mx-auto w-full ${contentMaxWidth(pathname)}`}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-10 flex items-end justify-around border-t border-stone-200 dark:border-stone-800 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-sm px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <NavLink to="/home" className={({ isActive }) => navLinkClass(isActive, true)}>
          <Home size={16} />
          <span className="text-[9px]">Inicio</span>
        </NavLink>

        <NavLink to="/explorar" className={({ isActive }) => navLinkClass(isActive, true)}>
          <Compass size={16} />
          <span className="text-[9px]">Explorar</span>
        </NavLink>

        <NavLink to={WRITE_PATH} className="flex flex-col items-center gap-0.5 flex-1">
          {({ isActive }) => (
            <>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center -mt-3.5 transition-colors ${
                  isActive
                    ? 'bg-stone-700 dark:bg-stone-200'
                    : 'bg-stone-800 dark:bg-stone-100'
                }`}
              >
                <Pencil size={14} className="text-stone-50 dark:text-stone-900" />
              </div>
              <span
                className={`text-[9px] ${
                  isActive
                    ? 'text-stone-800 dark:text-stone-100'
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                Escribir
              </span>
            </>
          )}
        </NavLink>

        <NavLink to="/diarios" className={({ isActive }) => navLinkClass(isActive, true)}>
          <BookOpen size={16} />
          <span className="text-[9px]">Mis diarios</span>
        </NavLink>

        <NavLink to="/perfil" className={({ isActive }) => navLinkClass(isActive, true)}>
          <User size={16} />
          <span className="text-[9px]">Perfil</span>
        </NavLink>
      </nav>
    </div>
  )
}
