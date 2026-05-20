import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { sessionId, reservacionId } = req.body;
    if (!sessionId || !reservacionId) {
      return res.status(400).json({ error: 'Faltan parámetros obligatorios (sessionId, reservacionId)' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada en Stripe' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'El pago no ha sido completado' });
    }

    // Verify metadata match
    if (session.metadata.reservacion_id !== reservacionId) {
      return res.status(400).json({ error: 'El ID de reservación no coincide con los metadatos de pago' });
    }

    // Update reservation in DB using secure admin client
    const { data, error } = await supabaseAdmin
      .from('reservaciones')
      .update({ 
        estado: 'confirmada', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', reservacionId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, reservacion: data });
  } catch (err) {
    console.error('Error confirming payment:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
