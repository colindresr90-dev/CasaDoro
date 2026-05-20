import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

let cachedJwks = null;

async function getClerkPublicKey(kid) {
  if (!cachedJwks) {
    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret) {
      throw new Error('CLERK_SECRET_KEY is not defined in environment variables');
    }
    const res = await fetch('https://api.clerk.com/v1/jwks', {
      headers: {
        Authorization: `Bearer ${clerkSecret}`
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch JWKS from Clerk: ${res.status}`);
    }
    cachedJwks = await res.json();
  }

  const key = cachedJwks.keys.find(k => k.kid === kid);
  if (!key) {
    throw new Error(`Key with kid ${kid} not found in JWKS`);
  }

  return crypto.createPublicKey({
    format: 'jwk',
    key: key
  });
}

async function verifyClerkToken(token) {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Decode header to get kid
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    const kid = header.kid;
    if (!kid) return null;

    const publicKey = await getClerkPublicKey(kid);
    const data = `${headerB64}.${payloadB64}`;
    const signature = Buffer.from(signatureB64, 'base64url');

    const isVerified = crypto.verify(
      'sha256',
      Buffer.from(data),
      publicKey,
      signature
    );

    if (!isVerified) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    
    // Validate expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('[verifyClerkToken] Token has expired');
      return null;
    }

    return payload;
  } catch (err) {
    console.error('[verifyClerkToken] Verification error:', err);
    return null;
  }
}

export default async function handler(req, res) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate with Clerk Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado: Falta el token de autorización' });
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyClerkToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'No autorizado: Token inválido o expirado' });
  }

  const clerkUserId = payload.sub; // Clerk user ID
  console.log('[Admin API] Verifying admin status for Clerk User ID:', clerkUserId);

  try {
    // 2. Authorize: Check if clerkUserId exists in admin_users and is active
    const { data: adminUser, error: adminErr } = await supabaseAdmin
      .from('admin_users')
      .select('rol, activo')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();

    if (adminErr) {
      console.error('[Admin API] Error querying admin_users:', adminErr);
      return res.status(500).json({ error: 'Error interno del servidor al verificar rol de administrador' });
    }

    console.log('[Admin API] Admin user query result:', adminUser);

    const isAuthorized = adminUser && adminUser.activo === true && adminUser.rol === 'admin';
    if (!isAuthorized) {
      console.warn(`[Admin API] Access forbidden: User ${clerkUserId} is not an active admin.`);
      return res.status(403).json({ error: 'Acceso prohibido: No tienes permisos de administrador' });
    }

    // 3. Dispatch action
    const { action, ...params } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Falta especificar la acción' });
    }

    console.log(`[Admin API] Executing action: ${action} for user ${clerkUserId}`);

    switch (action) {
      case 'verificarAdmin': {
        return res.status(200).json({ isAdmin: true });
      }

      case 'getDashboardStats': {
        const { data, error } = await supabaseAdmin.rpc('get_dashboard_stats');
        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'getReservacionesAdmin': {
        const { filtros = {} } = params;
        console.log('[Admin API] getReservacionesAdmin called with filters:', filtros);
        let query = supabaseAdmin
          .from('vista_reservaciones_admin')
          .select('*');

        if (filtros.estado && filtros.estado !== 'todas') {
          query = query.eq('estado', filtros.estado);
        }
        if (filtros.suite_slug) {
          query = query.eq('suite_slug', filtros.suite_slug);
        }
        if (filtros.fecha_desde) {
          query = query.gte('fecha_entrada', filtros.fecha_desde);
        }
        if (filtros.fecha_hasta) {
          query = query.lte('fecha_entrada', filtros.fecha_hasta);
        }
        if (filtros.busqueda) {
          query = query.or(
            `huesped_nombre.ilike.%${filtros.busqueda}%,` +
            `huesped_email.ilike.%${filtros.busqueda}%`
          );
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
          console.error('[Admin API] Database error fetching reservaciones:', error);
          throw error;
        }
        console.log(`[Admin API] getReservacionesAdmin returning ${data?.length || 0} rows`);
        return res.status(200).json(data);
      }

      case 'getReservacionAdmin': {
        const { id } = params;
        if (!id) {
          return res.status(400).json({ error: 'Falta el id de la reservación' });
        }
        const { data: reservacion, error: resError } = await supabaseAdmin
          .from('reservaciones')
          .select(`
            *,
            suite:suites(*)
          `)
          .eq('id', id)
          .single();

        if (resError) throw resError;

        const { data: history, error: histError } = await supabaseAdmin
          .from('reservaciones')
          .select(`
            id, 
            created_at, 
            fecha_entrada, 
            fecha_salida,
            estado, 
            precio_total, 
            adultos,
            suite:suites(nombre, tipo, imagen_hero_url)
          `)
          .eq('huesped_email', reservacion.huesped_email)
          .neq('id', id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (histError) console.error('Error fetching history:', histError);

        return res.status(200).json({ reservacion, history: history || [] });
      }

      case 'actualizarEstadoReservacion': {
        const { id, estado } = params;
        if (!id || !estado) {
          return res.status(400).json({ error: 'Faltan parámetros (id, estado)' });
        }
        const { data, error } = await supabaseAdmin
          .from('reservaciones')
          .update({ 
            estado,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'updateReservacion': {
        const { id, reservacionData } = params;
        if (!id || !reservacionData) {
          return res.status(400).json({ error: 'Faltan parámetros (id, reservacionData)' });
        }
        const { data, error } = await supabaseAdmin
          .from('reservaciones')
          .update({
            ...reservacionData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'bloquearFechas': {
        const { suiteId, fechaInicio, fechaFin, motivo } = params;
        if (!suiteId || !fechaInicio || !fechaFin || !motivo) {
          return res.status(400).json({ error: 'Faltan parámetros (suiteId, fechaInicio, fechaFin, motivo)' });
        }
        const { data, error } = await supabaseAdmin
          .from('disponibilidad_bloqueada')
          .insert({
            suite_id: suiteId,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            motivo
          })
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'deleteBloqueo': {
        const { id } = params;
        if (!id) {
          return res.status(400).json({ error: 'Falta el id del bloqueo' });
        }
        const { data, error } = await supabaseAdmin
          .from('disponibilidad_bloqueada')
          .delete()
          .eq('id', id)
          .select();

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'updateSuite': {
        const { suiteId, suiteData } = params;
        if (!suiteId || !suiteData) {
          return res.status(400).json({ error: 'Faltan parámetros (suiteId, suiteData)' });
        }
        const { data, error } = await supabaseAdmin
          .from('suites')
          .update({
            ...suiteData,
            updated_at: new Date().toISOString()
          })
          .eq('id', suiteId)
          .select();

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'insertTarifa': {
        const { tarifaData } = params;
        if (!tarifaData) {
          return res.status(400).json({ error: 'Falta tarifaData' });
        }
        const { data, error } = await supabaseAdmin
          .from('tarifas_temporada')
          .insert(tarifaData)
          .select()
          .single();

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'deleteTarifa': {
        const { id } = params;
        if (!id) {
          return res.status(400).json({ error: 'Falta el id de la tarifa' });
        }
        const { data, error } = await supabaseAdmin
          .from('tarifas_temporada')
          .delete()
          .eq('id', id)
          .select();

        if (error) throw error;
        return res.status(200).json(data);
      }

      case 'uploadImage': {
        const { filename, fileData, contentType } = params;
        if (!filename || !fileData) {
          return res.status(400).json({ error: 'Faltan parámetros (filename, fileData)' });
        }
        const buffer = Buffer.from(fileData, 'base64');
        const { data, error } = await supabaseAdmin.storage
          .from('suites')
          .upload(filename, buffer, {
            contentType: contentType || 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;

        // Return the public URL
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('suites')
          .getPublicUrl(filename);

        return res.status(200).json({ path: filename, publicUrl: publicUrlData.publicUrl });
      }

      case 'deleteImage': {
        const { path } = params;
        if (!path) {
          return res.status(400).json({ error: 'Falta el path de la imagen' });
        }
        const { data, error } = await supabaseAdmin.storage
          .from('suites')
          .remove([path]);

        if (error) throw error;
        return res.status(200).json(data);
      }

      default:
        return res.status(400).json({ error: `Acción desconocida: ${action}` });
    }
  } catch (err) {
    console.error(`[Admin API] Error running action ${req.body.action}:`, err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
