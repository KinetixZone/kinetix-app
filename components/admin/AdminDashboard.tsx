import React, { useState } from 'react';
import { githubService } from '@/services/githubService';

export const AdminDashboard = ({ currentUser, onNavigate }) => {
  const [ghConfig, setGhConfig] = useState({ token: '', owner: '', repo: 'kinetix-app', branch: 'main' });
  return (
    <div className="pt-24 px-6 text-white min-h-screen bg-[#050507] font-sans">
      <h1 className="text-4xl font-black uppercase italic italic">DevOps <span className="text-blue-500">Console</span></h1>
      <div className="mt-10 bg-[#0F0F11] p-10 rounded-[40px] border border-blue-500/20">
         <h3 className="text-sm font-black uppercase mb-6 tracking-widest">Mirroring Recursivo v19</h3>
         <input type="password" placeholder="GitHub Token" className="w-full bg-black border border-white/10 rounded-xl p-4 mb-4 text-white" value={ghConfig.token} onChange={e => setGhConfig({...ghConfig, token: e.target.value})} />
         <button className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500" onClick={() => alert('ADN Maestro Activo')}>Sincronizar Producción</button>
      </div>
      <button onClick={() => onNavigate('home')} className="mt-10 opacity-30 uppercase font-black text-[10px] tracking-widest">Desconectar</button>
    </div>
  );
};