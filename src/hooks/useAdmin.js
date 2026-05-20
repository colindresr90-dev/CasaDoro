import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { verificarAdmin } from '../lib/supabaseAdmin'

export function useAdmin() {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const { user } = useUser()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || !user) {
      Promise.resolve().then(() => {
        setIsAdmin(false)
        setAdminLoading(false)
      })
      return
    }

    // Verificar si tiene el rol de admin directamente en Clerk (publicMetadata)
    const role = user.publicMetadata?.role;
    const isClerkAdmin = role === 'admin' || role === 'administrator';

    if (isClerkAdmin) {
      Promise.resolve().then(() => {
        setIsAdmin(true);
        setAdminLoading(false);
      })
      return;
    }

    // Fallback: verificar en la base de datos Supabase usando el Clerk JWT
    getToken()
      .then(token => {
        if (!token) {
          Promise.resolve().then(() => {
            setIsAdmin(false);
            setAdminLoading(false);
          })
          return;
        }
        verificarAdmin(token)
          .then(res => Promise.resolve().then(() => setIsAdmin(res)))
          .catch(() => Promise.resolve().then(() => setIsAdmin(false)))
          .finally(() => Promise.resolve().then(() => setAdminLoading(false)))
      })
      .catch(() => {
        Promise.resolve().then(() => {
          setIsAdmin(false);
          setAdminLoading(false);
        })
      })
  }, [isSignedIn, isLoaded, user, getToken])

  return { isAdmin, adminLoading }
}

