import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getReservacionAdmin } from '../lib/supabaseAdmin'

export function useReservacionAdmin(id) {
  const { getToken } = useAuth()
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = () => setRefreshKey(prev => prev + 1)

  useEffect(() => {
    if (!id) return

    async function fetchData() {
      setLoading(true)
      try {
        const token = await getToken()
        const { reservacion, history: hist } = await getReservacionAdmin(token, id)
        
        setData(reservacion)
        setHistory(hist || [])
      } catch (err) {
        console.error('Error fetching reservation detail:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, refreshKey, getToken])

  return { data, history, loading, error, refetch }
}
