import React, { useState } from 'react';
import { githubService } from '@/services/githubService';

export const AdminDashboard = ({ currentUser, onNavigate }) => {
  const [ghConfig, setGhConfig] = useState({ token: '', owner: '', repo: 'kinetix-app', branch: 'main' });
  const sync = async () => {
    if(!ghConfig.token) return alert('Token requerido');
    alert('Iniciando Sincronización Maestra v40...');
  };
  return (
    <div className="pt-24 px-6 text-white min-h-screen bg-[#050507] font-sans">
      <h1 className="text-4xl font-black uppercase italic text-blue-500 mb-10 tracking-tighter">DevOps Master</h1>
      <div className="bg-[#0F0F11] p-10 rounded-[40px] border border-blue-500/20 shadow-2xl">
         <h3 className="text-sm font-black uppercase mb-6 tracking-widest text-blue-400">Mirroring de ADN v40.0</h3>
         <input type="password" placeholder="GitHub Token" className="w-full bg-black border border-white/10 rounded-xl p-4 mb-4 text-white outline-none focus:border-blue-500" value={ghConfig.token} onChange={e => setGhConfig({...ghConfig, token: e.target.value})} />
         <button className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-500/10" onClick={sync}>Sincronizar Producción</button>
      </div>
      <button onClick={() => onNavigate('home')} className="mt-10 opacity-30 uppercase font-black text-[10px] tracking-widest">Desconectar</button>
    </div>
  );
};