import React, { useState, useEffect } from 'react';
import { User, UserRole, Goal, UserLevel } from './types/kinetix';

export default function App() {
  const [role, setRole] = useState(null);
  const [view, setView] = useState('home');

  if (!role) return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 bg-red-600 blur-[150px] rounded-full translate-x-[-50%] translate-y-[-50%]" />
       <div className="text-center space-y-12 animate-in zoom-in duration-1000 relative z-10">
          <div className="space-y-4">
             <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">Kinetix <span className="text-red-600">Elite</span></h1>
             <p className="text-[10px] md:text-[12px] text-white/30 uppercase tracking-[0.6em] font-bold">Functional Zone OS v8.0.0</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
             <button onClick={() => setRole('client')} className="group relative p-12 bg-white/5 border border-white/10 rounded-[45px] hover:bg-red-600 transition-all font-black uppercase italic text-2xl overflow-hidden shadow-2xl">
                <span className="relative z-10">Atleta Elite</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </button>
             <button onClick={() => setRole('coach')} className="group relative p-12 bg-white/5 border border-white/10 rounded-[45px] hover:bg-blue-600 transition-all font-black uppercase italic text-2xl overflow-hidden shadow-2xl">
                <span className="relative z-10">Staff Coach</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </button>
          </div>
          <p className="text-[9px] text-white/20 uppercase tracking-widest pt-10">Sinaloa High Performance Unit — Master Node</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white p-8 md:p-12 font-sans animate-in fade-in duration-500">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 border-b border-white/5 pb-8 gap-6">
          <div>
             <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Kinetix <span className={role === 'coach' ? 'text-blue-500' : 'text-red-600'}>{role}</span></h2>
             <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1 font-bold">Terminal de Producción Activa</p>
          </div>
          <button onClick={() => setRole(null)} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Cerrar Sesión</button>
       </header>
       
       <main className="max-w-6xl mx-auto py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-[#0F0F11] p-10 rounded-[40px] border border-white/5 space-y-4 hover:border-white/20 transition-all group">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📊</div>
                <h3 className="text-xl font-black uppercase italic">Dashboard</h3>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">Control total de métricas y rendimiento en tiempo real.</p>
             </div>
             <div className="bg-[#0F0F11] p-10 rounded-[40px] border border-white/5 space-y-4 hover:border-white/20 transition-all group">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📅</div>
                <h3 className="text-xl font-black uppercase italic">Calendario</h3>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">Gestión de sesiones y programación del mesociclo.</p>
             </div>
             <div className="bg-[#0F0F11] p-10 rounded-[40px] border border-white/5 space-y-4 hover:border-white/20 transition-all group">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🦾</div>
                <h3 className="text-xl font-black uppercase italic">Entrenamiento</h3>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">Ejecución táctica de protocolos con tracking avanzado.</p>
             </div>
          </div>
          
          <div className="mt-20 p-12 bg-white/[0.02] border border-white/5 rounded-[50px] text-center space-y-6">
             <h4 className="text-3xl font-black uppercase italic tracking-tight">Sincronización de Datos <span className="text-red-600">Cloud</span></h4>
             <p className="text-sm text-white/40 max-w-2xl mx-auto leading-relaxed uppercase tracking-[0.2em]">El sistema está operando sobre el núcleo maestro sincronizado con GitHub. Todas las funciones de CRM e IA están siendo vinculadas desde el repositorio oficial.</p>
             <div className="flex justify-center gap-4 pt-4">
                <div className="px-4 py-1 bg-green-500/10 border border-green-500/20 rounded-md text-[9px] font-black text-green-500 uppercase">System Online</div>
                <div className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md text-[9px] font-black text-blue-500 uppercase">Git Connected</div>
             </div>
          </div>
       </main>
    </div>
  );
}