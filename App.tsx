import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';

export default function App() {
  const [user, setUser] = useState(storageService.getUser());
  const [view, setView] = useState('home');

  if (!user) return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-7xl font-black italic uppercase tracking-tighter mb-12 animate-pulse">Kinetix <span className="text-red-600">Elite</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
        <button onClick={() => { const u = { id: '1', name: 'Atleta', role: 'client' }; storageService.saveUser(u); setUser(u); }} className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:bg-red-600 transition-all font-black uppercase italic text-xl">Atleta</button>
        <button onClick={() => { const u = { id: '2', name: 'Coach', role: 'coach' }; storageService.saveUser(u); setUser(u); }} className="p-10 bg-white/5 border border-white/10 rounded-[40px] hover:bg-blue-600 transition-all font-black uppercase italic text-xl">Coach</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white p-8">
      <header className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
        <h2 className="text-3xl font-black italic uppercase">Kinetix <span className="text-red-600">{user.role}</span></h2>
        <button onClick={() => { storageService.logout(); setUser(null); }} className="text-[10px] font-black uppercase tracking-widest opacity-30">Cerrar Sesión</button>
      </header>
      <main className="max-w-4xl mx-auto py-20 text-center space-y-8">
        <div className="text-6xl mb-6">⚙️</div>
        <h1 className="text-5xl font-black uppercase italic">Sistema en Producción</h1>
        <p className="text-white/40 uppercase tracking-widest text-xs">Sincronización de ADN Maestro v8.5.0 Completada</p>
        <div className="grid grid-cols-3 gap-4 pt-10">
           <div className="p-6 bg-white/5 rounded-3xl border border-white/5">CRM</div>
           <div className="p-6 bg-white/5 rounded-3xl border border-white/5">PLANNER</div>
           <div className="p-6 bg-white/5 rounded-3xl border border-white/5">IA CORE</div>
        </div>
      </main>
    </div>
  );
}