import React, { useState, useEffect } from 'react';

export default function App() {
  const [role, setRole] = useState(null);
  if (!role) return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-10 font-sans">
      <h1 className="text-7xl font-black italic uppercase tracking-tighter mb-12">Kinetix <span className="text-red-600">Elite</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button onClick={() => setRole('client')} className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:bg-red-600 transition-all font-black uppercase italic text-xl">Atleta</button>
        <button onClick={() => setRole('coach')} className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:bg-blue-600 transition-all font-black uppercase italic text-xl">Coach</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center">
      <h2 className="text-4xl font-black uppercase italic">Bienvenido {role === 'coach' ? 'Coach' : 'Atleta'}</h2>
      <p className="mt-4 text-white/40 uppercase tracking-widest text-xs">Sincronización de Producción Activa</p>
      <button onClick={() => setRole(null)} className="mt-10 text-[10px] font-black uppercase tracking-widest text-white/20">Cambiar Perfil</button>
    </div>
  );
}