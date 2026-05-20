import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { getReservacionesAdmin } from '../lib/supabaseAdmin'
import layoutStyles from '../styles/AdminLayout.module.css'
import huespedStyles from '../styles/AdminHuespedes.module.css'
import modalStyles from '../styles/AdminModal.module.css'

// Process reservations to group by unique guest email
const processGuests = (resList) => {
  const guestsMap = {}
  
  resList.forEach(res => {
    // Use email as unique identifier
    const email = res.huesped_email ? res.huesped_email.toLowerCase().trim() : 'anonimo@casadoro.com'
    
    // Calculate nights for this reservation
    let nights = 0
    if (res.fecha_entrada && res.fecha_salida) {
      const checkIn = new Date(res.fecha_entrada)
      const checkOut = new Date(res.fecha_salida)
      nights = Math.max(0, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))
    }
    
    if (!guestsMap[email]) {
      guestsMap[email] = {
        email: res.huesped_email || 'anonimo@casadoro.com',
        nombre: res.huesped_nombre || 'Huésped Anónimo',
        telefono: res.huesped_telefono || '—',
        totalSpent: 0,
        totalNights: 0,
        reservationsCount: 0,
        activeReservationsCount: 0,
        reservations: [],
        firstVisit: res.fecha_entrada,
        lastVisit: res.fecha_entrada,
      }
    }
    
    const guest = guestsMap[email]
    
    // Upgrade placeholder name/phone if available
    if ((guest.nombre === 'Huésped Anónimo') && res.huesped_nombre) {
      guest.nombre = res.huesped_nombre
    }
    if ((guest.telefono === '—') && res.huesped_telefono) {
      guest.telefono = res.huesped_telefono
    }
    
    guest.reservations.push(res)
    guest.reservationsCount += 1
    
    if (res.estado !== 'cancelada') {
      guest.totalSpent += Number(res.precio_total) || 0
      guest.totalNights += nights
      guest.activeReservationsCount += 1
    }
    
    // Track first and last visits
    if (res.fecha_entrada) {
      if (!guest.firstVisit || res.fecha_entrada < guest.firstVisit) {
        guest.firstVisit = res.fecha_entrada
      }
      if (!guest.lastVisit || res.fecha_entrada > guest.lastVisit) {
        guest.lastVisit = res.fecha_entrada
      }
    }
  })
  
  // Convert to array and assign tiers based on active reservations
  return Object.values(guestsMap).map(g => {
    let tier = 'Miembro Huésped'
    if (g.activeReservationsCount >= 4) {
      tier = 'Socio Gold'
    } else if (g.activeReservationsCount >= 2) {
      tier = 'Socio Club'
    }
    return { ...g, tier }
  })
}

export default function AdminHuespedes() {
  const { getToken } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [selectedGuest, setSelectedGuest] = useState(null)

  useEffect(() => {
    document.title = "Gestión de Huéspedes | Casa d'Oro"
    async function fetchReservations() {
      setLoading(true)
      try {
        const token = await getToken()
        const data = await getReservacionesAdmin(token)
        
        const mappedData = (data || []).map(res => ({
          ...res,
          suite: {
            nombre: res.suite_nombre,
            tipo: res.suite_tipo
          }
        }))
        setReservations(mappedData)
      } catch (err) {
        console.error('Error fetching reservations for guests:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReservations()
  }, [getToken])

  const guests = useMemo(() => {
    if (reservations.length === 0) return []
    return processGuests(reservations)
  }, [reservations])

  const filteredGuests = useMemo(() => {
    let result = [...guests]

    // Apply Filter
    if (filter === 'gold') {
      result = result.filter(g => g.tier === 'Socio Gold')
    } else if (filter === 'club') {
      result = result.filter(g => g.tier === 'Socio Club')
    } else if (filter === 'nuevo') {
      result = result.filter(g => g.tier === 'Miembro Huésped')
    }

    // Apply Search
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(g => 
        g.nombre.toLowerCase().includes(q) || 
        g.email.toLowerCase().includes(q) ||
        (g.telefono && g.telefono.includes(q))
      )
    }

    return result
  }, [guests, filter, search])

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr + 'T00:00:00')
      return d.toLocaleDateString('es-SV', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Calculate summary metrics
  const activeBookingsCount = reservations.filter(r => r.estado !== 'cancelada').length
  const totalRevenue = guests.reduce((sum, g) => sum + g.totalSpent, 0)
  const goldGuestsCount = guests.filter(g => g.tier === 'Socio Gold').length

  const getTierBadgeClass = (tier) => {
    switch (tier) {
      case 'Socio Gold':
        return layoutStyles.badgeconfirmada // Gold color
      case 'Socio Club':
        return layoutStyles.badgeterminado // Light brown color
      default:
        return layoutStyles.badgependiente // Grey color
    }
  }

  return (
    <div className={layoutStyles.page}>
      
      {/* Page Header */}
      <div className={layoutStyles.pageHeader} style={{ background: 'transparent', border: 'none', padding: '0', marginBottom: '48px', position: 'static' }}>
        <div>
          <span className={layoutStyles.pageEyebrow}>Gestión de clientes</span>
          <h1 className={layoutStyles.pageTitle}>Huéspedes</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={huespedStyles.statsGrid}>
        <div className={layoutStyles.statCard}>
          <span className={huespedStyles.statLabel}>Huéspedes Únicos</span>
          <span className={layoutStyles.statCardNumGold}>
            {loading ? '...' : guests.length.toString().padStart(2, '0')}
          </span>
          <span className={huespedStyles.statTrend}>Registrados en el sistema</span>
        </div>
        
        <div className={layoutStyles.statCard}>
          <span className={huespedStyles.statLabel}>Estancias Totales</span>
          <span className={layoutStyles.statCardNum}>
            {loading ? '...' : activeBookingsCount.toString().padStart(2, '0')}
          </span>
          <span className={huespedStyles.statTrend}>Reservas no canceladas</span>
        </div>

        <div className={layoutStyles.statCard}>
          <span className={huespedStyles.statLabel}>Socios Gold</span>
          <span className={layoutStyles.statCardNum}>
            {loading ? '...' : goldGuestsCount.toString().padStart(2, '0')}
          </span>
          <span className={huespedStyles.statTrend}>Clientes con ≥ 4 reservas</span>
        </div>

        <div className={layoutStyles.statCard}>
          <span className={huespedStyles.statLabel}>Ingresos Totales</span>
          <span className={layoutStyles.statCardNum} style={{ fontSize: '42px' }}>
            {loading ? '...' : `$${totalRevenue.toLocaleString()}`}
          </span>
          <span className={huespedStyles.statTrend}>Estadías completadas/activas</span>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className={huespedStyles.controls}>
        <div className={huespedStyles.filters}>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'gold', label: 'Socio Gold' },
            { id: 'club', label: 'Socio Club' },
            { id: 'nuevo', label: 'Miembro Huésped' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`${huespedStyles.filterBtn} ${filter === btn.id ? huespedStyles.filterBtnActive : ''}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className={huespedStyles.searchWrapper}>
          <svg className={huespedStyles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email o tel..."
            className={huespedStyles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Guest Table */}
      <div className={layoutStyles.card} style={{ padding: '0' }}>
        <div className={layoutStyles.tableContainer}>
          <table className={layoutStyles.table}>
            <thead className={layoutStyles.tableHead}>
              <tr>
                <th>Huésped</th>
                <th>Contacto</th>
                <th>Categoría</th>
                <th>Estancias</th>
                <th>Noches</th>
                <th>Total Invertido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '80px' }} className={layoutStyles.tdSub}>
                    Cargando lista de huéspedes...
                  </td>
                </tr>
              ) : filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '80px' }} className={layoutStyles.tdSub}>
                    No se encontraron huéspedes.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest, idx) => (
                  <tr key={guest.email || idx} className={layoutStyles.tableRow}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className={huespedStyles.avatar} style={{ width: '40px', height: '40px', fontSize: '18px', margin: '0', flexShrink: 0 }}>
                          {guest.nombre?.charAt(0).toUpperCase() || 'H'}
                        </div>
                        <div>
                          <div className={layoutStyles.tdMain}>{guest.nombre}</div>
                          <div className={layoutStyles.tdSub} style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                            {guest.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={layoutStyles.tdText}>{guest.telefono}</div>
                    </td>
                    <td>
                      <span className={`${layoutStyles.badge} ${getTierBadgeClass(guest.tier)}`}>
                        {guest.tier}
                      </span>
                    </td>
                    <td>
                      <div className={layoutStyles.tdText} style={{ fontWeight: '500' }}>
                        {guest.activeReservationsCount} <span style={{ color: 'var(--admin-text-dim)', fontSize: '11px', fontWeight: '300' }}>({guest.reservationsCount} tot)</span>
                      </div>
                    </td>
                    <td>
                      <div className={layoutStyles.tdText}>{guest.totalNights} noches</div>
                    </td>
                    <td className={layoutStyles.tdPrice}>
                      ${guest.totalSpent.toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedGuest(guest)}
                        className={layoutStyles.tableAction}
                        style={{ cursor: 'pointer' }}
                      >
                        Historial
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest History Modal */}
      {selectedGuest && (
        <div className={modalStyles.modalOverlay} onClick={() => setSelectedGuest(null)}>
          <div className={modalStyles.modalContent} style={{ maxWidth: '900px', padding: '48px' }} onClick={e => e.stopPropagation()}>
            <button className={modalStyles.closeBtn} onClick={() => setSelectedGuest(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h3 className={modalStyles.modalTitle} style={{ marginBottom: '32px' }}>Historial del Cliente</h3>

            <div className={huespedStyles.modalSplit}>
              {/* Profile Panel (Left) */}
              <div className={huespedStyles.modalProfile}>
                <div className={huespedStyles.avatar}>
                  {selectedGuest.nombre?.charAt(0).toUpperCase()}
                </div>
                <h4 className={huespedStyles.profileName}>{selectedGuest.nombre}</h4>
                <span className={huespedStyles.profileTier}>{selectedGuest.tier}</span>

                <div className={huespedStyles.profileContact}>
                  <div className={huespedStyles.contactItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>{selectedGuest.email}</span>
                  </div>
                  <div className={huespedStyles.contactItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>{selectedGuest.telefono}</span>
                  </div>
                </div>

                <div style={{ marginTop: '32px', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={modalStyles.label} style={{ margin: '0' }}>Total Reservas</span>
                    <span className={modalStyles.value} style={{ fontWeight: '500' }}>{selectedGuest.reservationsCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={modalStyles.label} style={{ margin: '0' }}>Noches Totales</span>
                    <span className={modalStyles.value} style={{ fontWeight: '500' }}>{selectedGuest.totalNights}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={modalStyles.label} style={{ margin: '0' }}>Total Invertido</span>
                    <span className={modalStyles.valueEmphasized} style={{ fontSize: '18px' }}>${selectedGuest.totalSpent.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className={modalStyles.label} style={{ margin: '0' }}>Primera Visita</span>
                    <span className={modalStyles.value} style={{ fontSize: '13px' }}>{formatDate(selectedGuest.firstVisit)}</span>
                  </div>
                </div>
              </div>

              {/* Reservations History (Right) */}
              <div className={huespedStyles.historySection}>
                <h5 className={huespedStyles.historyTitle}>Historial de Estadías</h5>
                <div className={huespedStyles.historyList}>
                  {selectedGuest.reservations.map(res => (
                    <div key={res.id} className={huespedStyles.historyItem}>
                      <div>
                        <div className={huespedStyles.historySuite}>
                          {res.suite?.nombre || 'Suite Principal'}
                        </div>
                        <div className={huespedStyles.historyDates}>
                          {formatDate(res.fecha_entrada)} — {formatDate(res.fecha_salida)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className={huespedStyles.historyPrice}>
                          ${res.precio_total?.toLocaleString()}
                        </div>
                        <span className={`${layoutStyles.badge} ${layoutStyles['badge' + res.estado.toLowerCase()]} ${huespedStyles.historyStatus}`}>
                          {res.estado === 'check_in' ? 'Check In' : res.estado === 'check_out' ? 'Check Out' : res.estado}
                        </span>
                        <div style={{ marginTop: '8px' }}>
                          <Link
                            to={`/admin/reservaciones/${res.id}`}
                            className={layoutStyles.tableAction}
                            style={{ padding: '4px 10px', fontSize: '9px', display: 'inline-block' }}
                            onClick={() => setSelectedGuest(null)}
                          >
                            Ver Detalles
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
