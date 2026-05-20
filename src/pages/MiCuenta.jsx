import { useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useNavigate, Link } from 'react-router-dom'
import { useMisReservaciones } from '../hooks/useReservaciones'
import styles from '../styles/MiCuenta.module.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function MiCuenta() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const [confirmingId, setConfirmingId] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)

  const emailAddress = user?.primaryEmailAddress?.emailAddress || ''
  const { reservaciones, loading, error, cancelarRes } = useMisReservaciones(user?.id, emailAddress)

  useEffect(() => {
    if (loading) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      
      tl.fromTo(`.${styles.cardPerfil} .${styles.cardEyebrow}`, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        0
      )
      
      tl.fromTo(`.${styles.heroName}`, 
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
        0.2
      )
      
      tl.fromTo(`.${styles.heroEmail}`, 
        { opacity: 0 },
        { opacity: 0.4, duration: 0.5, ease: "power2.out" },
        0.4
      )
      
      tl.fromTo(".gold-line", 
        { width: 0, opacity: 0 },
        { width: 60, opacity: 0.8, duration: 0.7, ease: "power2.out" },
        0.6
      )

      const cardProxima = document.querySelector(`.${styles.cardProxima}`)
      if (cardProxima) {
        gsap.timeline({
          scrollTrigger: {
            trigger: cardProxima,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        })
        .fromTo(`.${styles.proximaLeft}`, 
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }
        )
        .fromTo(`.${styles.proximaRight}`, 
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" },
          "-=0.55"
        )
      }

      const reservacionesList = document.querySelector(`.${styles.reservacionesList}`)
      if (reservacionesList) {
        gsap.fromTo(`.${styles.reservacionRow}`, 
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: reservacionesList,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        )
      }

      const teaserCard = document.querySelector(`.${styles.cardTeaser}`)
      if (teaserCard) {
        gsap.timeline({
          scrollTrigger: {
            trigger: teaserCard,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        })
        .fromTo(`.${styles.teaserTitle}`, 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        )
        .fromTo(`.${styles.cardTeaser} .${styles.btnOutline}`, 
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
          "-=0.6"
        )
      }

      const emptyHistorial = document.querySelector(`.${styles.emptyHistorial}`)
      if (emptyHistorial) {
        gsap.timeline({
          scrollTrigger: {
            trigger: emptyHistorial,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        })
        .fromTo(`.${styles.emptyText}`, 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        )
        .fromTo(`.${styles.emptyHistorial} .${styles.btnOutline}`, 
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
          "-=0.6"
        )
      }
    })

    return () => ctx.revert()
  }, [loading, reservaciones])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleCancelReservation = async (id) => {
    setCancelingId(id)
    try {
      await cancelarRes(id)
      setConfirmingId(null)
    } catch {
      alert('No se pudo cancelar la reservación. Por favor, intenta de nuevo.')
    } finally {
      setCancelingId(null)
    }
  }

  // Safe JSON parser for suite images
  const getSuiteImage = (suite) => {
    if (!suite) return '/placeholder-suite.jpg'
    
    let imgs = suite.imagenes
    if (typeof imgs === 'string') {
      try {
        imgs = JSON.parse(imgs)
      } catch {
        imgs = null
      }
    }
    
    if (Array.isArray(imgs) && imgs.length > 0) {
      const firstImg = imgs[0]
      if (firstImg && typeof firstImg === 'object') {
        return firstImg.url || '/placeholder-suite.jpg'
      }
      return firstImg
    }
    
    return suite.imagen_hero_url || '/placeholder-suite.jpg'
  }

  // Elegant reservation dates formatter matching "18 de mayo — 21 de mayo de 2026"
  const formatReservationDates = (entradaStr, salidaStr) => {
    if (!entradaStr || !salidaStr) return ''
    try {
      const entParts = entradaStr.split('-')
      const salParts = salidaStr.split('-')
      
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ]
      
      if (entParts.length === 3 && salParts.length === 3) {
        const entDay = parseInt(entParts[2], 10)
        const entMonthIdx = parseInt(entParts[1], 10) - 1
        const entYear = entParts[0]
        
        const salDay = parseInt(salParts[2], 10)
        const salMonthIdx = parseInt(salParts[1], 10) - 1
        const salYear = salParts[0]
        
        if (entYear === salYear) {
          if (entMonthIdx === salMonthIdx) {
            return `${entDay} — ${salDay} de ${meses[salMonthIdx]} de ${entYear}`
          } else {
            return `${entDay} de ${meses[entMonthIdx]} — ${salDay} de ${meses[salMonthIdx]} de ${entYear}`
          }
        } else {
          return `${entDay} de ${meses[entMonthIdx]} de ${entYear} — ${salDay} de ${meses[salMonthIdx]} de ${salYear}`
        }
      }
    } catch (e) {
      console.error('Error formatting reservation dates:', e)
    }
    return `${entradaStr} — ${salidaStr}`
  }

  const getStatusPillClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return styles.pillConfirmada
      case 'pendiente':
        return styles.pillPendiente
      default:
        return styles.pillCancelada
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loaderSpinner}></div>
        <span className={styles.loadingText}>Buscando reservaciones...</span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={styles.loadingContainer}>
        <span className={styles.loadingText}>Error al cargar reservaciones</span>
        <p className={styles.errorText}>{error.message || 'Ocurrió un problema inesperado.'}</p>
        <Link to="/" className={styles.btnOutline} style={{ marginTop: '20px' }}>Volver al Inicio</Link>
      </div>
    )
  }

  const safeReservaciones = Array.isArray(reservaciones) ? reservaciones : []

  // Identify next stay (the first reservation that is not cancelled)
  const proximaEstancia = safeReservaciones.find(
    (res) => res.estado === 'confirmada' || res.estado === 'pendiente'
  )

  // Calculate loyalty metrics and statistics
  const nonCancelled = safeReservaciones.filter((res) => res.estado?.toLowerCase() !== 'cancelada')
  const totalNoches = nonCancelled.reduce((sum, res) => sum + (res.noches || 0), 0)
  
  let suiteFavorita = 'Ninguna'
  if (nonCancelled.length > 0) {
    const suiteCounts = {}
    nonCancelled.forEach((res) => {
      const name = res.suite?.nombre || res.roomName || 'Premium'
      suiteCounts[name] = (suiteCounts[name] || 0) + 1
    })
    let maxCount = 0
    Object.entries(suiteCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count
        suiteFavorita = name
      }
    })
  }

  let loyaltyBadge = 'Miembro Huésped'
  if (nonCancelled.length > 0) {
    if (nonCancelled.length >= 4) {
      loyaltyBadge = 'Socio Gold'
    } else {
      loyaltyBadge = 'Socio Club'
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bentoContainer}>
        <div className={styles.bentoGrid}>
          {/* Card 1: Perfil (Bienvenida, Email, Loyalty, Signout) */}
          <div className={`${styles.bentoCard} ${styles.cardPerfil}`}>
            <div>
              <span className={styles.cardEyebrow}>Huésped Casa d'Oro</span>
              <h2 className={styles.heroName}>{user?.firstName || 'Huésped'}</h2>
              <p className={styles.heroEmail} style={{ marginBottom: '16px' }}>{emailAddress}</p>
              <div 
                className="gold-line" 
                style={{ 
                  width: '60px', 
                  height: '1px', 
                  backgroundColor: '#c9a84c', 
                  opacity: 0.8,
                  marginBottom: '24px',
                  transformOrigin: 'left'
                }} 
              />
            </div>
            
            <div className={styles.loyaltyBadgeContainer}>
              <span className={styles.loyaltyLabel}>Categoría de Socio</span>
              <span className={styles.loyaltyBadge}>{loyaltyBadge}</span>
            </div>
            
            <button onClick={handleSignOut} className={styles.signOutBtn}>
              Cerrar sesión
            </button>
          </div>

          {/* Card 2: Tu Próxima Estancia / Plan Your Escape */}
          {proximaEstancia ? (
            <div className={`${styles.bentoCard} ${styles.span2} ${styles.cardProxima}`}>
              <div className={styles.proximaLayout}>
                <div className={styles.proximaLeft}>
                  <span className={styles.cardEyebrow}>Tu próxima estancia</span>
                  <h3 className={styles.proximaSuiteName}>
                    {proximaEstancia.suite?.nombre || proximaEstancia.roomName || 'Suite Principal'}
                  </h3>
                  <span className={styles.proximaSuiteType}>
                    {proximaEstancia.suite?.tipo || 'Categoría Premium'}
                  </span>
                  
                  <div className={styles.proximaDetailsGrid}>
                    <div className={styles.proximaDetailGroup}>
                      <span className={styles.proximaDetailLabel}>Fechas</span>
                      <div className={styles.proximaDetailValue}>
                        {formatReservationDates(proximaEstancia.fecha_entrada, proximaEstancia.fecha_salida)}
                      </div>
                    </div>
                    
                    <div className={styles.proximaDetailGroup}>
                      <span className={styles.proximaDetailLabel}>Noches</span>
                      <div className={styles.proximaDetailValue + ' ' + styles.proximaDetailValueNoches}>
                        {proximaEstancia.noches} {proximaEstancia.noches === 1 ? 'noche' : 'noches'}
                      </div>
                    </div>
                    
                    <div className={styles.proximaDetailGroup}>
                      <span className={styles.proximaDetailLabel}>Total</span>
                      <div className={styles.proximaDetailValue + ' ' + styles.proximaDetailValueTotal}>
                        USD {parseFloat(proximaEstancia.precio_total || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className={styles.proximaDetailGroup}>
                      <span className={styles.proximaDetailLabel}>Estado</span>
                      <div className={styles.statusWrapper}>
                        <span className={getStatusPillClass(proximaEstancia.estado)}>
                          {proximaEstancia.estado || 'pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {proximaEstancia.estado !== 'cancelada' && (
                    <div className={styles.cancelActionContainer} style={{ marginTop: '20px' }}>
                      {confirmingId === proximaEstancia.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            onClick={() => handleCancelReservation(proximaEstancia.id)}
                            disabled={cancelingId === proximaEstancia.id}
                            className={styles.cancelBtnConfirm}
                          >
                            {cancelingId === proximaEstancia.id ? 'Cancelando...' : 'Confirmar Cancelación'}
                          </button>
                          <button 
                            onClick={() => setConfirmingId(null)}
                            disabled={cancelingId === proximaEstancia.id}
                            className={styles.cancelBtnCancel}
                          >
                            Atrás
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmingId(proximaEstancia.id)}
                          className={styles.cancelBtnTrigger}
                        >
                          Cancelar reserva
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <div className={styles.proximaRight}>
                  <img 
                    src={getSuiteImage(proximaEstancia.suite)} 
                    alt={proximaEstancia.suite?.nombre || 'Suite'} 
                  />
                  <div className={styles.proximaImgOverlay} />
                </div>
              </div>
            </div>
          ) : (
            <div className={`${styles.bentoCard} ${styles.span2} ${styles.cardTeaser}`}>
              <div className={styles.teaserContent}>
                <span className={styles.cardEyebrow}>Siguiente Escape</span>
                <h3 className={styles.teaserTitle}>Diseña tu próxima estancia</h3>
                <p className={styles.teaserText}>
                  Sumérgete en la serenidad de El Tunco. Suites premium con vista al océano, piscina infinita privada y experiencias exclusivas de bienestar.
                </p>
                <Link to="/suites" className={styles.btnOutline}>
                  Explorar las suites
                </Link>
              </div>
            </div>
          )}

          {/* Card 3: Preferencias */}
          <div className={`${styles.bentoCard} ${styles.cardPreferencias}`}>
            <span className={styles.cardEyebrow}>Preferencias VIP</span>
            <div className={styles.prefList}>
              <div className={styles.prefItem}>
                <span className={styles.prefLabel}>Menú de Almohadas</span>
                <span className={styles.prefValue}>Pluma de Ganso</span>
              </div>
              <div className={styles.prefItem}>
                <span className={styles.prefLabel}>Bienvenida</span>
                <span className={styles.prefValue}>Vino Tinto Gran Reserva</span>
              </div>
              <div className={styles.prefItem}>
                <span className={styles.prefLabel}>Club Spa</span>
                <span className={styles.prefValue}>Acceso Preferente</span>
              </div>
              <div className={styles.prefItem}>
                <span className={styles.prefLabel}>Temperatura</span>
                <span className={styles.prefValue}>22°C</span>
              </div>
            </div>
          </div>

          {/* Card 4: Actividad y Estadísticas */}
          <div className={`${styles.bentoCard} ${styles.cardStats}`}>
            <span className={styles.cardEyebrow}>Mi Actividad</span>
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{safeReservaciones.length}</span>
                <span className={styles.statLbl}>Reservas</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statVal}>{totalNoches}</span>
                <span className={styles.statLbl}>Noches</span>
              </div>
              <div className={styles.statBoxFull}>
                <span className={styles.statLbl}>Suite favorita</span>
                <span className={styles.statSuiteName}>{suiteFavorita}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Concierge / Acceso Rápido */}
          <div className={`${styles.bentoCard} ${styles.cardConcierge}`}>
            <span className={styles.cardEyebrow}>Servicios Exclusivos</span>
            <div className={styles.conciergeLinks}>
              <a href="https://wa.me/example" target="_blank" rel="noreferrer" className={styles.conciergeLink}>
                <span>WhatsApp Concierge</span>
                <span className={styles.linkArrow}>→</span>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className={styles.conciergeLink}>
                <span>Traslado Aeropuerto</span>
                <span className={styles.linkArrow}>→</span>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className={styles.conciergeLink}>
                <span>Reservar Spa</span>
                <span className={styles.linkArrow}>→</span>
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} className={styles.conciergeLink}>
                <span>Solicitar Late Check-out</span>
                <span className={styles.linkArrow}>→</span>
              </a>
            </div>
          </div>

          {/* Card 6: Historial (span 3) */}
          <div className={`${styles.bentoCard} ${styles.spanFull} ${styles.cardHistorial}`}>
            <span className={styles.cardEyebrow}>Tu Historial</span>
            <h3 className={styles.historialTitle}>Estancias Anteriores</h3>
            {safeReservaciones.length === 0 ? (
              <div className={styles.emptyHistorial}>
                <p className={styles.emptyText}>Aún no has realizado ninguna reserva en Casa d'Oro.</p>
                <Link to="/suites" className={styles.btnOutline}>Comenzar ahora</Link>
              </div>
            ) : (
              <div className={styles.reservacionesList}>
                {safeReservaciones.map((res) => (
                  <div key={res.id} className={styles.reservacionRow}>
                    <div className={styles.rowMainInfo}>
                      <div className={styles.rowThumbContainer}>
                        <img 
                          src={getSuiteImage(res.suite)} 
                          alt={res.suite?.nombre || 'Suite'} 
                          className={styles.rowThumb}
                        />
                      </div>
                      <div className={styles.rowSuiteNameGroup}>
                        <span className={styles.rowSuiteName}>
                          {res.suite?.nombre || res.roomName || 'Habitación Premium'}
                        </span>
                        <span className={styles.rowSuiteType}>
                          {res.suite?.tipo || 'Suite'}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.rowDatesGroup}>
                      <div className={styles.rowDates}>
                        {formatReservationDates(res.fecha_entrada, res.fecha_salida)}
                      </div>
                      <div className={styles.rowNoches}>
                        {res.noches} {res.noches === 1 ? 'noche' : 'noches'}
                      </div>
                    </div>
                    
                    <div className={styles.rowPriceGroup}>
                      <span className={styles.rowPrice}>
                        USD {parseFloat(res.precio_total || 0).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className={styles.rowStatusGroup} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className={getStatusPillClass(res.estado)}>
                        {res.estado || 'pendiente'}
                      </span>
                      {res.estado !== 'cancelada' && (
                        <div className={styles.rowCancelContainer}>
                          {confirmingId === res.id ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button 
                                onClick={() => handleCancelReservation(res.id)}
                                disabled={cancelingId === res.id}
                                className={styles.rowCancelBtnConfirm}
                              >
                                {cancelingId === res.id ? '...' : 'Sí, cancelar'}
                              </button>
                              <button 
                                onClick={() => setConfirmingId(null)}
                                disabled={cancelingId === res.id}
                                className={styles.rowCancelBtnCancel}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setConfirmingId(res.id)}
                              className={styles.rowCancelBtnTrigger}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
