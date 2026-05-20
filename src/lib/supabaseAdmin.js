import { supabase } from './supabase'

const getAdminApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3002/api/admin';
  }
  return '/api/admin';
};

const callAdminApi = async (token, action, params = {}) => {
  const url = getAdminApiUrl();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ action, ...params })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
};

// ── Stats del dashboard ──
export const getDashboardStats = async (token) => {
  return callAdminApi(token, 'getDashboardStats');
}

// ── Todas las reservaciones con suite info ──
export const getReservacionesAdmin = async (token, filtros = {}) => {
  return callAdminApi(token, 'getReservacionesAdmin', { filtros });
}

// ── Obtener una reservación por ID para administración ──
export const getReservacionAdmin = async (token, id) => {
  return callAdminApi(token, 'getReservacionAdmin', { id });
}

// ── Actualizar estado de reservación ──
export const actualizarEstadoReservacion = async (token, id, estado) => {
  return callAdminApi(token, 'actualizarEstadoReservacion', { id, estado });
}

// ── Actualizar reservación completa ──
export const updateReservacionAdmin = async (token, id, reservacionData) => {
  return callAdminApi(token, 'updateReservacion', { id, reservacionData });
}

// ── Verificar si clerk_user_id es admin ──
export const verificarAdmin = async (token) => {
  try {
    const data = await callAdminApi(token, 'verificarAdmin');
    return data?.isAdmin === true;
  } catch {
    return false;
  }
}

// ── Bloquear fechas en una suite ──
export const bloquearFechas = async (token, suiteId, fechaInicio, fechaFin, motivo) => {
  return callAdminApi(token, 'bloquearFechas', { suiteId, fechaInicio, fechaFin, motivo });
}

// ── Eliminar fechas bloqueadas ──
export const deleteBloqueoAdmin = async (token, id) => {
  return callAdminApi(token, 'deleteBloqueo', { id });
}

// ── Obtener fechas bloqueadas (Lectura pública) ──
export const getFechasBloqueadas = async (suiteId) => {
  const { data, error } = await supabase
    .from('disponibilidad_bloqueada')
    .select('*')
    .eq('suite_id', suiteId)
    .gte('fecha_fin', new Date().toISOString().split('T')[0])
    .order('fecha_inicio')
  if (error) throw error
  return data
}

// ── Actualizar datos de suite ──
export const updateSuiteAdmin = async (token, suiteId, suiteData) => {
  return callAdminApi(token, 'updateSuite', { suiteId, suiteData });
}

// ── Insertar regla de tarifa dinámica ──
export const insertTarifaAdmin = async (token, tarifaData) => {
  return callAdminApi(token, 'insertTarifa', { tarifaData });
}

// ── Eliminar regla de tarifa dinámica ──
export const deleteTarifaAdmin = async (token, id) => {
  return callAdminApi(token, 'deleteTarifa', { id });
}

// ── Subir imagen a storage bucket de suites ──
export const uploadImageAdmin = async (token, filename, fileData, contentType) => {
  return callAdminApi(token, 'uploadImage', { filename, fileData, contentType });
}

// ── Eliminar imagen de storage bucket de suites ──
export const deleteImageAdmin = async (token, path) => {
  return callAdminApi(token, 'deleteImage', { path });
}
