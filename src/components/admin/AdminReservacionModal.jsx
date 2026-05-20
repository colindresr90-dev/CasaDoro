import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { actualizarEstadoReservacion } from '../../lib/supabaseAdmin'
import modalStyles from '../../styles/AdminModal.module.css'

export default function AdminReservacionModal({ reservacion, onClose, onStatusChange }) {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(reservacion.estado)

  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    try {
      const token = await getToken()
      await actualizarEstadoReservacion(token, reservacion.id, newStatus)
      setStatus(newStatus)
      if (onStatusChange) {
        onStatusChange(reservacion.id, newStatus)
      }
    } catch (err) {
      alert("Error al actualizar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div 
        className={modalStyles.modalContent} 
        onClick={e => e.stopPropagation()}
      >
        <button className={modalStyles.closeBtn} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <h2 className={modalStyles.modalTitle}>
          Detalle de Estancia #{reservacion.id.split('-')[0]}
        </h2>

        <div className={modalStyles.grid}>
          <div>
            <span className={modalStyles.label}>Huésped principal</span>
            <div className={modalStyles.valueEmphasized}>{reservacion.huesped_nombre}</div>
            <div className={modalStyles.value}>{reservacion.huesped_email}</div>
            <div className={modalStyles.value}>{reservacion.huesped_telefono}</div>
          </div>
          <div>
            <span className={modalStyles.label}>Itinerario</span>
            <div className={modalStyles.value}>{reservacion.fecha_entrada} — {reservacion.fecha_salida}</div>
            <div className={modalStyles.value}>{reservacion.noches} noches</div>
            <div className={modalStyles.value}>{reservacion.suite?.nombre || 'General Suite'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <span className={modalStyles.label}>Notas y solicitudes especiales</span>
            <div className={modalStyles.notes}>
              {reservacion.solicitudes_especiales || 'No hay solicitudes adicionales para esta estancia.'}
            </div>
          </div>
        </div>

        <div className={modalStyles.footer}>
          <div className={modalStyles.valueEmphasized} style={{ fontSize: '32px' }}>
            ${reservacion.precio_total}
          </div>
          <select 
            className={modalStyles.select}
            value={status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
          >
            <option value="Pendiente">PENDIENTE</option>
            <option value="Confirmada">CONFIRMADA</option>
            <option value="Cancelada">CANCELADA</option>
          </select>
        </div>
      </div>
    </div>
  )
}

