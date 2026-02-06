
import React, { useMemo, useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { User, Workout } from '../../types/kinetix';

export const CoachHome: React.FC<{ onViewChange: (view: any) => void }> = ({ onViewChange }) => {
  const athletes = useMemo(() => storageService.getAthletes(), []);
  const templates = useMemo(() => storageService.getTemplates(), []);
  const exercises = useMemo(() => storageService.getExercises(), []);
  const storageStats = storageService.getStorageUsage();
  const [isClicking, setIsClicking] = useState(false);

  const handleAdminClick = () => {
    setIsClicking(true);
    setTimeout(() => {
        onViewChange('admin_dashboard');
        setIsClicking(false);
    }, 150);
  };

  return (
    <div className="pt-20 pb-32 px-4 md:px-6 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700">
      
      {/* HEADER TÁCTICO */}
      <div className="mb-10 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div className="space-y-1 md:space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
              <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Operaciones de Mando</p>
           </div>
           <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.9]">
              CUARTEL <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 block md:inline">GENERAL</span>
           </h1>
        </div>
        <div className="w-full md:w-auto text-left md:text-right flex flex-col items-start md:items-end gap-4 md:gap-6">
           <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full hidden md:block">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Kinetix Elite OS v6.8.9</p>
           </div>
           
           {/* BOTÓN CONSOLA MAESTRA - MEJORADO */}
           <button 
              onClick={handleAdminClick}
              className={`w-full md:w-auto relative group overflow-hidden px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] flex items-center justify-center gap-4 border animate-pulse hover:animate-none ${isClicking ? 'bg-white text-black scale-95' : 'bg-blue-600 text-white hover:bg-blue-500 border-blue-400/50'}`}
           >
              <span className={`text-xl ${isClicking ? 'animate-spin' : ''}`}>⚙️</span> 
              {isClicking ? 'CONECTANDO...' : 'CONSOLA MAESTRA (DEVOPS)'}
           </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 relative z-10">
         <div onClick={() => onViewChange('crm')} className="group relative bg-[#0F0F11]/80 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[35px] cursor-pointer transition-all active:scale-[0.98] overflow-hidden">
            <div className="flex justify-between items-start mb-4 md:mb-6">
               <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center text-2xl">👥</div>
            </div>
            <p className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-1">{athletes.length}</p>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Atletas</p>
         </div>

         <div onClick={() => onViewChange('manager')} className="group relative bg-[#0F0F11]/80 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[35px] cursor-pointer transition-all active:scale-[0.98] overflow-hidden">
            <div className="flex justify-between items-start mb-4 md:mb-6">
               <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl">📐</div>
            </div>
            <p className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-1">{templates.length}</p>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Protocolos</p>
         </div>

         <div onClick={() => onViewChange('library')} className="group relative bg-[#0F0F11]/80 backdrop-blur-xl border border-white/5 p-6 md:p-10 rounded-[35px] cursor-pointer transition-all active:scale-[0.98] overflow-hidden">
            <div className="flex justify-between items-start mb-4 md:mb-6">
               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">🔬</div>
            </div>
            <p className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-1">{exercises.length}</p>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Ejercicios</p>
         </div>

         <div className="relative bg-gradient-to-br from-[#1A1A1D] to-black border border-white/5 p-6 md:p-10 rounded-[35px] overflow-hidden">
            <div className="flex justify-between items-start mb-4 md:mb-6">
               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">💾</div>
            </div>
            <p className={`text-5xl md:text-6xl font-black italic tracking-tighter ${storageStats.percentage > 80 ? 'text-yellow-500' : 'text-green-500'}`}>{storageStats.percentage}%</p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Memoria</p>
         </div>
      </div>
    </div>
  );
};
