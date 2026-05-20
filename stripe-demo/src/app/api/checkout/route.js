import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { roomName, totalPrice, checkIn, checkOut, email } = await req.json();

    if (!roomName || !totalPrice || !checkIn || !checkOut || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos para la reserva' },
        { status: 400, headers: corsHeaders }
      );
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
      success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}&roomName=${encodeURIComponent(roomName)}&checkIn=${checkIn}&checkOut=${checkOut}&totalPrice=${totalPrice}&email=${encodeURIComponent(email)}`,
      cancel_url: `${req.nextUrl.origin}/cancel?roomName=${encodeURIComponent(roomName)}`,
      metadata: {
        roomName,
        checkIn,
        checkOut,
        email,
        totalPrice,
      },
    });

    return NextResponse.json({ id: session.id, url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json(
      { error: error.message || 'Fallo al inicializar el pago de Stripe' },
      { status: 500, headers: corsHeaders }
    );
  }
}
