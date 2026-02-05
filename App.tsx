import React, { useState, useEffect } from 'react';

export default function App() {
  const [role, setRole] = useState(null);
  const [view, setView] = useState('home');

  if (!role) return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 font-sans">
       <div className="text-center space-y-8 animate-in zoom-in duration-700">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter">Kinetix <span className="text-red-600">Elite</span></h1>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.5em]">Functional Zone OS v7.8.5</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
             <button onClick={() => setRole('client')} className="p-12 bg-white/5 border border-white/10 rounded-[40px] hover:bg-red-600 transition-all font-black uppercase italic text-xl">Atleta Elite</button>
             <button onClick={() => setRole('coach')} className="p-12 bg-white/5 border border-white/10 rounded-[40px] hover:bg-blue-600 transition-all font-black uppercase italic text-xl">Staff Coach</button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white p-10">
       <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Kinetix <span className={role === 'coach' ? 'text-blue-500' : 'text-red-600'}>{role}</span></h2>
          <button onClick={() => setRole(null)} className="text-[10px] font-black uppercase tracking-widest text-white/20">Salir</button>
       </header>
       <main className="max-w-4xl mx-auto py-20 text-center space-y-10">
          <div className="w-24 h-24 bg-white/5 rounded-[30px] flex items-center justify-center text-4xl mx-auto shadow-2xl animate-pulse">⚡</div>
          <h3 className="text-5xl font-black uppercase italic tracking-tighter">Sistema <span className="text-white/20">Sincronizado</span></h3>
          <p className="text-sm text-white/40 leading-relaxed max-w-lg mx-auto uppercase tracking-widest">Bienvenido a la plataforma de alto rendimiento. Todas las funciones de CRM, Calendario e IA están siendo desplegadas.</p>
       </main>
    </div>
  );
}