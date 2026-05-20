import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { supabase } from '../../lib/supabase'
import { getReservacionesAdmin, bloquearFechas } from '../../lib/supabaseAdmin'
import dashStyles from '../../styles/AdminDashboard.module.css'
import layoutStyles from '../../styles/AdminLayout.module.css'

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const [stats, setStats] = useState({
    pendientes: 0,
    ingresosMes: 0,
    ocupacion: 0
  })
  const [recientes, setRecientes] = useState([])
  const [llegadasHoy, setLlegadasHoy] = useState([])
  const [suites, setSuites] = useState([])
  
  // Quick block state
  const [blockSuite, setBlockSuite] = useState('')
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blocking, setBlocking] = useState(false)

  const fetchData = async () => {
    try {
      const token = await getToken()
      if (!token) return

      // 1. Fetch recent reservations
      const reservaciones = await getReservacionesAdmin(token)
      
      // 2. Fetch all suites
      const { data: suitesData } = await supabase.from('suites').select('*')
      setSuites(suitesData || [])

      // 3. Stats calculation
      const pend = reservaciones.filter(r => r.estado === 'pendiente').length
      
      // Revenue is sum of monto_total where status is not cancelled
      const rev = reservaciones
        .filter(r => r.estado !== 'cancelada')
        .reduce((sum, r) => sum + (Number(r.precio_total) || 0), 0)

      // Calculate occupancy for today
      const today = new Date().toISOString().split('T')[0]
      
      // Check how many suites are occupied today by reservations
      const occupiedByReservations = reservaciones.filter(r => 
        r.estado !== 'cancelada' && 
        r.fecha_entrada <= today && 
        r.fecha_salida > today
      ).map(r => r.suite_id)

      // Check blocks
      const { data: blocks } = await supabase.from('disponibilidad_bloqueada')
        .select('suite_id')
        .lte('fecha_inicio', today)
        .gte('fecha_fin', today)

      const blockedSuites = (blocks || []).map(b => b.suite_id)
      
      const allOccupiedSuites = new Set([...occupiedByReservations, ...blockedSuites].filter(Boolean))
      
      const totalSuites = suitesData?.length || 1
      const ocupacionPct = Math.round((allOccupiedSuites.size / totalSuites) * 100)

      setStats({
        pendientes: pend,
        ingresosMes: rev,
        ocupacion: ocupacionPct
      })

      // Take top 10 for recent
      setRecientes(reservaciones.slice(0, 10))

      // Llegadas de hoy
      const llegadas = reservaciones.filter(r => 
        r.estado !== 'cancelada' && 
        r.fecha_entrada === today
      )
      setLlegadasHoy(llegadas)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => fetchData())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleQuickBlock = async (e) => {
    e.preventDefault()
    if (!blockSuite || !blockStart || !blockEnd) return
    setBlocking(true)
    try {
      const token = await getToken()
      await bloquearFechas(token, blockSuite, blockStart, blockEnd, blockReason || 'Bloqueo administrativo')
      alert('Disponibilidad bloqueada exitosamente.')
      setBlockSuite('')
      setBlockStart('')
      setBlockEnd('')
      setBlockReason('')
      fetchData() // refresh stats
    } catch (error) {
      console.error(error)
      alert('Error al bloquear fechas.')
    } finally {
      setBlocking(false)
    }
  }

  return (
    <>
      <div className={layoutStyles.pageHeader}>
        <div className={layoutStyles.pageHeaderLeft}>
          <span className={layoutStyles.pageEyebrow}>
            Resumen general
          </span>
          <h1 className={layoutStyles.pageTitle}>
            Dashboard
          </h1>
        </div>
      </div>

      <div className={dashStyles.dashboard}>
        
        {/* STATS */}
        <div className={dashStyles.statsGrid}>
          <div className={layoutStyles.statCard}>
            <span className={dashStyles.statLabel}>
              Reservaciones Pendientes
            </span>
            <span className={layoutStyles.statCardNumGold} style={{ fontSize: '56px', lineHeight: 1 }}>
              {stats.pendientes.toString().padStart(2, '0')}
            </span>
            <span className={dashStyles.statTrend}>
              +2 vs ayer
            </span>
          </div>
          
          <div className={layoutStyles.statCard}>
            <span className={dashStyles.statLabel}>
              Revenue Proyectado
            </span>
            <span className={layoutStyles.statCardNum}>
              ${stats.ingresosMes.toLocaleString()}
            </span>
            <span className={dashStyles.statTrend}>
              +12% vs mes anterior
            </span>
          </div>

          <div className={layoutStyles.statCard}>
            <span className={dashStyles.statLabel}>
              Ocupación Actual
            </span>
            <span className={layoutStyles.statCardNum}>
              {stats.ocupacion}%
            </span>
            <span className={dashStyles.statTrend}>
              Estable
            </span>
          </div>
        </div>

        <div className={dashStyles.dashboardLayout}>
          {/* CRÓNICA DE RESERVAS (Left Column) */}
          <div className={dashStyles.dashSection}>
            <div className={dashStyles.sectionHeader}>
              <h2 className={dashStyles.sectionTitle} style={{fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '26px', margin: 0, fontWeight: 300}}>
                Crónica de Reservas
              </h2>
              <Link to="/admin/reservaciones" 
                className={dashStyles.sectionLink}>
                Ver todo →
              </Link>
            </div>

            <div className={layoutStyles.card} style={{ padding: '0 32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recientes.map(res => (
                  <div key={res.id} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr', 
                    alignItems: 'center', 
                    padding: '24px 0', 
                    borderBottom: '0.5px solid var(--admin-border)',
                  }}>
                    <div style={{ fontFamily: '"Jost", sans-serif', fontSize: '11px', color: 'var(--admin-text-dim)', letterSpacing: '0.1em' }}>
                      #{res.id.split('-')[0]}
                    </div>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px', color: 'var(--admin-text)' }}>
                      {res.huesped_nombre}
                    </div>
                    <div style={{ fontFamily: '"Jost", sans-serif', fontSize: '12px', color: 'var(--admin-text-dim)' }}>
                      {res.fecha_entrada} — {res.fecha_salida}
                    </div>
                    <div>
                      <span className={`${layoutStyles.badge} ${layoutStyles['badge' + res.estado.toLowerCase()]}`}>
                        {res.estado}
                      </span>
                    </div>
                    <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '18px', textAlign: 'right', color: 'var(--admin-text)' }}>
                      ${res.precio_total}
                    </div>
                  </div>
                ))}
                {recientes.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#8A857D', fontFamily: '"Jost", sans-serif', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Sin reservas recientes
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            
            {/* PRÓXIMAS LLEGADAS */}
            <div className={dashStyles.dashSection}>
              <div className={dashStyles.sectionHeader}>
                <h2 className={dashStyles.sectionTitle} style={{fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '26px', margin: 0, fontWeight: 300, marginBottom: '20px'}}>
                  Próximas Llegadas
                </h2>
              </div>
              
              <div className={layoutStyles.card}>
                {llegadasHoy.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {llegadasHoy.map(llegada => (
                      <div key={llegada.id} className={dashStyles.arrivalItem}>
                        <div>
                          <div className={dashStyles.arrivalGuest}>{llegada.huesped_nombre}</div>
                          <div className={dashStyles.arrivalSuite}>
                            {suites.find(s => s.id === llegada.suite_id)?.nombre || 'Suite'}
                          </div>
                        </div>
                        <div className={dashStyles.arrivalStatus}>
                          {llegada.estado}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#8A857D', fontFamily: '"Jost", sans-serif', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    No hay llegadas programadas para hoy
                  </div>
                )}
              </div>
            </div>

            {/* BLOQUEOS RÁPIDOS */}
            <div className={dashStyles.dashSection}>
              <div className={dashStyles.sectionHeader}>
                <h2 className={dashStyles.sectionTitle} style={{fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '26px', margin: 0, fontWeight: 300, marginBottom: '20px'}}>
                  Bloqueos Rápidos
                </h2>
              </div>
              
              <div className={layoutStyles.card}>
                <form onSubmit={handleQuickBlock} className={dashStyles.quickBlockForm}>
                  <div className={dashStyles.inputGroup}>
                    <label className={dashStyles.inputLabel}>Suite</label>
                    <select 
                      className={dashStyles.inputField}
                      value={blockSuite}
                      onChange={e => setBlockSuite(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {suites.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className={dashStyles.formRow}>
                    <div className={dashStyles.inputGroup}>
                      <label className={dashStyles.inputLabel}>Check-in</label>
                      <input 
                        type="date" 
                        className={dashStyles.inputField} 
                        value={blockStart}
                        onChange={e => setBlockStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className={dashStyles.inputGroup}>
                      <label className={dashStyles.inputLabel}>Check-out</label>
                      <input 
                        type="date" 
                        className={dashStyles.inputField} 
                        value={blockEnd}
                        onChange={e => setBlockEnd(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={dashStyles.inputGroup}>
                    <label className={dashStyles.inputLabel}>Motivo (opcional)</label>
                    <input 
                      type="text" 
                      className={dashStyles.inputField} 
                      placeholder="Ej. Mantenimiento, Uso personal..."
                      value={blockReason}
                      onChange={e => setBlockReason(e.target.value)}
                    />
                  </div>

                  <button type="submit" className={dashStyles.submitBtn} disabled={blocking}>
                    {blocking ? 'Bloqueando...' : 'Confirmar Bloqueo'}
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
