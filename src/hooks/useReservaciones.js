import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { 
  verificarDisponibilidad,
  crearReservacion,
  getMisReservaciones
} from '../lib/supabase'

export function useReservacion() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const resetSuccess = () => setSuccess(false)

  const reservar = async (datos) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // 1. Verificar disponibilidad
      const disponible = await verificarDisponibilidad(
        datos.suite_id,
        datos.fecha_entrada,
        datos.fecha_salida
      )

      if (!disponible) {
        throw new Error(
          'Las fechas seleccionadas no están disponibles.'
        )
      }

      // 2. Calcular noches y precio total
      const entrada = new Date(datos.fecha_entrada)
      const salida = new Date(datos.fecha_salida)
      const noches = Math.ceil(
        (salida - entrada) / (1000 * 60 * 60 * 24)
      )
      const precio_total = noches * datos.precio_por_noche

      // 3. Crear reservación
      const reservacion = await crearReservacion({
        ...datos,
        noches,
        precio_total,
        estado: 'confirmada'
      })

      setSuccess(true)
      return reservacion

    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { reservar, loading, error, success, resetSuccess }
}

export function useMisReservaciones(clerkUserId, email) {
  const { getToken } = useAuth()
  const [reservaciones, setReservaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReservaciones = async () => {
      if (!clerkUserId && !email) {
        Promise.resolve().then(() => setLoading(false))
        return
      }
      setLoading(true)
      try {
        const token = await getToken()
        const data = await getMisReservaciones(token, clerkUserId, email)
        setReservaciones(data)
      } catch (err) {
        console.error('Error al cargar mis reservaciones:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchReservaciones()
  }, [clerkUserId, email, getToken])

  const cancelarRes = async (id) => {
    try {
      const token = await getToken()
      const { actualizarEstado } = await import('../lib/supabase')
      await actualizarEstado(id, token)
      setReservaciones((prev) =>
        prev.map((res) => (res.id === id ? { ...res, estado: 'cancelada' } : res))
      )
    } catch (err) {
      console.error('Error al cancelar reservación:', err)
      throw err
    }
  }

  return { reservaciones, loading, error, cancelarRes }
}
