import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return (
    <div className="auth-loading">
      <div className="auth-loading-line" />
    </div>
  )

  if (!isSignedIn) return <Navigate to="/login" replace />

  return children
}
