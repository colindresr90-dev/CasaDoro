import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useSuite } from '../hooks/useSuites'
import { useReservacion } from '../hooks/useReservaciones'
import { supabase, calcularPrecioEstancia, getApiUrl } from '../lib/supabase'
import styles from './Reservar.module.css'

export default function Reservar() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { suite, loading: suiteLoading } = useSuite(slug)
  const { reservar, loading, error, success, resetSuccess } = useReservacion()
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  // Form state
  const [step, setStep] = useState(1)
  const [fechas, setFechas] = useState({
    entrada: '',
    salida: ''
  })
  const [datos, setDatos] = useState({
    nombre: '',
    email: '',
    telefono: '',
    adultos: 2,
    ninos: 0,
    solicitudes: ''
  })
  const [isStripeLoading, setIsStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState('')
  const [stripeRedirectUrl, setStripeRedirectUrl] = useState('')

  // Date Range Picker state
  const [showCalendar, setShowCalendar] = useState(false)
  const [hoverDate, setHoverDate] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  // Restore booking progress if returning from login/registration
  useEffect(() => {
    const pending = sessionStorage.getItem('pending_booking')
    if (pending) {
      try {
        const { fechas: savedFechas, datos: savedDatos } = JSON.parse(pending)
        Promise.resolve().then(() => {
          if (savedFechas) setFechas(savedFechas)
          if (savedDatos) setDatos(prev => ({ ...prev, ...savedDatos }))
          setStep(2.1)
        })
      } catch (e) {
        console.error("Error restoring pending booking:", e)
      }
      sessionStorage.removeItem('pending_booking')
    }
  }, [])

  const handleLoginClick = () => {
    // Save booking progress so it's not lost
    sessionStorage.setItem('pending_booking', JSON.stringify({ fechas, datos }))
    // Navigate to custom login page with return redirect query param
    navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
  }

  // Sync user data if signed in
  useEffect(() => {
    if (isSignedIn && user) {
      Promise.resolve().then(() => {
        setDatos(prev => ({
          ...prev,
          nombre: user.firstName + ' ' + (user.lastName || ''),
          email: user.emailAddresses[0].emailAddress
        }))
      })
    }
  }, [isSignedIn, user])

  // Limit default guests to suite capacity when loaded
  useEffect(() => {
    if (suite) {
      Promise.resolve().then(() => {
        setDatos(prev => ({
          ...prev,
          adultos: Math.min(prev.adultos, suite.capacidad_adultos),
          ninos: Math.min(prev.ninos, suite.capacidad_ninos)
        }))
      })
    }
  }, [suite])

  // Helper: Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysCount = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const formatDateString = (date) => {
    if (!date) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    const formatted = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '')
    return formatted.split(' ').map(word => {
      if (word.toLowerCase() === 'de') return 'de'
      return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(' ')
  }

  const handleDateClick = (date) => {
    if (!date) return
    const clickedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const checkIn = fechas.entrada ? new Date(fechas.entrada + 'T00:00:00') : null
    const checkOut = fechas.salida ? new Date(fechas.salida + 'T00:00:00') : null

    if (!checkIn || (checkIn && checkOut)) {
      setFechas({ entrada: formatDateString(clickedDate), salida: '' })
    } else {
      if (clickedDate > checkIn) {
        setFechas(prev => ({ ...prev, salida: formatDateString(clickedDate) }))
        setShowCalendar(false)
      } else {
        setFechas({ entrada: formatDateString(clickedDate), salida: '' })
      }
    }
  }

  const isSelectedStart = (date) => {
    if (!date || !fechas.entrada) return false
    return formatDateString(date) === fechas.entrada
  }

  const isSelectedEnd = (date) => {
    if (!date || !fechas.salida) return false
    return formatDateString(date) === fechas.salida
  }

  const isInRange = (date) => {
    if (!date || !fechas.entrada) return false
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const start = new Date(fechas.entrada + 'T00:00:00')
    
    if (fechas.salida) {
      const end = new Date(fechas.salida + 'T00:00:00')
      return d > start && d < end
    } else if (hoverDate) {
      const end = new Date(hoverDate.getFullYear(), hoverDate.getMonth(), hoverDate.getDate())
      return d > start && d < end
    }
    return false
  }

  const isPast = (date) => {
    if (!date) return true
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return d < today
  }

  const noches = fechas.entrada && fechas.salida
    ? Math.ceil(
        (new Date(fechas.salida + 'T00:00:00') - new Date(fechas.entrada + 'T00:00:00')) / 
        (1000 * 60 * 60 * 24)
      )
    : 0

  const [calculoTarifa, setCalculoTarifa] = useState({ total: 0, desglose: [] })
  const [calculandoTarifa, setCalculandoTarifa] = useState(false)

  useEffect(() => {
    let active = true
    if (suite?.id && fechas.entrada && fechas.salida && noches > 0) {
      Promise.resolve().then(() => {
        if (active) setCalculandoTarifa(true)
      })
      calcularPrecioEstancia(suite.id, fechas.entrada, fechas.salida)
        .then(res => {
          if (active) {
            setCalculoTarifa(res)
            setCalculandoTarifa(false)
          }
        })
        .catch(err => {
          console.error(err)
          if (active) {
            setCalculandoTarifa(false)
          }
        })
    } else {
      Promise.resolve().then(() => {
        if (active) setCalculoTarifa({ total: 0, desglose: [] })
      })
    }
    return () => {
      active = false
    }
  }, [suite?.id, fechas.entrada, fechas.salida, noches])

  const total = calculoTarifa.total

  const handleSubmit = async () => {
    setStripeError('')
    setIsStripeLoading(true)
    let reservacionId = null
    try {
      const reservacion = await reservar({
        suite_id: suite.id,
        clerk_user_id: user?.id || null,
        huesped_nombre: datos.nombre,
        huesped_email: datos.email,
        huesped_telefono: datos.telefono,
        fecha_entrada: fechas.entrada,
        fecha_salida: fechas.salida,
        precio_por_noche: suite.precio_por_noche,
        precio_total: total,
        adultos: datos.adultos,
        ninos: datos.ninos,
        solicitudes_especiales: datos.solicitudes
      })

      if (!reservacion) {
        setIsStripeLoading(false)
        return // Error is handled by hook
      }

      reservacionId = reservacion.id

      const stripeApiUrl = import.meta.env.VITE_STRIPE_API_URL || getApiUrl('/api/checkout')

      // Use AbortController to prevent infinite hangs in case the server or proxy is unreachable
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      let response
      try {
        response = await fetch(stripeApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: suite.nombre,
            totalPrice: total,
            checkIn: fechas.entrada,
            checkOut: fechas.salida,
            email: datos.email,
            metadata: { reservacion_id: reservacion.id }
          }),
          signal: controller.signal
        })
      } catch (fetchErr) {
        if (fetchErr.name === 'AbortError') {
          throw new Error('La conexión con la pasarela de pago ha expirado. Por favor verifique su conexión e intente de nuevo.')
        }
        throw fetchErr
      } finally {
        clearTimeout(timeoutId)
      }

      const session = await response.json()

      if (!response.ok) {
        throw new Error(session.error || 'Ocurrió un error al conectar con la pasarela de pago.')
      }

      setStripeRedirectUrl(session.url)

      // Safeguard for mobile browsers: if redirect is blocked or slow, reset the loading state after 8 seconds
      // so the page is not stuck on "Conectando con Stripe..." forever
      const redirectTimeout = setTimeout(() => {
        setIsStripeLoading(false)
        setStripeError('Si no fue redirigido automáticamente a Stripe, por favor intente de nuevo o use otro navegador.')
      }, 8000)

      window.location.href = session.url

    } catch (e) {
      console.error('Stripe Checkout redirect failed:', e)
      setStripeError(e.message)
      setIsStripeLoading(false)
      resetSuccess()
      
      // Clean up orphaned pending reservation if Stripe payment failed to initialize
      if (reservacionId) {
        try {
          await supabase.from('reservaciones').delete().eq('id', reservacionId)
        } catch (cleanupErr) {
          console.error('Error cleaning up failed reservation:', cleanupErr)
        }
      }
    }
  }

  if (suiteLoading) return (
    <div className={styles.load}>
      <div className={styles.loadLine} />
    </div>
  )

  if (!suite) return (
    <div className={styles.load}>
      <p>Suite no encontrada</p>
      <Link to="/suites" style={{color: '#c9a84c'}}>Ver suites disponibles</Link>
    </div>
  )

  return (
    <div className={styles.page}>

      {/* ══ PANEL IZQUIERDO: Suite Narrativa ══ */}
      <aside 
        className={styles.panelLeft}
        style={{
          backgroundImage: suite.imagen_hero_url
            ? `url(${suite.imagen_hero_url})`
            : 'none',
        }}
      >
        <div className={styles.panelLeftOverlay} />
        
        <Link to="/" className={styles.panelLogo}>
          Casa d'Oro
        </Link>

        <div className={styles.panelContent}>
          <span className={styles.panelEyebrow}>{suite.tipo}</span>
          <h2 className={styles.panelTitle}>{suite.nombre}</h2>
          <em className={styles.panelVibe}>"{suite.vibe}"</em>

          <div className={styles.panelDetailsGrid}>
            <div className={styles.panelDetail}>
              <span className={styles.pdLabel}>Tarifa</span>
              <span className={styles.pdValue}>USD {suite.precio_por_noche} / noche</span>
            </div>
            <div className={styles.panelDetail}>
              <span className={styles.pdLabel}>Capacidad</span>
              <span className={styles.pdValue}>{suite.capacidad_adultos} Adultos {suite.capacidad_ninos > 0 ? `· ${suite.capacidad_ninos} Niños` : ''}</span>
            </div>
          </div>
          
          <Link to="/suites" className={styles.backLink}>
            ← Cambiar Suite
          </Link>
        </div>
      </aside>

      {/* ══ PANEL DERECHO: Workflow de Reserva ══ */}
      <div className={`
        ${styles.panelRight}
        ${step === 2 && !isSignedIn ? styles.panelRightLight : ''}
      `}>
        <div className={styles.formWrap}>

          {/* Progress Indicator */}
          {!success && (
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>Paso {step === 2.1 ? '2' : Math.floor(step)} de 3</span>
              <h1 className={styles.stepTitle}>
                {step === 1 && 'Elija sus Fechas'}
                {step === 2 && !isSignedIn && 'Identificación'}
                {(step === 2.1 || (step === 2 && isSignedIn)) && 'Sus Detalles'}
                {step === 3 && 'Revisión Final'}
              </h1>
            </div>
          )}

          {/* ── STEP 1: Selección de Fechas ── */}
          {step === 1 && (
            <div className={styles.stepBody}>
              
              <div className={styles.rangeWrapper}>
                <div 
                  className={styles.field} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <label className={styles.label}>
                    <span>Fechas de Estancia</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </label>
                  
                  <div className={styles.rangeDisplay}>
                    <div className={styles.rangeVal}>
                      <span className={styles.rangeSub}>Llegada</span>
                      <span className={styles.rangeText}>
                        {fechas.entrada ? formatDisplayDate(fechas.entrada) : 'Seleccione fecha'}
                      </span>
                    </div>
                    
                    <div className={styles.rangeSeparator}>⟶</div>
                    
                    <div className={styles.rangeVal}>
                      <span className={styles.rangeSub}>Salida</span>
                      <span className={styles.rangeText}>
                        {fechas.salida ? formatDisplayDate(fechas.salida) : 'Seleccione fecha'}
                      </span>
                    </div>
                  </div>
                </div>

                {showCalendar && (
                  <div className={styles.calendarContainer}>
                    <div className={styles.calendarHeader}>
                      <button 
                        className={styles.calendarNavBtn}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                        }}
                        disabled={
                          calendarMonth.getMonth() === new Date().getMonth() && 
                          calendarMonth.getFullYear() === new Date().getFullYear()
                        }
                      >
                        ←
                      </button>
                      
                      <span className={styles.calendarMonthName}>
                        {calendarMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                      </span>
                      
                      <button 
                        className={styles.calendarNavBtn}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                        }}
                      >
                        →
                      </button>
                    </div>

                    <div className={styles.calendarWeekdays}>
                      {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
                        <span key={d} className={styles.weekday}>{d}</span>
                      ))}
                    </div>

                    <div className={styles.calendarGrid}>
                      {getDaysInMonth(calendarMonth).map((day, idx) => {
                        if (!day) return <span key={`empty-${idx}`} className={styles.emptyDay} />
                        
                        const selectedStart = isSelectedStart(day)
                        const selectedEnd = isSelectedEnd(day)
                        const range = isInRange(day)
                        const disabled = isPast(day)
                        
                        return (
                          <button
                            key={day.toISOString()}
                            className={`
                              ${styles.day}
                              ${selectedStart ? styles.daySelectedStart : ''}
                              ${selectedEnd ? styles.daySelectedEnd : ''}
                              ${range ? styles.dayInRange : ''}
                              ${disabled ? styles.dayDisabled : ''}
                            `}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!disabled) handleDateClick(day)
                            }}
                            onMouseEnter={() => {
                              if (!disabled && fechas.entrada && !fechas.salida) {
                                setHoverDate(day)
                              }
                            }}
                            onMouseLeave={() => setHoverDate(null)}
                            disabled={disabled}
                            type="button"
                          >
                            {day.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.inputGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Adultos</label>
                  <select
                    className={styles.input}
                    value={datos.adultos}
                    onChange={e => setDatos(p => ({ ...p, adultos: parseInt(e.target.value) }))}
                  >
                    {Array.from({ length: suite.capacidad_adultos }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Niños</label>
                  <select
                    className={styles.input}
                    value={datos.ninos}
                    onChange={e => setDatos(p => ({ ...p, ninos: parseInt(e.target.value) }))}
                    disabled={suite.capacidad_ninos === 0}
                  >
                    {Array.from({ length: suite.capacidad_ninos + 1 }, (_, i) => i).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className={styles.choiceText} style={{ fontSize: '13px', marginTop: '-16px', fontStyle: 'italic' }}>
                * Capacidad máxima: {suite.capacidad_adultos} {suite.capacidad_adultos === 1 ? 'adulto' : 'adultos'} 
                {suite.capacidad_ninos > 0 ? ` y ${suite.capacidad_ninos} ${suite.capacidad_ninos === 1 ? 'niño' : 'niños'}` : ' (no se admiten niños en esta suite)'}.
              </p>

              {noches > 0 && (
                <div className={styles.summaryCard}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Estancia</span>
                    <span className={styles.summaryValue}>
                      {noches} {noches === 1 ? 'noche' : 'noches'}
                    </span>
                  </div>

                  {calculoTarifa.desglose && calculoTarifa.desglose.length > 0 && (
                    <div className={styles.breakdownContainer}>
                      <span className={styles.breakdownTitle}>Detalle de Tarifas</span>
                      <div className={styles.breakdownList}>
                        {calculoTarifa.desglose.map((noche, idx) => (
                          <div key={idx} className={styles.breakdownRow}>
                            <span className={styles.breakdownDate}>
                              {new Date(noche.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                              {noche.motivo !== 'Tarifa Base' && (
                                <span className={styles.breakdownBadge}>{noche.motivo}</span>
                              )}
                            </span>
                            <span className={styles.breakdownPrice}>
                              USD {noche.precio.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.summaryTotal}>
                    {calculandoTarifa ? (
                      <span style={{ fontSize: '16px', opacity: 0.7 }}>Calculando tarifa...</span>
                    ) : (
                      `USD ${total.toLocaleString()}`
                    )}
                  </div>
                </div>
              )}

              <button
                className={styles.submitBtn}
                onClick={() => setStep(isSignedIn ? 2.1 : 2)}
                disabled={!fechas.entrada || !fechas.salida || noches <= 0}
              >
                Continuar
              </button>
            </div>
          )}

          {/* ── STEP 2: Identificación Gate (Only if NOT signed in) ── */}
          {step === 2 && !isSignedIn && (
            <div className={styles.stepBody}>
              <div className={styles.choiceWrapper}>
                <div className={styles.choiceGrid}>
                  {/* Login Path */}
                  <div className={styles.choiceCol}>
                    <span className={styles.choiceEyebrow}>Miembros Club</span>
                    <p className={styles.choiceText}>
                      Inicie sesión para acceder a sus beneficios exclusivos, tarifas preferenciales y agilizar su registro de concierge.
                    </p>
                    <button 
                      className={styles.choiceSubmitBtn}
                      onClick={handleLoginClick}
                    >
                      Iniciar Sesión
                    </button>
                  </div>

                  {/* Divider */}
                  <div className={styles.choiceDivider}>
                    <span className={styles.choiceDividerText}>o</span>
                  </div>

                  {/* Guest Path */}
                  <div className={styles.choiceCol}>
                    <span className={styles.choiceEyebrow}>Acceso Rápido</span>
                    <p className={styles.choiceText}>
                      Continúe como invitado para completar su solicitud de reserva de inmediato. Podrá crear una cuenta al finalizar.
                    </p>
                    <button 
                      className={styles.choiceSecondaryBtn}
                      onClick={() => setStep(2.1)}
                    >
                      Continuar como Guest
                    </button>
                  </div>
                </div>
              </div>

              <button className={styles.backLink} onClick={() => setStep(1)}>
                ← Volver a fechas
              </button>
            </div>
          )}

          {/* ── STEP 2.1 / 2 (Signed In): Detalles ── */}
          {(step === 2.1 || (step === 2 && isSignedIn)) && (
            <div className={styles.stepBody}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre Completo</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ej. Alexander von Humboldt"
                  value={datos.nombre}
                  onChange={e => setDatos(p => ({ ...p, nombre: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="alexander@casa-doro.com"
                  value={datos.email}
                  onChange={e => setDatos(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Teléfono</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="+503 7000 0000"
                  value={datos.telefono}
                  onChange={e => setDatos(p => ({ ...p, telefono: e.target.value }))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Solicitudes Especiales</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Alergias, preferencias de almohadas o motivos de celebración..."
                  value={datos.solicitudes}
                  onChange={e => setDatos(p => ({ ...p, solicitudes: e.target.value }))}
                />
              </div>

              <div className={styles.inputGrid}>
                <button className={styles.secondaryBtn} onClick={() => setStep(isSignedIn ? 1 : 2)}>
                  ← Atrás
                </button>
                <button
                  className={styles.submitBtn}
                  onClick={() => setStep(3)}
                  disabled={!datos.nombre || !datos.email}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirmación Final ── */}
          {step === 3 && (!success || isStripeLoading || stripeRedirectUrl || stripeError) && (
            <div className={styles.stepBody}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Llegada</span>
                  <span className={styles.summaryValue}>{fechas.entrada}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Salida</span>
                  <span className={styles.summaryValue}>{fechas.salida}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Huéspedes</span>
                  <span className={styles.summaryValue}>{datos.adultos} Adultos · {datos.ninos} Niños</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Titular</span>
                  <span className={styles.summaryValue}>{datos.nombre}</span>
                </div>

                {calculoTarifa.desglose && calculoTarifa.desglose.length > 0 && (
                  <div className={styles.breakdownContainer}>
                    <span className={styles.breakdownTitle}>Detalle de Tarifas</span>
                    <div className={styles.breakdownList}>
                      {calculoTarifa.desglose.map((noche, idx) => (
                        <div key={idx} className={styles.breakdownRow}>
                          <span className={styles.breakdownDate}>
                            {new Date(noche.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                            {noche.motivo !== 'Tarifa Base' && (
                              <span className={styles.breakdownBadge}>{noche.motivo}</span>
                            )}
                          </span>
                          <span className={styles.breakdownPrice}>
                            USD {noche.precio.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.summaryTotal}>
                  USD {total.toLocaleString()}
                </div>
              </div>

              <p className={styles.choiceText} style={{fontStyle: 'italic', fontSize: '14px'}}>
                Al confirmar, nuestro equipo de concierge se pondrá en contacto con usted en menos de 12 horas para coordinar su llegada y gestionar los detalles de pago de forma segura.
              </p>

              {error && <p className={styles.choiceText} style={{color: '#c0573a'}}>{error}</p>}
              {stripeError && <p className={styles.choiceText} style={{color: '#c0573a'}}>{stripeError}</p>}
              {stripeRedirectUrl && !stripeError && (
                <p className={styles.choiceText} style={{color: '#c9a84c', fontSize: '14.5px', textAlign: 'center', marginTop: '10px', fontWeight: '500'}}>
                  ✦ Su sesión de pago está lista. Si la redirección automática falló, presione el botón de abajo.
                </p>
              )}

              <div className={styles.inputGrid}>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => {
                    resetSuccess()
                    setStripeRedirectUrl('')
                    setStripeError('')
                    setStep(2.1)
                  }}
                  disabled={loading || isStripeLoading}
                >
                  ← Editar
                </button>
                {stripeRedirectUrl ? (
                  <a
                    href={stripeRedirectUrl}
                    className={styles.submitBtn}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}
                  >
                    Ir a Pagar (Stripe) →
                  </a>
                ) : (
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={loading || isStripeLoading}
                  >
                    {loading || isStripeLoading ? 'Conectando con Stripe...' : 'Pagar con Tarjeta'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {success && !isStripeLoading && !stripeRedirectUrl && !stripeError && (
            <div className={styles.successContainer}>
              <span className={styles.successIcon}>✦</span>
              <h2 className={styles.stepTitle}>Solicitud Enviada</h2>
              <p className={styles.choiceText}>
                Gracias por elegir Casa d'Oro. Hemos recibido su solicitud para la suite <strong>{suite.nombre}</strong>.<br/>
                Un asesor de lujo se comunicará con usted a <strong>{datos.email}</strong> muy pronto.
              </p>
              <button 
                className={styles.submitBtn}
                onClick={() => navigate('/')}
              >
                Volver al Inicio
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}
