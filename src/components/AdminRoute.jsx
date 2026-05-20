import { useAdmin } from '../hooks/useAdmin'
import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const { isAdmin, adminLoading } = useAdmin()

  if (adminLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-line" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}
