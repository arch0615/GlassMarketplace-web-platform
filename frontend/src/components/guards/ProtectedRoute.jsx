import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleHome = {
      cliente: '/cliente/dashboard',
      optica: '/optica/dashboard',
      admin: '/admin/dashboard',
      medico: '/medicos',
    }
    return <Navigate to={roleHome[user.role] || '/'} replace />
  }

  return children
}
