import React, { useState, useMemo } from 'react';
import { User } from '@/types/kinetix';
import { aiService } from '@/services/aiService';
import { storageService } from '@/services/storageService';
import { githubService } from '@/services/githubService';

export const AdminDashboard = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('system');
  const [ghConfig, setGhConfig] = useState({ token: '', owner: '', repo: 'kinetix-app', branch: 'main' });
  const [deployLogs, setDeployLogs] = useState([]);

  return (
    <div className="pt-24 px-6 text-white min-h-screen bg-[#050507]">
      <h1 className="text-4xl font-black italic mb-10 uppercase">Consola <span className="text-blue-500">Master v16</span></h1>
      <div className="bg-[#0F0F11] p-10 rounded-[40px] border border-blue-500/20 max-w-2xl">
         <h2 className="text-xl font-black mb-6 uppercase">Mirroring de ADN</h2>
         <input type="password" placeholder="GitHub Token" className="w-full bg-black border border-white/10 rounded-xl p-4 mb-4" value={ghConfig.token} onChange={e => setGhConfig({...ghConfig, token: e.target.value})} />
         <button className="w-full py-4 bg-blue-600 rounded-xl font-black uppercase text-xs" onClick={() => alert("Función recursiva habilitada")}>Sincronizar Producción</button>
         <div className="mt-6 bg-black p-4 rounded-xl text-[10px] font-mono text-blue-400 h-32 overflow-auto">
           {deployLogs.map((l, i) => <p key={i}>{l}</p>)}
         </div>
      </div>
      <button onClick={() => onNavigate('home')} className="mt-10 text-white/40 uppercase font-black text-[10px]">Cerrar Sesión</button>
    </div>
  );
};