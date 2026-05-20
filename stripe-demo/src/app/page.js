'use client';

import { useState } from 'react';

export default function Home() {
  const [dates, setDates] = useState({
    checkIn: '2026-05-24',
    checkOut: '2026-05-28'
  });
  const [email, setEmail] = useState('rodrigo@casadoro.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roomPricePerNight = 280;
  const roomName = "The Planter's Loft";

  // Calculate nights
  const calculateNights = () => {
    if (!dates.checkIn || !dates.checkOut) return 0;
    const start = new Date(dates.checkIn + 'T00:00:00');
    const end = new Date(dates.checkOut + 'T00:00:00');
    const diff = end - start;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const totalPrice = nights * roomPricePerNight;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, introduzca su dirección de correo electrónico.');
      return;
    }
    if (nights <= 0) {
      setError('La fecha de salida debe ser posterior a la fecha de entrada.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          totalPrice,
          checkIn: dates.checkIn,
          checkOut: dates.checkOut,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al crear la sesión de pago.');
      }

      // Redirect immediately to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      
      {/* ══ LEFT HERO COVER ══ */}
      <div className="w-full md:w-7/12 relative min-h-[40vh] md:min-h-screen flex flex-col justify-between p-8 md:p-16 overflow-hidden">
        {/* Background Image with Cover */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1400&auto=format&fit=crop"
            alt="The Planter's Loft Bedroom"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 ease-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0805]/20 via-[#0a0805]/70 to-[#0a0805]" />
        </div>

        {/* Logo and Brand Header */}
        <div className="relative z-10">
          <h1 className="font-garamond text-2xl md:text-3xl tracking-widest text-[#f5f0e8] uppercase font-light">
            Casa d'Oro
          </h1>
        </div>

        {/* Room Editorial Info */}
        <div className="relative z-10 mt-auto pt-24 md:pt-0">
          <span className="font-sans text-xs tracking-widest text-[#c9a84c] uppercase font-semibold">
            SUITE EXCLUSIVA
          </span>
          <h2 className="font-garamond text-4xl md:text-6xl tracking-tight text-[#f5f0e8] mt-2 mb-4 font-light">
            The Planter's Loft
          </h2>
          <p className="font-garamond italic text-lg md:text-xl text-[#c9a84c] font-light max-w-lg mb-8 leading-relaxed">
            "La elegancia de la sencillez en un entorno barefoot luxury inigualable..."
          </p>

          <div className="grid grid-cols-2 gap-8 max-w-sm border-t border-white/10 pt-6">
            <div>
              <span className="text-[10px] tracking-widest text-[#f5f0e8]/50 uppercase block">TARIFA CONTRATO</span>
              <span className="font-sans text-base text-[#f5f0e8] font-medium mt-1 block">USD {roomPricePerNight} / NOCHE</span>
            </div>
            <div>
              <span className="text-[10px] tracking-widest text-[#f5f0e8]/50 uppercase block">VISTA EXCLUSIVA</span>
              <span className="font-sans text-base text-[#f5f0e8] font-medium mt-1 block">Vistas al Mar & Piscina</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT BOOKING FLOW ══ */}
      <div className="w-full md:w-5/12 bg-[#0a0805] flex flex-col justify-center p-8 md:p-16 relative z-10">
        
        {loading && (
          <div className="absolute inset-0 bg-[#0a0805]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
            <div className="w-16 h-[1px] bg-[#c9a84c]/20 relative overflow-hidden mb-6">
              <div className="absolute inset-y-0 w-8 bg-[#c9a84c] shimmer-bg" />
            </div>
            <p className="font-garamond italic text-[#c9a84c] tracking-widest text-sm uppercase animate-pulse">
              Redirigiendo a Stripe Secure...
            </p>
          </div>
        )}

        <div className="w-full max-w-md mx-auto">
          {/* Section Header */}
          <div className="mb-10">
            <span className="text-[10px] tracking-widest text-[#c9a84c] uppercase font-semibold block mb-2">
              PASO 1 DE 2 • PASARELA STRIPE
            </span>
            <h3 className="font-garamond text-3xl md:text-4xl text-[#f5f0e8] font-light">
              Reservar Ahora
            </h3>
            <p className="text-xs text-[#f5f0e8]/60 mt-2">
              Complete su información de contacto y fechas de estancia para procesar el depósito seguro.
            </p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleCheckout} className="glass-panel p-6 md:p-8 rounded-none relative">
            {error && (
              <div className="mb-6 p-4 border border-red-500/20 bg-red-500/5 text-red-400 text-xs tracking-wide">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="luxury-field mb-6 pb-2">
              <label htmlFor="email" className="text-[9px] tracking-widest text-[#c9a84c] uppercase block font-semibold mb-1">
                Correo Electrónico del Huésped
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@concierge.com"
                className="w-full bg-transparent text-sm text-[#f5f0e8] placeholder-[#f5f0e8]/30 outline-none py-1 border-none focus:ring-0"
              />
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="luxury-field pb-2">
                <label htmlFor="checkIn" className="text-[9px] tracking-widest text-[#c9a84c] uppercase block font-semibold mb-1">
                  Llegada (Check-In)
                </label>
                <input
                  type="date"
                  id="checkIn"
                  required
                  value={dates.checkIn}
                  onChange={(e) => setDates(prev => ({ ...prev, checkIn: e.target.value }))}
                  className="w-full bg-transparent text-sm text-[#f5f0e8] outline-none py-1 border-none focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="luxury-field pb-2">
                <label htmlFor="checkOut" className="text-[9px] tracking-widest text-[#c9a84c] uppercase block font-semibold mb-1">
                  Salida (Check-Out)
                </label>
                <input
                  type="date"
                  id="checkOut"
                  required
                  value={dates.checkOut}
                  onChange={(e) => setDates(prev => ({ ...prev, checkOut: e.target.value }))}
                  className="w-full bg-transparent text-sm text-[#f5f0e8] outline-none py-1 border-none focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Breakdown Summary */}
            <div className="border-t border-white/5 pt-6 mb-8">
              <div className="flex justify-between items-center text-xs text-[#f5f0e8]/70 mb-2">
                <span>{roomName}</span>
                <span>USD {roomPricePerNight} / noche</span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#f5f0e8]/70 mb-4">
                <span>Estancia total</span>
                <span>{nights} {nights === 1 ? 'Noche' : 'Noches'}</span>
              </div>

              <div className="flex justify-between items-end border-t border-white/5 pt-4">
                <div>
                  <span className="text-[9px] tracking-widest text-[#c9a84c] uppercase block font-semibold">
                    TOTAL DEPÓSITO
                  </span>
                  <span className="text-xs text-[#f5f0e8]/45">Servicios & Tasas Incluidos</span>
                </div>
                <span className="font-garamond text-2xl text-[#c9a84c] font-light">
                  USD {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || nights <= 0}
              className={`w-full py-4 text-center gold-button ${loading || nights <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Procesando...' : 'Proceder al Pago'}
            </button>

            {/* Guarantee Note */}
            <span className="text-[9px] text-center text-[#f5f0e8]/40 tracking-wider block mt-4 uppercase">
              🔒 Transacción Segura Encriptada SSL de Stripe
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}
