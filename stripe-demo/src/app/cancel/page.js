'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function CancelDetails() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get('roomName') || "The Planter's Loft";

  return (
    <div className="glass-panel p-8 md:p-12 max-w-md w-full text-center relative rounded-none">
      <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-8 bg-white/5">
        <svg className="w-6 h-6 text-[#f5f0e8]/80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>

      <span className="text-[10px] tracking-widest text-[#f5f0e8]/50 uppercase font-semibold block mb-2">
        PROCESO INTERRUMPIDO
      </span>
      <h2 className="font-garamond text-4xl text-[#f5f0e8] font-light mb-4">
        Pago Cancelado
      </h2>
      <p className="text-xs text-[#f5f0e8]/75 max-w-sm mx-auto mb-10 leading-relaxed">
        Su pago para la suite <span className="text-[#c9a84c] font-medium">{roomName}</span> no fue completado y su reserva sigue abierta. No se ha realizado ningún cargo en su tarjeta.
      </p>

      <div className="space-y-4">
        <a href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:5174'}/suites`} className="inline-block px-8 py-4 gold-button w-full text-center font-medium">
          Intentar de Nuevo
        </a>
        <a href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'http://localhost:5174'} className="inline-block px-8 py-4 gold-outline w-full text-center font-medium">
          Volver a las Suites
        </a>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#0a0805] flex items-center justify-center p-8 relative overflow-hidden">
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <div className="text-center font-garamond italic text-[#f5f0e8]/50 animate-pulse uppercase tracking-widest text-sm">
            Cargando...
          </div>
        }>
          <CancelDetails />
        </Suspense>
      </div>
    </div>
  );
}
