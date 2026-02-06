
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Workout } from '../../types/kinetix';
import { ProgressDashboard } from '../analytics/ProgressDashboard';
import { calendarService } from '../../services/calendarService';
import { storageService } from '../../services/storageService';
import { aiService } from '../../services/aiService'; 

const TechnicalChatModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
        { role: 'ai', text: 'Kinetix Ops v125.0 Online. Terminal Técnica.\n\nResuelvo dudas sobre biomecánica, técnica y uso de la app. No estoy autorizado para crear rutinas ni dietas.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);
        const response = await aiService.getTechnicalAdvice(userMsg);
        setMessages(prev => [...prev, { role: 'ai', text: response }]);
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom-10 md:fade-in">
            <div className="bg-[#0F0F11] w-full md:max-w-md h-[85vh] md:h-[600px] md:rounded-[32px] rounded-t-[32px] border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden relative">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0F0F11]">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                        <div>
                            <h3 className="text-sm font-black uppercase italic tracking-widest text-white">Kinetix Ops</h3>
                            <p className="text-[8px] font-black uppercase text-blue-400/50 tracking-widest">TECHNICAL & BIOMECHANICS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 text-white transition-colors">✕</button>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-gradient-to-b from-[#0F0F11] to-black">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-900/20 text-white border border-blue-900/40 rounded-br-none' : 'bg-[#1A1A1D] text-white/80 border border-white/5 rounded-bl-none'}`}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="bg-[#1A1A1D] px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1"><div className="w-1.5 h-1.5 bg-blue-500/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }} /><div className="w-1.5 h-1.5 bg-blue-500/30 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} /><div className="w-1.5 h-1.5 bg-blue-500/30 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /></div></div>}
                </div>
                <div className="p-4 bg-[#0F0F11] border-t border-white/5">
                    <p className="text-[8px] text-white/20 uppercase font-bold mb-2 text-center tracking-widest italic">Solo consultas técnicas de biomecánica o plataforma</p>
                    <div className="flex gap-2">
                        <input type="text" className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-600 outline-none placeholder-white/20" placeholder="Ej: ¿Cómo optimizar mi sentadilla?" value={input} onChange={e => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
                        <button onClick={handleSend} disabled={!input.trim() || isLoading} className="bg-blue-600 text-white w-12 rounded-xl flex items-center justify-center hover:bg-blue-500 transition-colors">➤</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface Props {
  user: User;
  currentWorkout: Workout;
  availableWorkouts: Workout[];
  onStartSession: (workout: Workout) => void;
  onLogout: () => void;
}

export const AthleteHome: React.FC<Props> = ({ user, currentWorkout, availableWorkouts, onStartSession, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'train' | 'progress' | 'profile'>('train');
  const [showPlanB, setShowPlanB] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const coachWhatsApp = "https://wa.me/525627303189";

  const isWorkoutEmpty = !currentWorkout || currentWorkout.id === 'empty-state' || currentWorkout.exercises.length === 0;

  const completionStatus = useMemo(() => {
      if (isWorkoutEmpty) return { isDone: false, label: '' };
      if (storageService.isSessionComplete(currentWorkout.id)) return { isDone: true, label: 'MISIÓN CUMPLIDA' };
      const todayStr = new Date().toISOString().split('T')[0];
      const hasLogsToday = storageService.getAllLogs().some(l => l.timestamp.startsWith(todayStr));
      return { isDone: hasLogsToday, label: hasLogsToday ? 'OPERACIÓN FINALIZADA' : '' };
  }, [currentWorkout, isWorkoutEmpty]);

  const tomorrowIntel = useMemo(() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tplId = calendarService.getScheduledSession(tomorrow, user.id);
      if (!tplId) return null;

      const workout = storageService.getWorkoutById(tplId);
      if (!workout) return null;

      let focus = "Operación Variada";
      let tip = "Carga estándar de combustible.";
      
      const names = workout.exercises.map(e => e.name.toLowerCase());
      const hasLegs = names.some(n => n.includes('sentadilla') || n.includes('leg') || n.includes('pierna') || n.includes('prensa'));
      const hasHIIT = workout.exercises.some(e => e.method === 'tabata' || e.method === 'emom');
      const hasPower = workout.exercises.some(e => e.method === 'ahap');

      if (hasLegs) {
          focus = "Tren Inferior";
          tip = "Lleva calzado plano o estable.";
      } else if (hasHIIT) {
          focus = "Metabólico / HIIT";
          tip = "Hidratación máxima requerida.";
      } else if (hasPower) {
          focus = "Fuerza Máxima";
          tip = "Mentalidad de récord. Descansa bien.";
      }

      return { title: workout.publicTitle || workout.name, focus, tip };
  }, [user.id]);

  const weeklyHorizon = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMon = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diffToMon));
    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const tplId = calendarService.getScheduledSession(d, user.id);
        const hasLogs = storageService.getAllLogs().some(l => l.timestamp.startsWith(dateStr));
        week.push({ dayName: ['D','L','M','X','J','V','S'][d.getDay()], dayNum: d.getDate(), isToday: dateStr === new Date().toISOString().split('T')[0], hasSession: !!tplId, isDone: hasLogs });
    }
    return week;
  }, [user.id, completionStatus.isDone]);

  const systemConfig = storageService.getSystemConfig();

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <main className="max-w-md mx-auto pt-8 px-6 pb-32">
         
         {activeTab === 'train' && (
             <div className="space-y-8 animate-in slide-in-from-left-4">
                 <div className="flex justify-between items-end pb-4 border-b border-white/5">
                     <div>
                         <p className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1">Status: Online</p>
                         <h1 className="text-3xl font-black uppercase italic tracking-tighter">HOLA, {user.name.split(' ')[0]}</h1>
                     </div>
                     <div className="text-right flex flex-col items-end">
                         <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                            <span className="text-lg">🔥</span>
                         </div>
                         <p className="text-xs font-black text-white">{user.streak || 0} DÍAS</p>
                     </div>
                 </div>

                 <div className="flex justify-between items-center bg-[#151518]/50 backdrop-blur-xl p-4 rounded-[28px] border border-white/5 gap-2">
                    {weeklyHorizon.map((d, i) => (
                        <div key={i} className={`flex-1 h-[65px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${d.isToday ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-105' : 'bg-transparent text-white/30'}`}>
                            <span className="text-[8px] font-black uppercase tracking-widest">{d.dayName}</span>
                            <span className="text-sm font-black">{d.dayNum}</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${d.isDone ? 'bg-green-500' : d.hasSession ? 'bg-red-900' : 'bg-white/5'}`} />
                        </div>
                    ))}
                 </div>

                 <div>
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                        <span className="w-4 h-[1px] bg-red-600" />
                        {completionStatus.isDone ? 'REPORTE DE OPERACIÓN' : 'MISIÓN TÁCTICA'}
                     </p>
                     
                     {user.isActive ? (
                         <div className={`group relative rounded-[40px] p-10 border transition-all duration-700 overflow-hidden ${completionStatus.isDone ? 'bg-[#101012] border-green-600/30' : isWorkoutEmpty ? 'bg-[#0F0F11] border-white/5' : 'bg-[#0F0F11] border-white/10 hover:border-red-600/50 shadow-2xl'}`}>
                             {!completionStatus.isDone && !isWorkoutEmpty && (
                                 <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600/40 blur-sm animate-[scan_3s_linear_infinite]" />
                             )}
                             <div className="relative z-10">
                                 <div className="flex justify-between items-start mb-6">
                                     <span className={`text-[8px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-full border ${completionStatus.isDone ? 'bg-green-600/10 text-green-500 border-green-500/20' : isWorkoutEmpty ? 'bg-white/5 text-white/20 border-white/5' : 'bg-red-600/10 text-red-600 border-red-600/20'}`}>
                                         {completionStatus.isDone ? 'COMPLETADO' : isWorkoutEmpty ? 'SIN ASIGNAR' : 'PENDIENTE'}
                                     </span>
                                     <span className="text-2xl">{isWorkoutEmpty ? '📡' : '⚡'}</span>
                                 </div>
                                 <h2 className={`text-4xl font-black uppercase italic tracking-tighter leading-tight mb-4 ${completionStatus.isDone ? 'text-white/40' : 'text-white'}`}>
                                     {isWorkoutEmpty ? 'DESCANSO O SESIÓN LIBRE' : (currentWorkout.publicTitle || currentWorkout.name)}
                                 </h2>
                                 {!completionStatus.isDone && !isWorkoutEmpty ? (
                                     <>
                                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-10">
                                            {currentWorkout.exercises.length} BLOQUES OPERATIVOS
                                        </p>
                                        <button 
                                            onClick={() => onStartSession(currentWorkout)}
                                            className="w-full py-6 bg-red-600 text-white hover:bg-red-500 rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all active:scale-95"
                                        >
                                            INICIAR DESPLIEGUE →
                                        </button>
                                     </>
                                 ) : isWorkoutEmpty && !completionStatus.isDone ? (
                                     <div className="space-y-6">
                                         <p className="text-xs text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                                            No tienes una rutina agendada para hoy. Puedes cargar una sesión manual o tu Plan B.
                                         </p>
                                         <div className="grid grid-cols-1 gap-3">
                                            <button onClick={() => setShowPlanB(!showPlanB)} className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all">
                                                {showPlanB ? 'OCULTAR OPCIONES' : 'CARGAR SESIÓN MANUAL'}
                                            </button>
                                            {showPlanB && (
                                                <div className="space-y-3 animate-in zoom-in-95">
                                                    <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
                                                        <p className="text-[8px] text-blue-400 font-black uppercase mb-3">Protocolos Globales</p>
                                                        <div className="space-y-2">
                                                            {availableWorkouts.map(w => (
                                                                <button key={w.id} onClick={() => onStartSession(w)} className="w-full py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                                                                    {w.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="py-6 text-center border-t border-white/5 mt-4">
                                         <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Sesión Finalizada con Éxito</p>
                                     </div>
                                 )}
                             </div>
                         </div>
                     ) : (
                         <div className="bg-[#0F0F11] border border-red-600/30 rounded-[40px] p-12 text-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-red-900/5 animate-pulse" />
                             <span className="text-5xl mb-6 block relative z-10">🔒</span>
                             <h3 className="text-2xl font-black uppercase italic text-red-600 relative z-10">Acceso Denegado</h3>
                             <p className="text-[10px] text-white/40 uppercase font-bold mt-4 leading-relaxed relative z-10">Tu ciclo operativo ha expirado.</p>
                             <a 
                                href={coachWhatsApp} 
                                target="_blank" 
                                rel="noreferrer"
                                className="mt-10 block w-full py-5 bg-[#25D366] text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 transition-transform relative z-10"
                             >
                                SOLICITAR REACTIVACIÓN
                             </a>
                         </div>
                     )}
                 </div>

                 {tomorrowIntel && user.isActive && (
                     <div className="bg-[#0F0F11] border border-white/5 rounded-[32px] p-6 animate-in slide-in-from-bottom-2">
                         <div className="flex items-center gap-3 mb-4">
                             <span className="text-xl">🔭</span>
                             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Reconocimiento de Mañana</p>
                         </div>
                         <h4 className="text-lg font-black uppercase italic text-white leading-tight">{tomorrowIntel.title}</h4>
                         <div className="mt-4 flex flex-col gap-2">
                             <div className="flex items-center gap-2">
                                 <span className="text-[9px] font-black uppercase bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Foco: {tomorrowIntel.focus}</span>
                             </div>
                             <p className="text-[10px] text-white/60 font-bold leading-relaxed">💡 TIP TÁCTICO: {tomorrowIntel.tip}</p>
                         </div>
                     </div>
                 )}

                 {systemConfig.enableAI && user.isActive && (
                     <button onClick={() => setShowChat(true)} className="w-full bg-[#151518] border border-blue-500/10 hover:border-blue-500/40 p-5 rounded-[28px] flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 animate-pulse">📡</div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Kinetix Ops Support</p>
                                <p className="text-[8px] text-blue-400/50 uppercase font-bold">Asistencia Bio-Técnica</p>
                            </div>
                        </div>
                        <span className="text-blue-500/20 group-hover:text-blue-400">CONNECT</span>
                     </button>
                 )}
             </div>
         )}

         {activeTab === 'progress' && <ProgressDashboard />}
         
         {activeTab === 'profile' && (
             <div className="pb-28 animate-in fade-in space-y-6">
                 <div className="flex flex-col items-center pt-10">
                     <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 via-black to-blue-900 border-8 border-white/5 flex items-center justify-center text-5xl font-black shadow-2xl mb-6">{user.name.charAt(0)}</div>
                     <h2 className="text-3xl font-black uppercase italic tracking-tighter">{user.name}</h2>
                     <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-2">{user.level} // {user.goal}</p>
                 </div>
                 <div className="bg-[#0F0F11] border border-white/5 rounded-[32px] p-6 space-y-4">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest text-center">Canal de Mando</p>
                    <a 
                        href={coachWhatsApp} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full py-5 bg-white/5 border border-white/10 hover:bg-white hover:text-black flex items-center justify-center gap-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                    >
                        <span>💬</span> SOPORTE DE CAMPO
                    </a>
                    <button onClick={onLogout} className="w-full py-5 bg-red-900/10 text-red-600 border border-red-600/20 rounded-2xl text-[10px] font-black uppercase tracking-widest">DESCONECTAR TERMINAL</button>
                 </div>
             </div>
         )}
      </main>
      <nav className="fixed bottom-8 left-8 right-8 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 z-50 flex justify-between items-center px-10 shadow-2xl ring-1 ring-white/5">
            <button onClick={() => setActiveTab('train')} className={`p-4 rounded-full transition-all duration-500 ${activeTab === 'train' ? 'bg-red-600 text-white shadow-xl -translate-y-4' : 'text-white/30 hover:text-white'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3L4 14h7v7l9-11h-7z"/></svg>
            </button>
            <button onClick={() => setActiveTab('progress')} className={`p-4 rounded-full transition-all duration-500 ${activeTab === 'progress' ? 'bg-red-600 text-white shadow-xl -translate-y-4' : 'text-white/30 hover:text-white'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`p-4 rounded-full transition-all duration-500 ${activeTab === 'profile' ? 'bg-red-600 text-white shadow-xl -translate-y-4' : 'text-white/30 hover:text-white'}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </button>
      </nav>
      {showChat && <TechnicalChatModal onClose={() => setShowChat(false)} />}
      <style>{`
        @keyframes scan {
            0% { top: 0; opacity: 0; }
            50% { opacity: 0.5; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
