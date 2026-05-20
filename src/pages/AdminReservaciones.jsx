import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { getReservacionesAdmin } from '../lib/supabaseAdmin'
import styles from '../styles/AdminLayout.module.css'

export default function AdminReservaciones() {
  const { getToken } = useAuth()
  const [reservaciones, setReservaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('todas')

  useEffect(() => {
    async function fetchReservaciones() {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        const data = await getReservacionesAdmin(token, { estado: filter })
        
        const mappedData = (data || []).map(res => ({
          ...res,
          suite: {
            nombre: res.suite_nombre,
            tipo: res.suite_tipo
          }
        }))
        setReservaciones(mappedData)
      } catch (err) {
        console.error('Error fetching reservations:', err)
        setError(err.message || 'No se pudieron cargar las reservaciones. Verifica que el servidor API esté corriendo.')
      } finally {
        setLoading(false)
      }
    }

    fetchReservaciones()
  }, [filter, getToken])

  const formatDate = (d) => new Date(d).toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader} style={{ background: 'transparent', border: 'none', padding: '0', marginBottom: '48px', position: 'static' }}>
        <div>
          <span className={styles.pageEyebrow}>Gestión de clientes</span>
          <h1 className={styles.pageTitle}>Reservaciones</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {['todas', 'pendiente', 'confirmada', 'check_in', 'check_out', 'cancelada'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={styles.tableAction}
              style={{ 
                background: filter === f ? '#1A1A1A' : 'transparent',
                color: filter === f ? '#C9A96E' : 'var(--admin-text-dim)',
                borderColor: filter === f ? '#1A1A1A' : 'rgba(201, 169, 110, 0.2)',
                padding: '10px 20px'
              }}
            >
              {f === 'todas' ? 'Todas' : f === 'check_in' ? 'Check In' : f === 'check_out' ? 'Check Out' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card} style={{ padding: '0' }}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '80px' }} className={styles.tdSub}>Cargando reservaciones...</td></tr>
              ) : error ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '80px', color: '#f87171' }}>
                  ⚠ Error: {error}
                </td></tr>
              ) : reservaciones.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '80px' }} className={styles.tdSub}>No se encontraron reservaciones.</td></tr>
              ) : (
                reservaciones.map(res => (
                  <tr key={res.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.tdMain}>{res.huesped_nombre}</div>
                      <div className={styles.tdSub}>{res.huesped_email}</div>
                    </td>
                    <td>
                      <div className={styles.tdMain} style={{ fontSize: '16px' }}>{res.suite?.nombre}</div>
                      <div className={styles.tdSub} style={{ color: 'var(--admin-gold)' }}>{res.suite?.tipo}</div>
                    </td>
                    <td className={styles.tdText}>{formatDate(res.fecha_entrada)}</td>
                    <td className={styles.tdText}>{formatDate(res.fecha_salida)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles['badge' + res.estado]}`}>
                        {res.estado === 'check_in' ? 'Check In' : res.estado === 'check_out' ? 'Check Out' : res.estado}
                      </span>
                    </td>
                    <td className={styles.tdPrice}>
                      ${res.precio_total?.toLocaleString()}
                    </td>
                    <td>
                      <Link to={`/admin/reservaciones/${res.id}`} className={styles.tableAction}>
                        Detalles
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  )
}
