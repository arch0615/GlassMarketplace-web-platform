import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Glasses, Package, LogOut, Eye, ChevronRight, Sun, Moon, UserCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { to: '/optica/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/optica/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { to: '/optica/catalogo', label: 'Catálogo de Armazones', icon: Glasses },
  { to: '/optica/pedidos', label: 'Pedidos', icon: Package },
  { to: '/optica/perfil', label: 'Mi Perfil', icon: UserCircle },
]

export default function OpticaLayout() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const displayName = user?.fullName || 'Óptica'
  const initials = displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">Lensia</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 ml-10">Portal Óptica</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 flex items-center justify-between flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Administrador</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
