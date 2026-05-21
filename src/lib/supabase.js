import { createClient } from '@supabase/supabase-js'
import { getApiUrl } from './apiResolution'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
)

// supabaseAdmin client has been removed from frontend for security.

// ── Obtener URL pública de imagen del bucket ──
export const getImageUrl = (path) => {
  // Verificación ultra-robusta para evitar errores de tipo
  if (!path || typeof path !== 'string') {
    if (path) console.warn('[getImageUrl] Valor no válido recibido:', path);
    return null;
  }

  // Si ya es una URL completa (http), retornarla tal cual
  if (path.startsWith('http')) {
    return path;
  }

  try {
    const { data } = supabase.storage
      .from('suites')
      .getPublicUrl(path);
    
    if (!data || !data.publicUrl) {
      console.error('[getImageUrl] No se pudo obtener la URL para:', path);
      return null;
    }
    
    return data.publicUrl;
  } catch (err) {
    console.error('[getImageUrl] Error catastrófico:', err);
    return null;
  }
}

// ── Todas las suites disponibles ──
export const getSuites = async () => {
  const { data, error } = await supabase
    .from('suites')
    .select('*')
    .eq('disponible', true)
    .order('orden', { ascending: true })
  if (error) throw error
  return data
}

// ── Todas las suites (admin) ──
export const getAllAdminSuites = async () => {
  const { data, error } = await supabase
    .from('suites')
    .select('*')
    .order('orden', { ascending: true })
  if (error) throw error
  return data
}

// ── Una suite por slug ──
export const getSuiteBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('suites')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

// ── Verificar disponibilidad ──
export const verificarDisponibilidad = async (
  suiteId, fechaEntrada, fechaSalida
) => {
  // 1. Obtener la suite y su número de cuartos
  const { data: suite, error: suiteError } = await supabase
    .from('suites')
    .select('numero_cuartos')
    .eq('id', suiteId)
    .single()

  if (suiteError) throw suiteError
  const maxCuartos = suite?.numero_cuartos || 1

  // 2. Validar en reservaciones (sin estado cancelada)
  const { data: reservaciones, error: resError } = await supabase
    .from('reservaciones')
    .select('fecha_entrada, fecha_salida')
    .eq('suite_id', suiteId)
    .neq('estado', 'cancelada')
    .lt('fecha_entrada', fechaSalida)
    .gt('fecha_salida', fechaEntrada)

  if (resError) throw resError

  // 3. Validar en disponibilidad_bloqueada
  const { data: bloqueadas, error: blockError } = await supabase
    .from('disponibilidad_bloqueada')
    .select('id')
    .eq('suite_id', suiteId)
    .lt('fecha_inicio', fechaSalida)
    .gt('fecha_fin', fechaEntrada)

  if (blockError) throw blockError
  if (bloqueadas && bloqueadas.length > 0) return false

  // 4. Calcular la ocupación día por día en UTC
  const inicio = new Date(fechaEntrada + 'T00:00:00Z')
  const fin = new Date(fechaSalida + 'T00:00:00Z')

  for (let d = new Date(inicio); d < fin; d.setUTCDate(d.getUTCDate() + 1)) {
    const fechaActualStr = d.toISOString().split('T')[0]
    
    // Contar reservaciones activas para esta noche
    const ocupadas = reservaciones.filter(r => {
      return r.fecha_entrada <= fechaActualStr && r.fecha_salida > fechaActualStr
    }).length

    if (ocupadas >= maxCuartos) {
      return false
    }
  }

  return true
}

// ── Crear reservación ──
export const crearReservacion = async (reservacion) => {
  const { data, error } = await supabase
    .from('reservaciones')
    .insert(reservacion)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Reservaciones de un usuario (Autenticado de forma segura) ──
export const getMisReservaciones = async (token, clerkUserId, email) => {
  if (!token) {
    throw new Error('Token de autorización es requerido');
  }
  
  const res = await fetch(getApiUrl('/api/get-reservations'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ clerkUserId, email })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

// ── Actualizar estado reservación (cancelación por usuario) ──
export const actualizarEstado = async (id, token) => {
  const res = await fetch(getApiUrl('/api/cancel-reservation'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ id })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  const data = await res.json();
  return data.reservacion;
}

// ── Obtener tarifas de temporada (admin / público) ──
export const getTarifasSuite = async (suiteId) => {
  const { data, error } = await supabase
    .from('tarifas_temporada')
    .select('*')
    .eq('suite_id', suiteId)
    .order('prioridad', { ascending: false })
  if (error) throw error
  return data
}

// ── Motor de cálculo de tarifas dinámicas noche por noche ──
export const calcularPrecioEstancia = async (suiteId, fechaEntrada, fechaSalida) => {
  if (!suiteId || !fechaEntrada || !fechaSalida) {
    return { total: 0, desglose: [] }
  }

  try {
    const [suiteRes, tarifasRes] = await Promise.all([
      supabase.from('suites').select('precio_por_noche').eq('id', suiteId).single(),
      supabase.from('tarifas_temporada').select('*').eq('suite_id', suiteId).order('prioridad', { ascending: false })
    ])

    if (suiteRes.error) throw suiteRes.error
    const precioBase = suiteRes.data.precio_por_noche || 0
    const reglas = tarifasRes.data || []

    const desglose = []
    let totalGeneral = 0

    const inicio = new Date(fechaEntrada + 'T00:00:00Z')
    const fin = new Date(fechaSalida + 'T00:00:00Z')

    // Iterar día por día (sin incluir la fecha de salida)
    for (let d = new Date(inicio); d < fin; d.setUTCDate(d.getUTCDate() + 1)) {
      const fechaActualStr = d.toISOString().split('T')[0]
      const diaSemana = d.getUTCDay() // 0 = Domingo, 6 = Sábado

      // Buscar la primera regla que aplique para este día (ya ordenadas por prioridad desc)
      const reglaAplicable = reglas.find(regla => {
        const cumpleRango = (!regla.fecha_inicio || fechaActualStr >= regla.fecha_inicio) &&
                            (!regla.fecha_fin || fechaActualStr <= regla.fecha_fin)
        const cumpleDia = regla.dias_semana.includes(diaSemana)
        return cumpleRango && cumpleDia
      })

      let precioNoche = precioBase
      let motivo = 'Tarifa Base'

      if (reglaAplicable) {
        motivo = reglaAplicable.nombre
        if (reglaAplicable.tipo_ajuste === 'tarifa_fija') {
          precioNoche = parseFloat(reglaAplicable.valor)
        } else if (reglaAplicable.tipo_ajuste === 'porcentaje_incremento') {
          precioNoche = precioBase * (1 + (parseFloat(reglaAplicable.valor) / 100))
        } else if (reglaAplicable.tipo_ajuste === 'monto_incremento') {
          precioNoche = precioBase + parseFloat(reglaAplicable.valor)
        }
      }

      desglose.push({
        fecha: fechaActualStr,
        precio: Math.round(precioNoche),
        motivo
      })

      totalGeneral += precioNoche
    }

    return {
      total: Math.round(totalGeneral),
      desglose
    }
  } catch (err) {
    console.warn('[calcularPrecioEstancia] Error al calcular con tarifas dinámicas, usando fallback de base:', err.message)
    
    // Fallback al cálculo estático de base
    try {
      const { data: suite } = await supabase.from('suites').select('precio_por_noche').eq('id', suiteId).single()
      const precioBase = suite?.precio_por_noche || 0
      
      const inicio = new Date(fechaEntrada + 'T00:00:00Z')
      const fin = new Date(fechaSalida + 'T00:00:00Z')
      const noches = Math.max(0, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)))
      const total = noches * precioBase
      const desglose = []

      for (let i = 0; i < noches; i++) {
        const d = new Date(inicio)
        d.setUTCDate(d.getUTCDate() + i)
        desglose.push({
          fecha: d.toISOString().split('T')[0],
          precio: precioBase,
          motivo: 'Tarifa Base'
        })
      }

      return { total, desglose }
    } catch (fallbackErr) {
      console.error('[calcularPrecioEstancia] Fallback fallido:', fallbackErr)
      return { total: 0, desglose: [] }
    }
  }
}

export { getApiUrl } from './apiResolution'

