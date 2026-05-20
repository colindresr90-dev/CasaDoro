import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useReservacionAdmin } from '../hooks/useReservacionAdmin'
import { actualizarEstadoReservacion, updateReservacionAdmin } from '../lib/supabaseAdmin'
import styles from '../styles/AdminLayout.module.css'
import detailStyles from '../styles/AdminReservacion.module.css'
import modalStyles from '../styles/AdminModal.module.css'

export default function AdminReservacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { data, history, loading, refetch } = useReservacionAdmin(id)
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})

  if (loading) return <div className={detailStyles.loading}>Cargando...</div>
  if (!data) return <div className={detailStyles.loading}>Reservación no encontrada</div>

  const handleCancel = async () => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta reservación?')) return
    try {
      const token = await getToken()
      if (!token) throw new Error('No se pudo obtener el token de autenticación')
      
      await actualizarEstadoReservacion(token, id, 'cancelada')
      refetch()
    } catch (err) {
      alert('Error al cancelar reservación: ' + err.message)
    }
  }

  const handleOpenEdit = () => {
    setFormData({
      huesped_nombre: data.huesped_nombre || '',
      huesped_email: data.huesped_email || '',
      huesped_telefono: data.huesped_telefono || '',
      fecha_entrada: data.fecha_entrada || '',
      fecha_salida: data.fecha_salida || '',
      adultos: data.adultos || 1,
      ninos: data.ninos || 0,
      solicitudes_especiales: data.solicitudes_especiales || '',
      estado: data.estado || 'confirmada'
    })
    setIsEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const entry = new Date(formData.fecha_entrada)
      const exit = new Date(formData.fecha_salida)
      const noches = Math.max(1, Math.ceil((exit - entry) / (1000 * 60 * 60 * 24)))
      const precio_total = noches * data.precio_por_noche

      const token = await getToken()
      if (!token) throw new Error('No se pudo obtener el token de autenticación')

      await updateReservacionAdmin(token, id, {
        huesped_nombre: formData.huesped_nombre,
        huesped_email: formData.huesped_email,
        huesped_telefono: formData.huesped_telefono,
        fecha_entrada: formData.fecha_entrada,
        fecha_salida: formData.fecha_salida,
        noches,
        precio_total,
        adultos: Number(formData.adultos),
        ninos: Number(formData.ninos),
        solicitudes_especiales: formData.solicitudes_especiales,
        estado: formData.estado
      })

      setIsEditing(false)
      refetch()
    } catch (err) {
      alert('Error al guardar cambios: ' + err.message)
    }
  }

  const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
  
  // Calcular noches
  const checkIn = new Date(data.fecha_entrada)
  const checkOut = new Date(data.fecha_salida)
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))

  return (
    <div className={detailStyles.page}>
      <div className={detailStyles.pageHeader}>
        <button onClick={() => navigate('/admin/reservaciones')} className={detailStyles.backButton}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver a Reservaciones
        </button>
        <h1 className={detailStyles.pageTitle}>Ficha de Reserva</h1>
      </div>

      {/* Tres columnas: Profile | Booking Info | Room Info */}
      <div className={detailStyles.topGrid}>
        {/* ── COLUMN 1: Guest Profile ── */}
        <div className={detailStyles.card}>
          <div className={detailStyles.cardHeader}>
            <h3 className={detailStyles.cardTitle}>Perfil del Huésped</h3>
            <button className={detailStyles.cardMenu}>⋯</button>
          </div>

          <div className={detailStyles.profileMain}>
            <div className={detailStyles.profileAvatar}>
              {data.huesped_nombre?.charAt(0) || 'G'}
            </div>
            <h4 className={detailStyles.profileName}>{data.huesped_nombre}</h4>
            <span className={detailStyles.profileId}>RESERVA #{data.id.slice(0,8).toUpperCase()}</span>
          </div>

          <div className={detailStyles.profileContact}>
            <div className={detailStyles.contactRow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>{data.huesped_telefono || 'Sin teléfono'}</span>
            </div>
            <div className={detailStyles.contactRow}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>{data.huesped_email}</span>
            </div>
          </div>

          <div className={detailStyles.infoBlock}>
            <h5 className={detailStyles.infoTitle}>Información de Estadía</h5>
            <div className={detailStyles.infoGrid}>
              <div>
                <span className={detailStyles.infoLabel}>Check-in</span>
                <span className={detailStyles.infoValue}>{formatDate(data.fecha_entrada)}</span>
              </div>
              <div>
                <span className={detailStyles.infoLabel}>Check-out</span>
                <span className={detailStyles.infoValue}>{formatDate(data.fecha_salida)}</span>
              </div>
              <div>
                <span className={detailStyles.infoLabel}>Adultos</span>
                <span className={detailStyles.infoValue}>{data.adultos}</span>
              </div>
              <div>
                <span className={detailStyles.infoLabel}>Niños</span>
                <span className={detailStyles.infoValue}>{data.ninos || 0}</span>
              </div>
            </div>
          </div>

          <div className={detailStyles.divider} />

          <div className={detailStyles.infoBlock}>
            <h5 className={detailStyles.infoTitle}>Programa de Lealtad</h5>
            <div className={detailStyles.loyaltyBadge}>
              <span className={detailStyles.loyaltyDot} />
              <span>PRIMERA VISITA</span>
            </div>
            <div className={detailStyles.loyaltyPoints}>
              <span className={detailStyles.pointsNum}>0</span>
              <span className={detailStyles.pointsLabel}>puntos acumulados</span>
            </div>
          </div>
        </div>

        {/* ── COLUMN 2: Booking Info ── */}
        <div className={detailStyles.card}>
          <div className={detailStyles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h3 className={detailStyles.cardTitle}>Detalles de Reserva</h3>
              <span className={`${styles.badge} ${styles['badge' + (data.estado || '').toLowerCase()]}`}>
                {data.estado === 'check_in' ? 'Check In' : data.estado === 'check_out' ? 'Check Out' : data.estado}
              </span>
            </div>
            <button className={detailStyles.cardMenu}>⋯</button>
          </div>

          <div className={detailStyles.bookingId}>
            <span className={detailStyles.bookingIdLabel}>ID DE RESERVA</span>
            <span className={detailStyles.bookingIdValue}>CDO-{data.id.slice(0,8).toUpperCase()}</span>
          </div>

          <div className={detailStyles.bookingMeta}>
            <div className={detailStyles.metaRow}>
              <div className={detailStyles.metaCol}>
                <span className={detailStyles.metaLabel}>Tipo de Suite</span>
                <span className={detailStyles.metaValue}>{data.suite?.tipo}</span>
              </div>
              <div className={detailStyles.metaCol}>
                <span className={detailStyles.metaLabel}>Nombre Suite</span>
                <span className={detailStyles.metaValue}>{data.suite?.nombre || '—'}</span>
              </div>
              <div className={detailStyles.metaCol}>
                <span className={detailStyles.metaLabel}>Tarifa</span>
                <span className={detailStyles.metaValue}>${data.precio_por_noche}/noche</span>
              </div>
            </div>

            <div className={detailStyles.metaRow}>
              <div className={detailStyles.metaCol}>
                <span className={detailStyles.metaLabel}>Huéspedes</span>
                <span className={detailStyles.metaValue}>{data.adultos} Adultos {data.ninos > 0 && `, ${data.ninos} Niños`}</span>
              </div>
              <div className={detailStyles.metaCol}>
                <span className={detailStyles.metaLabel}>Solicitudes</span>
                <span className={detailStyles.metaValue}>{data.solicitudes_especiales || 'Sin solicitudes'}</span>
              </div>
            </div>

            <div className={detailStyles.metaRow}>
              <div className={detailStyles.metaCol}>
                <span className={detailStyles.metaLabel}>Entrada</span>
                <span className={detailStyles.metaValue}>{formatDate(data.fecha_entrada)}</span>
                <span className={detailStyles.metaTime}>Check-in: 15:00</span>
              </div>
              <div className={detailStyles.metaCol}>
                <span className={detailStyles.metaLabel}>Salida</span>
                <span className={detailStyles.metaValue}>{formatDate(data.fecha_salida)}</span>
                <span className={detailStyles.metaTime}>Check-out: 12:00</span>
              </div>
              <div className={detailStyles.metaCol}>
                <span className={detailStyles.metaLabel}>Noches</span>
                <span className={detailStyles.metaValue}>{nights} noches</span>
              </div>
            </div>
          </div>

          <div className={detailStyles.divider} />

          <div className={detailStyles.amenitiesBlock}>
            <h5 className={detailStyles.infoTitle}>Servicios Incluidos</h5>
            <ul className={detailStyles.amenityList}>
              <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Desayuno Continental</li>
              <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Wi-Fi Premium</li>
              <li><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Acceso a Spa y Piscina</li>
            </ul>
          </div>

          <div className={detailStyles.cardActions}>
            <button className={detailStyles.btnGhost} onClick={handleOpenEdit}>Editar Reserva</button>
            {data.estado !== 'cancelada' && (
              <button className={detailStyles.btnDanger} onClick={handleCancel}>Cancelar Reserva</button>
            )}
          </div>
        </div>

        {/* ── COLUMN 3: Room Info ── */}
        <div className={detailStyles.card}>
          <div className={detailStyles.cardHeader}>
            <h3 className={detailStyles.cardTitle}>Suite Reservada</h3>
            <Link to={`/admin/suites`} className={detailStyles.viewLink}>Ver Suites</Link>
          </div>

          <div className={detailStyles.roomImageWrap}>
            <img 
              src={data.suite?.imagen_hero_url || '/placeholder-suite.jpg'} 
              alt={data.suite?.nombre}
              className={detailStyles.roomImage}
            />
          </div>

          <div className={detailStyles.roomSpecs}>
            <div className={detailStyles.roomSpec}>
              <span className={detailStyles.infoLabel}>Nombre de Suite</span>
              <span className={detailStyles.infoValue}>{data.suite?.nombre}</span>
            </div>
            <div className={detailStyles.roomSpec}>
              <span className={detailStyles.infoLabel}>Dimensiones</span>
              <span className={detailStyles.infoValue}>{data.suite?.metros_cuadrados}m²</span>
            </div>
          </div>
          
          <div className={detailStyles.divider} />

          <div className={detailStyles.infoBlock}>
            <h5 className={detailStyles.infoTitle}>Historial del Huésped</h5>
            {history && history.length > 0 ? (
              <div className={detailStyles.historyList}>
                {history.map(h => (
                  <div key={h.id} className={detailStyles.historyItem}>
                    <div className={detailStyles.historyDot} />
                    <div className={detailStyles.historyInfo}>
                      <span className={detailStyles.historyDate}>{formatDate(h.fecha_entrada)}</span>
                      <span className={detailStyles.historySuite}>{h.suite?.nombre}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--admin-text-dim)', fontSize: '14px', fontWeight: '500' }}>Primer hospedaje registrado.</p>
            )}
          </div>
        </div>

      </div>

      {isEditing && (
        <div className={modalStyles.modalOverlay} onClick={() => setIsEditing(false)}>
          <div className={modalStyles.modalContent} style={{ maxWidth: '700px', padding: '40px' }} onClick={e => e.stopPropagation()}>
            <button className={modalStyles.closeBtn} onClick={() => setIsEditing(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h3 className={modalStyles.modalTitle} style={{ marginBottom: '24px', fontSize: '26px' }}>Editar Reservación</h3>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    display: 'block'
                  }}>Nombre del Huésped</label>
                  <input
                    type="text"
                    required
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      padding: '12px 16px',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '16px',
                      color: '#1A1A1A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      marginTop: '6px'
                    }}
                    value={formData.huesped_nombre || ''}
                    onChange={e => setFormData({ ...formData, huesped_nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    display: 'block'
                  }}>Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      padding: '12px 16px',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '16px',
                      color: '#1A1A1A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      marginTop: '6px'
                    }}
                    value={formData.huesped_email || ''}
                    onChange={e => setFormData({ ...formData, huesped_email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    display: 'block'
                  }}>Teléfono</label>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      padding: '12px 16px',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '16px',
                      color: '#1A1A1A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      marginTop: '6px'
                    }}
                    value={formData.huesped_telefono || ''}
                    onChange={e => setFormData({ ...formData, huesped_telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    display: 'block'
                  }}>Estado</label>
                  <select
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      padding: '12px 16px',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '16px',
                      color: '#1A1A1A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      marginTop: '6px'
                    }}
                    value={formData.estado || 'confirmada'}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="check_in">Check In</option>
                    <option value="check_out">Check Out</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    display: 'block'
                  }}>Fecha de Entrada</label>
                  <input
                    type="date"
                    required
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      padding: '12px 16px',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '16px',
                      color: '#1A1A1A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      marginTop: '6px'
                    }}
                    value={formData.fecha_entrada || ''}
                    onChange={e => setFormData({ ...formData, fecha_entrada: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    display: 'block'
                  }}>Fecha de Salida</label>
                  <input
                    type="date"
                    required
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      padding: '12px 16px',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '16px',
                      color: '#1A1A1A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      marginTop: '6px'
                    }}
                    value={formData.fecha_salida || ''}
                    onChange={e => setFormData({ ...formData, fecha_salida: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    display: 'block'
                  }}>Adultos</label>
                  <input
                    type="number"
                    min="1"
                    required
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      padding: '12px 16px',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '16px',
                      color: '#1A1A1A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      marginTop: '6px'
                    }}
                    value={formData.adultos || 1}
                    onChange={e => setFormData({ ...formData, adultos: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '13px',
                    letterSpacing: '0.2em',
                    color: '#999',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    display: 'block'
                  }}>Niños</label>
                  <input
                    type="number"
                    min="0"
                    required
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid rgba(201, 169, 110, 0.3)',
                      padding: '12px 16px',
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '16px',
                      color: '#1A1A1A',
                      outline: 'none',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      marginTop: '6px'
                    }}
                    value={formData.ninos || 0}
                    onChange={e => setFormData({ ...formData, ninos: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  fontFamily: "'Cormorant SC', serif",
                  fontSize: '13px',
                  letterSpacing: '0.2em',
                  color: '#999',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  display: 'block'
                }}>Solicitudes Especiales</label>
                <textarea
                  rows="3"
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid rgba(201, 169, 110, 0.3)',
                    padding: '12px 16px',
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '16px',
                    color: '#1A1A1A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    borderRadius: 0,
                    marginTop: '6px',
                    resize: 'vertical'
                  }}
                  value={formData.solicitudes_especiales || ''}
                  onChange={e => setFormData({ ...formData, solicitudes_especiales: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid rgba(201, 169, 110, 0.1)', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--admin-border)',
                    padding: '12px 24px',
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '12px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#1A1A1A',
                    color: '#C9A96E',
                    border: 'none',
                    padding: '12px 24px',
                    fontFamily: "'Cormorant SC', serif",
                    fontSize: '12px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
