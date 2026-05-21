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
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
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

  const clerkUserId = payload.sub;
  const userEmail = payload.email || (payload.emails && payload.emails[0]);

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Falta el ID de reservación' });
  }

  try {
    // 2. Fetch reservation to verify ownership
    const { data: reservacion, error: fetchError } = await supabaseAdmin
      .from('reservaciones')
      .select('clerk_user_id, huesped_email')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!reservacion) {
      return res.status(404).json({ error: 'Reservación no encontrada' });
    }

    // 3. Verify ownership: must match clerkUserId or email
    const isOwner = (reservacion.clerk_user_id === clerkUserId) || 
                    (reservacion.huesped_email && reservacion.huesped_email === userEmail);
    
    if (!isOwner) {
      return res.status(403).json({ error: 'No autorizado: Esta reservación no te pertenece' });
    }

    // 4. Update status to 'cancelada'
    const { data, error } = await supabaseAdmin
      .from('reservaciones')
      .update({ 
        estado: 'cancelada', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, reservacion: data });
  } catch (err) {
    console.error('Error in cancel-reservation handler:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
