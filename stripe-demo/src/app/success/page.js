'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessDetails() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('roomName') || "The Planter's Loft";
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const totalPrice = searchParams.get('totalPrice') || '0';
  const email = searchParams.get('email') || '';
  const sessionId = searchParams.get('session_id') || '';

  // Format check-in/out displays
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel p-8 md:p-12 max-w-xl w-full text-center relative rounded-none gold-glow">
      <div className="w-16 h-16 rounded-full border border-[#c9a84c] flex items-center justify-center mx-auto mb-8 bg-[#c9a84c]/5">
        <svg className="w-6 h-6 text-[#c9a84c]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
        </svg>
      </div>

      <span className="text-[10px] tracking-widest text-[#c9a84c] uppercase font-semibold block mb-2">
        PAGO CONFIRMADO CON ÉXITO
      </span>
      <h2 className="font-garamond text-4xl text-[#f5f0e8] font-light mb-4">
        ¡Estancia Confirmada!
      </h2>
      <p className="text-xs text-[#f5f0e8]/70 max-w-md mx-auto mb-10 leading-relaxed">
        Agradecemos su reserva. Hemos enviado un correo electrónico de confirmación con los detalles de su conserjería exclusiva y su código de acceso concierge a:
        <span className="block text-[#c9a84c] font-medium mt-2 text-sm">{email}</span>
      </p>

      {/* Booking summary table */}
      <div className="border-t border-b border-white/10 py-6 mb-10 text-left text-xs space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[#f5f0e8]/50 uppercase tracking-widest text-[9px] font-semibold">Habitación</span>
          <span className="text-[#f5f0e8] font-medium">{roomName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#f5f0e8]/50 uppercase tracking-widest text-[9px] font-semibold">Llegada (Check-in)</span>
          <span className="text-[#f5f0e8] font-medium">{formatDate(checkIn)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#f5f0e8]/50 uppercase tracking-widest text-[9px] font-semibold">Salida (Check-out)</span>
          <span className="text-[#f5f0e8] font-medium">{formatDate(checkOut)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#f5f0e8]/50 uppercase tracking-widest text-[9px] font-semibold">Monto Pagado</span>
          <span className="text-[#c9a84c] font-medium text-sm">USD {parseFloat(totalPrice).toLocaleString()}</span>
        </div>
        {sessionId && (
          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[#f5f0e8]/40 uppercase tracking-widest text-[8px]">ID Transacción</span>
            <span className="text-[#f5f0e8]/45 text-[9px] truncate max-w-[220px] font-mono">{sessionId}</span>
          </div>
        )}
      </div>

      <a href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:5174'} className="inline-block px-8 py-4 gold-outline w-full text-center hover:opacity-90">
        Volver a Casa d'Oro
      </a>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0805] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c9a84c]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <div className="text-center font-garamond italic text-[#c9a84c] animate-pulse uppercase tracking-widest text-sm">
            Cargando confirmación...
          </div>
        }>
          <SuccessDetails />
        </Suspense>
      </div>
    </div>
  );
}
