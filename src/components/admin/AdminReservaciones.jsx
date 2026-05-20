import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getReservacionesAdmin } from '../../lib/supabaseAdmin'
import styles from '../../styles/AdminLayout.module.css'
import AdminReservacionModal from './AdminReservacionModal'

export default function AdminReservaciones({ limit }) {
  const { getToken } = useAuth()
  const [reservaciones, setReservaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRes, setSelectedRes] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        const token = await getToken()
        const rawData = await getReservacionesAdmin(token)
        // Map flat view columns to nested suite object
        const mapped = (rawData || []).map(res => ({
          ...res,
          suite: {
            nombre: res.suite_nombre,
            tipo: res.suite_tipo
          }
        }))
        if (limit) {
          setReservaciones(mapped.slice(0, limit))
        } else {
          setReservaciones(mapped)
        }
      } catch (err) {
        console.error('Error al cargar reservaciones admin:', err)
        setError(err.message || 'Error al cargar las reservaciones')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [limit, getToken])

  if (loading) return <div className={styles.loadingState}>Cargando reservaciones...</div>
  if (error) return <div className={styles.loadingState} style={{ color: '#f87171' }}>⚠ {error}</div>

  const handleStatusChange = (id, newStatus) => {
    setReservaciones(prev =>
      prev.map(res => res.id === id ? { ...res, estado: newStatus } : res)
    )
    setSelectedRes(prev => prev && prev.id === id ? { ...prev, estado: newStatus } : prev)
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <span className={styles.pageEyebrow}>Gestión de estancias</span>
          <h1 className={styles.pageTitle}>Reservaciones</h1>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th>ID</th>
              <th>Huésped</th>
              <th>Suite</th>
              <th>Estancia</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservaciones.map(res => (
              <tr 
                key={res.id} 
                className={styles.tableRow}
                onClick={() => setSelectedRes(res)}
              >
                <td className={styles.tdSub}>
                  #{res.id.split('-')[0]}
                </td>
                <td>
                  <div className={styles.tdMain}>{res.huesped_nombre}</div>
                  <div className={styles.tdSub}>{res.huesped_email}</div>
                </td>
                <td className={styles.tdText}>
                  {res.suite?.nombre || 'General'}
                </td>
                <td className={styles.tdText}>
                  <div style={{ fontWeight: 400 }}>{res.fecha_entrada}</div>
                  <div style={{ fontSize: '10px', opacity: 0.5 }}>al {res.fecha_salida}</div>
                </td>
                <td className={styles.tdPrice}>
                  ${res.precio_total}
                </td>
                <td>
                  <span className={`
                    ${styles.badge} 
                    ${styles['badge' + res.estado.toLowerCase()]}
                  `}>
                    {res.estado}
                  </span>
                </td>
              </tr>
            ))}
            {reservaciones.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#999' }}>
                  No hay reservaciones encontradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRes && (
        <AdminReservacionModal 
          reservacion={selectedRes} 
          onClose={() => setSelectedRes(null)} 
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  )
}

