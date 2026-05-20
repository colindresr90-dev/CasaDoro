import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey);

export default async function handler(req, res) {
  // CORS Headers for safety
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { roomName, totalPrice, checkIn, checkOut, email, metadata } = req.body;

    if (!roomName || !totalPrice || !checkIn || !checkOut || !email) {
      return res.status(400).json({ error: 'Faltan campos requeridos para la reserva' });
    }

    const amountInCents = Math.round(parseFloat(totalPrice) * 100);

    // Dynamic high-res image corresponding to the luxury room name
    let imageUrl = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop';
    if (roomName.toLowerCase().includes('loft') || roomName.toLowerCase().includes('planter')) {
      imageUrl = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop';
    } else if (roomName.toLowerCase().includes('penthouse') || roomName.toLowerCase().includes('master')) {
      imageUrl = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Reserva: ${roomName}`,
              description: `Estancia Exclusiva en Casa d'Oro • Check-in: ${checkIn} • Check-out: ${checkOut}`,
              images: [imageUrl],
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&roomName=${encodeURIComponent(roomName)}&checkIn=${checkIn}&checkOut=${checkOut}&totalPrice=${totalPrice}&email=${encodeURIComponent(email)}&reservacion_id=${metadata?.reservacion_id || ''}`,
      cancel_url: `${req.headers.origin}/cancel?roomName=${encodeURIComponent(roomName)}`,
      metadata: {
        roomName,
        checkIn,
        checkOut,
        email,
        totalPrice,
        ...(metadata || {})
      },
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return res.status(500).json({ error: error.message || 'Fallo al inicializar el pago de Stripe' });
  }
}
