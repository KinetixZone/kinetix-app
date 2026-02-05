import React, { useState, useEffect } from 'react';

// VERSIÓN MONOLÍTICA PARA DESPLIEGUE RÁPIDO
export default function App() {
  return (
    <div className="min-h-screen bg-[#050507] text-white p-10 flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Kinetix <span className="text-red-600">Elite</span></h1>
      <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] mb-12">SISTEMA DE ALTO RENDIMIENTO ONLINE</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-[#0F0F11] p-10 rounded-[40px] border border-white/5">
           <span className="text-4xl mb-4 block">🏋️</span>
           <h3 className="text-xl font-black uppercase italic">Módulo Atleta</h3>
           <p className="text-[10px] text-white/20 mt-2">Seguimiento de Sesiones</p>
        </div>
        <div className="bg-[#0F0F11] p-10 rounded-[40px] border border-white/5">
           <span className="text-4xl mb-4 block">🧢</span>
           <h3 className="text-xl font-black uppercase italic">Módulo Coach</h3>
           <p className="text-[10px] text-white/20 mt-2">Gestión de Protocolos</p>
        </div>
      </div>
      <div className="mt-20 p-6 bg-red-600/10 border border-red-600/20 rounded-2xl">
         <p className="text-xs font-bold text-red-500 uppercase">Aviso de Producción</p>
         <p className="text-[9px] text-white/40 mt-1 uppercase tracking-widest">El sistema está sincronizado con el repositorio maestro de GitHub.</p>
      </div>
    </div>
  );
}