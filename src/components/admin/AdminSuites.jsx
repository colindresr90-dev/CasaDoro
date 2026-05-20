import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { supabase, getAllAdminSuites } from '../../lib/supabase'
import { 
  getFechasBloqueadas, 
  bloquearFechas,
  deleteBloqueoAdmin,
  updateSuiteAdmin,
  insertTarifaAdmin,
  deleteTarifaAdmin,
  uploadImageAdmin,
  deleteImageAdmin
} from '../../lib/supabaseAdmin'
import styles from '../../styles/AdminHabitaciones.module.css'

export default function AdminSuites() {
  const { getToken } = useAuth()
  const [suites, setSuites] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [suiteActiva, setSuiteActiva] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const fileInputRef = useRef(null)
  const heroFileRef = useRef(null)
  const [subiendoHero, setSubiendoHero] = useState(false)

  // Estados de Disponibilidad
  const [fechasBloqueadas, setFechasBloqueadas] = useState([])
  const [nuevaFechaInicio, setNuevaFechaInicio] = useState('')
  const [nuevaFechaFin, setNuevaFechaFin] = useState('')
  const [nuevoMotivo, setNuevoMotivo] = useState('')
  const [guardandoBloqueo, setGuardandoBloqueo] = useState(false)

  // Estados de Tarifas Dinámicas
  const [tarifasDinamicas, setTarifasDinamicas] = useState([])
  const [nuevaTarifa, setNuevaTarifa] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    dias_semana: [0, 1, 2, 3, 4, 5, 6],
    tipo_ajuste: 'tarifa_fija',
    valor: '',
    prioridad: 1
  })
  const [guardandoTarifa, setGuardandoTarifa] = useState(false)

  const fetchSuites = () => {
    setLoading(true)
    getAllAdminSuites()
      .then(setSuites)
      .catch(err => console.error("Error fetching suites:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.resolve().then(() => fetchSuites())
  }, [])

  // Estado del formulario de edición
  const [form, setForm] = useState({
    nombre: '',
    tipo: '',
    descripcion: '',
    descripcion_larga: '',
    vibe: '',
    precio_por_noche: '',
    capacidad_adultos: 2,
    capacidad_ninos: 0,
    metros_cuadrados: '',
    numero_cuartos: 1,
    numero_banos: 1,
    disponible: true,
    amenidades: [],
    caracteristicas: [],
  })

  const [nuevaAmenidad, setNuevaAmenidad] = useState('')
  const [nuevaCaracteristica, setNuevaCaracteristica] = useState('')
  const [imagenesActuales, setImagenesActuales] = useState([])

  // Cargar suite en el formulario
  const editarSuite = async (suite) => {
    setSuiteActiva(suite)
    setForm({
      nombre: suite.nombre || '',
      tipo: suite.tipo || '',
      descripcion: suite.descripcion || '',
      descripcion_larga: suite.descripcion_larga || '',
      vibe: suite.vibe || '',
      precio_por_noche: suite.precio_por_noche || '',
      capacidad_adultos: suite.capacidad_adultos || 2,
      capacidad_ninos: suite.capacidad_ninos || 0,
      metros_cuadrados: suite.metros_cuadrados || '',
      numero_cuartos: suite.numero_cuartos || 1,
      numero_banos: suite.numero_banos || 1,
      disponible: suite.disponible ?? true,
      amenidades: typeof suite.amenidades === 'string'
        ? JSON.parse(suite.amenidades)
        : suite.amenidades || [],
      caracteristicas: typeof suite.caracteristicas === 'string'
        ? JSON.parse(suite.caracteristicas)
        : suite.caracteristicas || [],
    })
    setImagenesActuales(
      typeof suite.imagenes === 'string'
        ? JSON.parse(suite.imagenes)
        : suite.imagenes || []
    )
    setMensaje(null)
    
    // Cargar fechas bloqueadas
    try {
      const fechas = await getFechasBloqueadas(suite.id)
      setFechasBloqueadas(fechas || [])
    } catch (e) {
      console.error("Error cargando bloqueos:", e)
    }

    // Cargar tarifas dinámicas
    try {
      const { data: rules, error: rulesErr } = await supabase
        .from('tarifas_temporada')
        .select('*')
        .eq('suite_id', suite.id)
        .order('prioridad', { ascending: false })
      if (rulesErr) throw rulesErr
      setTarifasDinamicas(rules || [])
    } catch (e) {
      console.error("Error cargando tarifas dinámicas:", e)
      setTarifasDinamicas([])
    }
  }

  // Guardar cambios
  const guardarCambios = async () => {
    if (!suiteActiva) return
    setGuardando(true)
    setMensaje(null)

    try {
      const token = await getToken()
      const suiteData = {
        nombre: form.nombre,
        tipo: form.tipo,
        descripcion: form.descripcion,
        descripcion_larga: form.descripcion_larga,
        vibe: form.vibe,
        precio_por_noche: parseFloat(form.precio_por_noche),
        capacidad_adultos: parseInt(form.capacidad_adultos),
        capacidad_ninos: parseInt(form.capacidad_ninos),
        metros_cuadrados: parseInt(form.metros_cuadrados),
        numero_cuartos: parseInt(form.numero_cuartos),
        numero_banos: parseInt(form.numero_banos),
        disponible: form.disponible,
        amenidades: form.amenidades,
        caracteristicas: form.caracteristicas,
        imagenes: imagenesActuales,
      }
      const data = await updateSuiteAdmin(token, suiteActiva.id, suiteData)

      if (!data) {
        throw new Error('No se pudo actualizar.')
      }

      setSuites(prev => prev.map(s => s.id === suiteActiva.id ? data[0] : s))
      setSuiteActiva(data[0])

      setMensaje({ tipo: 'success', texto: 'Cambios guardados correctamente.' })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + err.message })
    } finally {
      setGuardando(false)
    }
  }

  // Agregar Bloqueo de Disponibilidad
  const handleAgregarBloqueo = async () => {
    if (!nuevaFechaInicio || !nuevaFechaFin || !nuevoMotivo) {
      setMensaje({ tipo: 'error', texto: 'Debes completar fechas y motivo.' })
      return
    }
    setGuardandoBloqueo(true)
    try {
      const token = await getToken()
      const data = await bloquearFechas(token, suiteActiva.id, nuevaFechaInicio, nuevaFechaFin, nuevoMotivo)
      setFechasBloqueadas(prev => [...prev, data].sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio)))
      setNuevaFechaInicio('')
      setNuevaFechaFin('')
      setNuevoMotivo('')
      setMensaje({ tipo: 'success', texto: 'Fechas bloqueadas con éxito.' })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al bloquear fechas: ' + e.message })
    } finally {
      setGuardandoBloqueo(false)
    }
  }

  const eliminarBloqueo = async (id) => {
    try {
      const token = await getToken()
      await deleteBloqueoAdmin(token, id)
      setFechasBloqueadas(prev => prev.filter(b => b.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  // Agregar Tarifa Dinámica
  const handleAgregarTarifa = async () => {
    if (!nuevaTarifa.nombre || !nuevaTarifa.valor) {
      setMensaje({ tipo: 'error', texto: 'Debes completar el nombre y el valor de la tarifa.' })
      return
    }
    setGuardandoTarifa(true)
    try {
      const token = await getToken()
      const data = await insertTarifaAdmin(token, {
        suite_id: suiteActiva.id,
        nombre: nuevaTarifa.nombre,
        fecha_inicio: nuevaTarifa.fecha_inicio || null,
        fecha_fin: nuevaTarifa.fecha_fin || null,
        dias_semana: nuevaTarifa.dias_semana,
        tipo_ajuste: nuevaTarifa.tipo_ajuste,
        valor: parseFloat(nuevaTarifa.valor),
        prioridad: parseInt(nuevaTarifa.prioridad)
      })
      
      setTarifasDinamicas(prev => [data, ...prev].sort((a, b) => b.prioridad - a.prioridad))
      setNuevaTarifa({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        dias_semana: [0, 1, 2, 3, 4, 5, 6],
        tipo_ajuste: 'tarifa_fija',
        valor: '',
        prioridad: 1
      })
      setMensaje({ tipo: 'success', texto: 'Regla de tarifa dinámica agregada con éxito.' })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al agregar tarifa: ' + e.message })
    } finally {
      setGuardandoTarifa(false)
    }
  }

  // Eliminar Tarifa Dinámica
  const eliminarTarifa = async (id) => {
    try {
      const token = await getToken()
      await deleteTarifaAdmin(token, id)
      setTarifasDinamicas(prev => prev.filter(t => t.id !== id))
      setMensaje({ tipo: 'success', texto: 'Regla de tarifa eliminada.' })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar regla: ' + e.message })
    }
  }

  // Toggle Día de la Semana
  const toggleDiaSemana = (diaVal) => {
    setNuevaTarifa(p => {
      const activeDays = p.dias_semana.includes(diaVal)
        ? p.dias_semana.filter(d => d !== diaVal)
        : [...p.dias_semana, diaVal]
      return { ...p, dias_semana: activeDays }
    })
  }

  // Subir imagen al bucket
  const subirImagen = async (e) => {
    const archivos = Array.from(e.target.files)
    if (archivos.length === 0 || !suiteActiva) return

    setSubiendo(true)
    const nuevasImagenes = []
    
    try {
      const token = await getToken()
      for (const archivo of archivos) {
        const extension = archivo.name.split('.').pop()
        const nombreArchivo = `${suiteActiva.slug}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`

        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result.split(',')[1])
          reader.onerror = reject
          reader.readAsDataURL(archivo)
        })

        const res = await uploadImageAdmin(token, nombreArchivo, fileData, archivo.type)
        nuevasImagenes.push({ url: res.publicUrl, alt: `${suiteActiva.nombre}`, es_hero: false })
      }

      setImagenesActuales(prev => [...prev, ...nuevasImagenes])
      setMensaje({ tipo: 'success', texto: `${nuevasImagenes.length} imágenes subidas correctamente.` })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al subir imágenes: ' + err.message })
    } finally {
      setSubiendo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const subirImagenHero = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo || !suiteActiva) return

    setSubiendoHero(true)
    try {
      const token = await getToken()
      const ext = archivo.name.split('.').pop()
      const path = `${suiteActiva.slug}/hero-${Date.now()}.${ext}`

      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(archivo)
      })

      const res = await uploadImageAdmin(token, path, fileData, archivo.type)

      await updateSuiteAdmin(token, suiteActiva.id, { imagen_hero_url: res.publicUrl })

      setSuiteActiva(prev => ({ ...prev, imagen_hero_url: res.publicUrl }))
      setMensaje({ tipo: 'success', texto: 'Imagen principal actualizada.' })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error: ' + err.message })
    } finally {
      setSubiendoHero(false)
      if (heroFileRef.current) heroFileRef.current.value = ''
    }
  }

  const eliminarImagen = async (url) => {
    try {
      const token = await getToken()
      const path = url.split('/suites/')[1]
      await deleteImageAdmin(token, path)
      setImagenesActuales(prev => prev.filter(img => img.url !== url))
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar: ' + err.message })
    }
  }

  const agregarAmenidad = () => {
    if (!nuevaAmenidad.trim()) return
    setForm(prev => ({ ...prev, amenidades: [...prev.amenidades, nuevaAmenidad.trim()] }))
    setNuevaAmenidad('')
  }
  const eliminarAmenidad = (index) => {
    setForm(prev => ({ ...prev, amenidades: prev.amenidades.filter((_, i) => i !== index) }))
  }

  const agregarCaracteristica = () => {
    if (!nuevaCaracteristica.trim()) return
    setForm(prev => ({ ...prev, caracteristicas: [...prev.caracteristicas, nuevaCaracteristica.trim()] }))
    setNuevaCaracteristica('')
  }
  const eliminarCaracteristica = (index) => {
    setForm(prev => ({ ...prev, caracteristicas: prev.caracteristicas.filter((_, i) => i !== index) }))
  }

  if (loading) return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', background: '#FDFCFB'}}>
      <span style={{fontFamily: 'Jost', letterSpacing: '0.2em'}}>CARGANDO...</span>
    </div>
  )

  return (
    <div className={styles.layout}>

      {/* ── SIDEBAR — Lista de suites ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Habitaciones</span>
          <span className={styles.sidebarCount}>{suites.length}</span>
        </div>

        <div className={styles.suiteList}>
          {suites.map(suite => {
            const imagenesParsed = typeof suite.imagenes === 'string' ? JSON.parse(suite.imagenes) : suite.imagenes || [];
            const thumbUrl = suite.imagen_hero_url || imagenesParsed?.[0]?.url || '';
            
            return (
            <button
              key={suite.id}
              className={`${styles.suiteListItem} ${suiteActiva?.id === suite.id ? styles.suiteListItemActive : ''}`}
              onClick={() => editarSuite(suite)}
            >
              <div
                className={styles.suiteMini}
                style={{ backgroundImage: thumbUrl ? `url(${thumbUrl})` : 'none' }}
              />
              <div className={styles.suiteListInfo}>
                <span className={styles.suiteListName}>{suite.nombre_corto || suite.nombre}</span>
                <span className={styles.suiteListTipo}>{suite.tipo}</span>
                <div className={styles.suiteListMeta}>
                  <div className={`${styles.statusDot} ${suite.disponible ? styles.statusDotActive : styles.statusDotInactive}`} />
                  <span className={styles.statusText}>{suite.disponible ? 'Disponible' : 'Inactivo'}</span>
                </div>
              </div>
            </button>
          )})}
        </div>
      </aside>

      {/* ── MAIN — Editor de suite ── */}
      <div className={styles.editor}>
        
        {!suiteActiva ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✦</span>
            <h2 className={styles.emptyTitle}>Selecciona una suite</h2>
          </div>
        ) : (
          <>
            {/* ── EDITOR HEADER ── */}
            <div className={styles.editorHeader}>
              <div className={styles.editorHeaderLeft}>
                <span className={styles.editorEyebrow}>Edición Editorial</span>
                <h2 className={styles.editorTitle}>{suiteActiva.nombre}</h2>
              </div>
              <div className={styles.editorHeaderRight}>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={form.disponible}
                    onChange={e => setForm(p => ({ ...p, disponible: e.target.checked }))}
                  />
                  <span className={styles.toggleTrack}>
                    <span className={styles.toggleThumb} />
                  </span>
                  <span className={styles.toggleLabel}>
                    {form.disponible ? 'Activa' : 'Inactiva'}
                  </span>
                </label>
              </div>
            </div>

            {mensaje && (
              <div className={`${styles.mensaje} ${styles[`mensaje_${mensaje.tipo}`]}`}>
                {mensaje.texto}
              </div>
            )}

            {/* ── EDITOR BODY ── */}
            <div className={styles.editorBody}>

              {/* BLOQUE 1: NARRATIVA */}
              <div className={styles.editorBlock}>
                <div className={styles.blockHeader}>
                  <h3 className={styles.blockTitle}>Narrativa de la Suite</h3>
                  <p className={styles.blockSub}>Concepto editorial, vibra y textos descriptivos.</p>
                </div>
                <div className={styles.blockContent}>
                  
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Nombre Completo</label>
                      <input
                        type="text"
                        className={styles.fieldInput}
                        value={form.nombre}
                        onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Tipo</label>
                      <select
                        className={styles.fieldInput}
                        value={form.tipo}
                        onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}
                      >
                        <option>Junior Suite</option>
                        <option>Suite Ejecutiva</option>
                        <option>Gran Suite</option>
                        <option>Suite Presidencial</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Vibe / Concepto</label>
                    <div className={styles.fieldWithIcon}>
                      <span className={styles.fieldIconLeft}>"</span>
                      <input
                        type="text"
                        className={`${styles.fieldInput} ${styles.fieldInputQuote}`}
                        value={form.vibe}
                        onChange={e => setForm(p => ({ ...p, vibe: e.target.value }))}
                        placeholder="El refugio perfecto..."
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Descripción Corta</label>
                    <textarea
                      className={`${styles.fieldInput} ${styles.fieldTextarea}`}
                      value={form.descripcion}
                      onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                      style={{ minHeight: '80px' }}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Descripción Completa y Detalles</label>
                    <textarea
                      className={`${styles.fieldInput} ${styles.fieldTextarea}`}
                      value={form.descripcion_larga}
                      onChange={e => setForm(p => ({ ...p, descripcion_larga: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* BLOQUE 2: FICHA TÉCNICA */}
              <div className={styles.editorBlock}>
                <div className={styles.blockHeader}>
                  <h3 className={styles.blockTitle}>Ficha Técnica</h3>
                  <p className={styles.blockSub}>Métricas, precios y capacidades.</p>
                </div>
                <div className={styles.blockContent}>
                  <div className={styles.statsInputGrid}>
                    <div className={styles.statInputItem}>
                      <label className={styles.statInputLabel}>Precio / Noche</label>
                      <div className={styles.statInputWrap}>
                        <span className={styles.statInputPrefix}>$</span>
                        <input type="number" className={styles.statInput} value={form.precio_por_noche} onChange={e => setForm(p => ({ ...p, precio_por_noche: e.target.value }))} />
                        <span className={styles.statInputSuffix}>USD</span>
                      </div>
                    </div>
                    <div className={styles.statInputItem}>
                      <label className={styles.statInputLabel}>Dimensión</label>
                      <div className={styles.statInputWrap}>
                        <input type="number" className={styles.statInput} value={form.metros_cuadrados} onChange={e => setForm(p => ({ ...p, metros_cuadrados: e.target.value }))} />
                        <span className={styles.statInputSuffix}>m²</span>
                      </div>
                    </div>
                    <div className={styles.statInputItem}>
                      <label className={styles.statInputLabel}>Habitaciones</label>
                      <div className={styles.statInputWrap}>
                        <input type="number" className={styles.statInput} value={form.numero_cuartos} onChange={e => setForm(p => ({ ...p, numero_cuartos: e.target.value }))} />
                      </div>
                    </div>
                    <div className={styles.statInputItem}>
                      <label className={styles.statInputLabel}>Baños</label>
                      <div className={styles.statInputWrap}>
                        <input type="number" className={styles.statInput} value={form.numero_banos} onChange={e => setForm(p => ({ ...p, numero_banos: e.target.value }))} />
                      </div>
                    </div>
                    <div className={styles.statInputItem}>
                      <label className={styles.statInputLabel}>Adultos</label>
                      <div className={styles.statInputWrap}>
                        <input type="number" className={styles.statInput} value={form.capacidad_adultos} onChange={e => setForm(p => ({ ...p, capacidad_adultos: e.target.value }))} />
                      </div>
                    </div>
                    <div className={styles.statInputItem}>
                      <label className={styles.statInputLabel}>Niños</label>
                      <div className={styles.statInputWrap}>
                        <input type="number" className={styles.statInput} value={form.capacidad_ninos} onChange={e => setForm(p => ({ ...p, capacidad_ninos: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE 3: TAGS */}
              <div className={styles.editorBlock}>
                <div className={styles.blockHeader}>
                  <h3 className={styles.blockTitle}>Detalles & Amenidades</h3>
                  <p className={styles.blockSub}>Características especiales y servicios incluidos.</p>
                </div>
                <div className={styles.blockContent}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Características Principales (Destacadas)</label>
                    <div className={styles.tagGrid}>
                      {form.caracteristicas.map((c, i) => (
                        <div key={i} className={`${styles.tag} ${styles.tagGold}`}>
                          {c}
                          <button className={styles.tagRemove} onClick={() => eliminarCaracteristica(i)}>×</button>
                        </div>
                      ))}
                    </div>
                    <div className={styles.addRow}>
                      <input type="text" className={styles.addBloqueInput} placeholder="Ej: Vista panorámica..." value={nuevaCaracteristica} onChange={e => setNuevaCaracteristica(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregarCaracteristica()} />
                      <button className={styles.addBtn} onClick={agregarCaracteristica}>Añadir</button>
                    </div>
                  </div>

                  <div className={styles.field} style={{ marginTop: '40px' }}>
                    <label className={styles.fieldLabel}>Amenidades Generales</label>
                    <div className={styles.tagGrid}>
                      {form.amenidades.map((a, i) => (
                        <div key={i} className={styles.tag}>
                          {a}
                          <button className={styles.tagRemove} onClick={() => eliminarAmenidad(i)}>×</button>
                        </div>
                      ))}
                    </div>
                    <div className={styles.addRow}>
                      <input type="text" className={styles.addBloqueInput} placeholder="Ej: Cama King" value={nuevaAmenidad} onChange={e => setNuevaAmenidad(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregarAmenidad()} />
                      <button className={styles.addBtn} onClick={agregarAmenidad}>Añadir</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUE 4: DISPONIBILIDAD BLOQUEADA */}
              <div className={styles.editorBlock}>
                <div className={styles.blockHeader}>
                  <h3 className={styles.blockTitle}>Bloqueo de Fechas</h3>
                  <p className={styles.blockSub}>Fechas cerradas por mantenimiento o uso de dueños.</p>
                </div>
                <div className={styles.blockContent}>
                  
                  {fechasBloqueadas.length > 0 ? (
                    <div className={styles.bloquesList}>
                      {fechasBloqueadas.map(bloque => (
                        <div key={bloque.id} className={styles.bloqueItem}>
                          <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                            <span className={styles.bloqueFechas}>{bloque.fecha_inicio} al {bloque.fecha_fin}</span>
                            <span className={styles.bloqueMotivo}>{bloque.motivo}</span>
                          </div>
                          <button className={styles.tagRemove} onClick={() => eliminarBloqueo(bloque.id)}>Eliminar</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{fontFamily:'Jost', fontSize:'12px', color:'var(--admin-text-dim)'}}>No hay fechas bloqueadas actualmente.</span>
                  )}

                  <div className={styles.addBloqueContainer}>
                    <label className={styles.fieldLabel} style={{marginBottom:'16px'}}>Añadir Nuevo Bloqueo</label>
                    <div className={styles.addBloqueRow}>
                      <input type="date" className={styles.addBloqueInput} value={nuevaFechaInicio} onChange={e => setNuevaFechaInicio(e.target.value)} />
                      <input type="date" className={styles.addBloqueInput} value={nuevaFechaFin} onChange={e => setNuevaFechaFin(e.target.value)} />
                    </div>
                    <input type="text" className={styles.addBloqueInput} placeholder="Motivo (ej. Mantenimiento)" value={nuevoMotivo} onChange={e => setNuevoMotivo(e.target.value)} style={{marginBottom:'24px'}} />
                    <button className={styles.addBtn} onClick={handleAgregarBloqueo} disabled={guardandoBloqueo}>
                      {guardandoBloqueo ? 'Bloqueando...' : 'Bloquear Fechas'}
                    </button>
                  </div>

                </div>
              </div>

              {/* BLOQUE 4.5: TARIFAS ESPECIALES Y DE TEMPORADA */}
              <div className={styles.editorBlock}>
                <div className={styles.blockHeader}>
                  <h3 className={styles.blockTitle}>Tarifas Especiales</h3>
                  <p className={styles.blockSub}>Precios dinámicos por temporada, fines de semana o eventos.</p>
                </div>
                <div className={styles.blockContent}>
                  
                  {tarifasDinamicas.length > 0 ? (
                    <div className={styles.bloquesList}>
                      {tarifasDinamicas.map(tarifa => {
                        const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
                        const diasText = tarifa.dias_semana.length === 7 
                          ? 'Todos los días' 
                          : tarifa.dias_semana.map(d => diasNombres[d]).join(', ')
                        
                        let valorStr = ''
                        if (tarifa.tipo_ajuste === 'tarifa_fija') valorStr = `$${tarifa.valor} USD (Fijo)`
                        else if (tarifa.tipo_ajuste === 'porcentaje_incremento') valorStr = `+${tarifa.valor}%`
                        else if (tarifa.tipo_ajuste === 'monto_incremento') valorStr = `+$${tarifa.valor} USD`

                        return (
                          <div key={tarifa.id} className={styles.bloqueItem}>
                            <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                              <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}>
                                <span className={styles.bloqueFechas} style={{fontWeight:'500'}}>{tarifa.nombre}</span>
                                <span className={styles.tarifaBadge}>{valorStr}</span>
                                <span className={styles.tarifaBadge} style={{background:'rgba(44,62,80,0.03)', color:'var(--admin-text-dim)', borderColor:'var(--admin-border)'}}>Prioridad: {tarifa.prioridad}</span>
                              </div>
                              <span className={styles.bloqueMotivo}>
                                {tarifa.fecha_inicio ? `${tarifa.fecha_inicio} al ${tarifa.fecha_fin}` : 'Todo el año'} — {diasText}
                              </span>
                            </div>
                            <button className={styles.tagRemove} onClick={() => eliminarTarifa(tarifa.id)}>Eliminar</button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <span style={{fontFamily:'Jost', fontSize:'12px', color:'var(--admin-text-dim)'}}>No hay tarifas dinámicas configuradas. Se aplicará el precio base de la suite.</span>
                  )}

                  <div className={styles.addBloqueContainer}>
                    <label className={styles.fieldLabel} style={{marginBottom:'16px'}}>Crear Regla de Tarifa Dinámica</label>
                    
                    <input 
                      type="text" 
                      className={styles.addBloqueInput} 
                      placeholder="Nombre de la temporada (ej. Semana Santa, Fin de Semana Verano)" 
                      value={nuevaTarifa.nombre} 
                      onChange={e => setNuevaTarifa(p => ({ ...p, nombre: e.target.value }))} 
                      style={{marginBottom:'24px'}}
                    />

                    <div className={styles.addBloqueRow} style={{marginBottom:'24px'}}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} style={{fontSize:'10px'}}>Fecha Inicio (Opcional)</label>
                        <input type="date" className={styles.addBloqueInput} value={nuevaTarifa.fecha_inicio} onChange={e => setNuevaTarifa(p => ({ ...p, fecha_inicio: e.target.value }))} />
                      </div>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} style={{fontSize:'10px'}}>Fecha Fin (Opcional)</label>
                        <input type="date" className={styles.addBloqueInput} value={nuevaTarifa.fecha_fin} onChange={e => setNuevaTarifa(p => ({ ...p, fecha_fin: e.target.value }))} />
                      </div>
                    </div>

                    <div style={{marginBottom:'28px'}}>
                      <label className={styles.fieldLabel} style={{fontSize:'11px', marginBottom:'8px'}}>Días de la semana que aplica</label>
                      <div className={styles.daySelector}>
                        {[
                          { label: 'Lun', val: 1 },
                          { label: 'Mar', val: 2 },
                          { label: 'Mié', val: 3 },
                          { label: 'Jue', val: 4 },
                          { label: 'Vie', val: 5 },
                          { label: 'Sáb', val: 6 },
                          { label: 'Dom', val: 0 }
                        ].map(dia => {
                          const isActive = nuevaTarifa.dias_semana.includes(dia.val)
                          return (
                            <div 
                              key={dia.val} 
                              className={`${styles.dayCircle} ${isActive ? styles.dayCircleActive : ''}`}
                              onClick={() => toggleDiaSemana(dia.val)}
                            >
                              {dia.label}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className={styles.addBloqueRow} style={{marginBottom:'24px', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px'}}>
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} style={{fontSize:'10px'}}>Tipo de Ajuste</label>
                        <select 
                          className={styles.addBloqueInput} 
                          value={nuevaTarifa.tipo_ajuste} 
                          onChange={e => setNuevaTarifa(p => ({ ...p, tipo_ajuste: e.target.value }))}
                          style={{height:'44px', borderBottom:'0.5px solid var(--admin-border)'}}
                        >
                          <option value="tarifa_fija">Tarifa Fija (USD)</option>
                          <option value="porcentaje_incremento">Incremento %</option>
                          <option value="monto_incremento">Monto Incremento (USD)</option>
                        </select>
                      </div>
                      
                      <div className={styles.field}>
                        <label className={styles.fieldLabel} style={{fontSize:'10px'}}>Valor</label>
                        <input 
                          type="number" 
                          step="any"
                          className={styles.addBloqueInput} 
                          placeholder="Ej: 150 o 15" 
                          value={nuevaTarifa.valor} 
                          onChange={e => setNuevaTarifa(p => ({ ...p, valor: e.target.value }))} 
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.fieldLabel} style={{fontSize:'10px'}}>Prioridad (1-10)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="10" 
                          className={styles.addBloqueInput} 
                          placeholder="Prioridad" 
                          value={nuevaTarifa.prioridad} 
                          onChange={e => setNuevaTarifa(p => ({ ...p, prioridad: e.target.value }))} 
                        />
                      </div>
                    </div>

                    <button className={styles.addBtn} onClick={handleAgregarTarifa} disabled={guardandoTarifa}>
                      {guardandoTarifa ? 'Guardando...' : 'Crear Regla de Tarifa'}
                    </button>
                  </div>

                </div>
              </div>

              {/* BLOQUE 5: MEDIA & GALERÍA */}
              <div className={styles.editorBlock}>
                <div className={styles.blockHeader}>
                  <h3 className={styles.blockTitle}>Fotografía</h3>
                  <p className={styles.blockSub}>Hero image y galería asimétrica de la suite.</p>
                </div>
                <div className={styles.blockContent}>
                  
                  {suiteActiva.imagen_hero_url ? (
                    <div className={styles.heroPreview}>
                      <div className={styles.heroPreviewImg} style={{ backgroundImage: `url(${suiteActiva.imagen_hero_url})` }}>
                        <span className={styles.heroPreviewBadge}>HERO IMAGE</span>
                      </div>
                      <div className={styles.heroPreviewActions}>
                        <span className={styles.heroPreviewUrl}>{suiteActiva.imagen_hero_url.split('/').pop()}</span>
                        <button 
                          className={styles.addBtn} 
                          onClick={async () => {
                            try {
                              const token = await getToken()
                              await updateSuiteAdmin(token, suiteActiva.id, { imagen_hero_url: null })
                              setSuiteActiva(p => ({...p, imagen_hero_url: null}))
                            } catch (err) {
                              console.error("Error al remover imagen principal:", err)
                            }
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.heroUploadZone} onClick={() => heroFileRef.current?.click()}>
                      <input ref={heroFileRef} type="file" accept="image/*" onChange={subirImagenHero} style={{ display: 'none' }} />
                      <span className={styles.heroUploadTitle}>{subiendoHero ? 'Subiendo...' : 'Asignar Imagen Principal (Hero)'}</span>
                    </div>
                  )}

                  {imagenesActuales.length > 0 && (
                    <div className={styles.galleryGrid} style={{ marginBottom: '24px' }}>
                      {imagenesActuales.map((img, i) => (
                        <div key={i} className={styles.galleryItem}>
                          <div className={styles.galleryThumb} style={{ backgroundImage: `url(${img.url})` }} />
                          <div className={styles.galleryOverlay}>
                            <button className={styles.galleryDeleteBtn} onClick={() => eliminarImagen(img.url)}>✕</button>
                          </div>
                          <span className={styles.galleryNum}>{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles.galleryUploadZone} onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={subirImagen} style={{ display: 'none' }} />
                    <span className={styles.galleryUploadText}>{subiendo ? 'Subiendo...' : '+ Añadir Fotos a la Galería'}</span>
                  </div>

                </div>
              </div>

            </div>

            <div className={styles.floatingSave}>
              {mensaje && (
                <span className={styles.miniMensaje}>{mensaje.texto}</span>
              )}
              <button className={styles.saveBtn} onClick={guardarCambios} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Publicar Edición'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
