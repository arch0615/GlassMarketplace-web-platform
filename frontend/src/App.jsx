import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/guards/ProtectedRoute'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'))

const ClientLayout = lazy(() => import('./components/layout/ClientLayout'))
const OpticaLayout = lazy(() => import('./components/layout/OpticaLayout'))
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'))

const ClientDashboard = lazy(() => import('./pages/cliente/Dashboard'))
const NuevaSolicitud = lazy(() => import('./pages/cliente/NuevaSolicitud'))
const SolicitudServicio = lazy(() => import('./pages/cliente/SolicitudServicio'))
const NuevaReceta = lazy(() => import('./pages/cliente/NuevaReceta'))
const ClienteSolicitudes = lazy(() => import('./pages/cliente/Solicitudes'))
const Presupuesto = lazy(() => import('./pages/cliente/Presupuesto'))
const MisPedidos = lazy(() => import('./pages/cliente/MisPedidos'))
const PedidoDetalle = lazy(() => import('./pages/cliente/PedidoDetalle'))

const OpticaDashboard = lazy(() => import('./pages/optica/Dashboard'))
const Solicitudes = lazy(() => import('./pages/optica/Solicitudes'))
const SolicitudDetalle = lazy(() => import('./pages/optica/SolicitudDetalle'))
const Catalogo = lazy(() => import('./pages/optica/Catalogo'))
const OpticaPedidos = lazy(() => import('./pages/optica/Pedidos'))

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const Aprobaciones = lazy(() => import('./pages/admin/Aprobaciones'))
const Configuracion = lazy(() => import('./pages/admin/Configuracion'))
const AdminPedidos = lazy(() => import('./pages/admin/Pedidos'))
const AdminSolicitudes = lazy(() => import('./pages/admin/Solicitudes'))
const AdminSolicitudDetalle = lazy(() => import('./pages/admin/SolicitudDetalle'))
const Disputas = lazy(() => import('./pages/admin/Disputas'))
const Usuarios = lazy(() => import('./pages/admin/Usuarios'))

const MiPerfil = lazy(() => import('./pages/shared/MiPerfil'))

const DoctorDirectory = lazy(() => import('./pages/medicos/DoctorDirectory'))
const DoctorProfile = lazy(() => import('./pages/medicos/DoctorProfile'))

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cargando...</span>
    </div>
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/cliente" element={
          <ProtectedRoute allowedRoles={['cliente']}>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/cliente/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="nueva-solicitud" element={<NuevaSolicitud />} />
          <Route path="solicitud/:type" element={<SolicitudServicio />} />
          <Route path="receta/nueva" element={<NuevaReceta />} />
          <Route path="solicitudes" element={<ClienteSolicitudes />} />
          <Route path="presupuestos/:id" element={<Presupuesto />} />
          <Route path="pedidos" element={<MisPedidos />} />
          <Route path="pedidos/:id" element={<PedidoDetalle />} />
          <Route path="perfil" element={<MiPerfil />} />
        </Route>

        <Route path="/optica" element={
          <ProtectedRoute allowedRoles={['optica']}>
            <OpticaLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/optica/dashboard" replace />} />
          <Route path="dashboard" element={<OpticaDashboard />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route path="solicitudes/:id" element={<SolicitudDetalle />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="pedidos" element={<OpticaPedidos />} />
          <Route path="perfil" element={<MiPerfil />} />
        </Route>

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="aprobaciones" element={<Aprobaciones />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="solicitudes" element={<AdminSolicitudes />} />
          <Route path="solicitudes/:id" element={<AdminSolicitudDetalle />} />
          <Route path="disputas" element={<Disputas />} />
          <Route path="perfil" element={<MiPerfil />} />
        </Route>

        <Route path="/medicos" element={<DoctorDirectory />} />
        <Route path="/medicos/:id" element={<DoctorProfile />} />
      </Routes>
    </Suspense>
  )
}
