import React, { useState, useEffect, useMemo } from 'react';
import { Workout, WorkoutExercise, Exercise, User } from '../../types/kinetix';
import { storageService, AiBlueprint } from '../../services/storageService';
import { calendarService } from '../../services/calendarService';
import { ExerciseBlockEditor } from './ExerciseBlockEditor';
import { aiService } from '../../services/aiService';

const AiGeneratorModal: React.FC<{ onClose: () => void; onGenerate: (prompt: string) => void; isLoading: boolean }> = ({ onClose, onGenerate, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [tab, setTab] = useState<'blueprints' | 'history'>('blueprints');
    const [isSaving, setIsSaving] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    // DIAGNÓSTICO EN MODAL: Verificar si la IA está realmente activa
    const isAiOnline = aiService.isConfigured;

    const [blueprints, setBlueprints] = useState<AiBlueprint[]>([]);
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        setBlueprints(storageService.getAiBlueprints());
        setHistory(storageService.getAiPrompts());
    }, []);

    const handleSaveBlueprint = () => {
        if (!prompt.trim() || !newTitle.trim()) return;
        const newBp: AiBlueprint = {
            id: `bp-${Date.now()}`,
            title: newTitle,
            prompt: prompt,
            tags: ['Custom'],
            dateCreated: new Date().toISOString()
        };
        storageService.saveAiBlueprint(newBp);
        setBlueprints(storageService.getAiBlueprints());
        setIsSaving(false);
        setNewTitle('');
    };

    const handleDeleteBlueprint = (id: string) => {
        if (window.confirm("¿Eliminar Blueprint permanentemente?")) {
            storageService.deleteAiBlueprint(id);
            setBlueprints(storageService.getAiBlueprints());
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in zoom-in-95">
             <div className={`bg-[#0F0F11] w-full max-w-5xl h-[85vh] md:h-[80vh] rounded-[40px] border p-0 shadow-2xl flex flex-col md:flex-row relative overflow-hidden ${isAiOnline ? 'border-white/10' : 'border-red-600/30'}`}>
                {/* DECORATIVE BG */}
                <div className={`absolute -top-20 -right-20 p-40 blur-[150px] pointer-events-none ${isAiOnline ? 'bg-purple-600/10' : 'bg-red-600/10'}`} />

                {/* LEFT: COMPOSER (Main Interaction Area) */}
                <div className="flex-[3] flex flex-col p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/5 relative z-10 bg-gradient-to-b from-[#0F0F11] to-black h-1/2 md:h-auto">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">
                                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">Architect</span>
                                </h2>
                                {!isAiOnline && (
                                    <span className="px-2 py-1 rounded bg-red-600 text-white text-[8px] font-black uppercase tracking-widest animate-pulse">
                                        OFFLINE MODE
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Protocol Generator v4.0</p>
                        </div>
                        {/* Mobile Close Button */}
                        <button onClick={onClose} className="md:hidden text-white/40 hover:text-white text-xl p-2">✕</button>
                    </div>

                    {!isAiOnline && (
                        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
                            <p className="text-[9px] font-bold text-red-400 uppercase tracking-wide">
                                ⚠️ AVISO DE AUDITORÍA: Faltan credenciales
                            </p>
                            <p className="text-[10px] text-white/60 leading-tight mt-1">
                                La API Key no está configurada en Vercel. El sistema generará una rutina de demostración (Simulación) sin importar tu prompt.
                            </p>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <textarea 
                            className="flex-1 w-full bg-[#151518] border border-white/10 rounded-3xl p-6 text-white font-medium outline-none focus:border-purple-500 transition-colors resize-none text-sm leading-relaxed placeholder-white/20 custom-scrollbar shadow-inner"
                            placeholder={isAiOnline ? "Describe el objetivo táctico de la sesión (Ej: 'Pierna fuerza máxima 5x5')..." : "MODO SIMULACIÓN: Escribe cualquier cosa, recibirás una rutina demo..."}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            disabled={isLoading}
                        />
                        
                        <div className="flex gap-3 items-center pt-2">
                            {isSaving ? (
                                <div className="flex-1 flex gap-2 animate-in slide-in-from-bottom-2 items-center bg-white/5 p-2 rounded-2xl border border-white/10">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-transparent px-2 text-xs text-white outline-none font-bold placeholder-white/30"
                                        placeholder="Nombre..."
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                        autoFocus
                                    />
                                    <button onClick={handleSaveBlueprint} className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-lg text-white hover:scale-105 transition-transform">✓</button>
                                    <button onClick={() => setIsSaving(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-white hover:bg-white/20">✕</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsSaving(true)} 
                                    disabled={!prompt.trim()}
                                    className="px-4 md:px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                    <span>💾</span> <span className="hidden md:inline">Guardar</span>
                                </button>
                            )}
                            
                            <button 
                                onClick={() => {
                                    storageService.saveAiPrompt(prompt);
                                    onGenerate(prompt);
                                }}
                                disabled={!prompt.trim() || isLoading}
                                className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-3 ${isLoading ? 'bg-purple-900/50 text-white/50 cursor-wait' : isAiOnline ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:scale-[1.02] shadow-purple-500/20' : 'bg-red-900 text-red-200 hover:bg-red-800'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="animate-spin">⚙️</span> <span className="hidden md:inline">Procesando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{isAiOnline ? '⚡ EJECUTAR' : '⚠️ SIMULAR (DEMO)'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: LIBRARY (Blueprints & History) */}
                <div className="flex-[2] bg-[#08080A] flex flex-col relative z-10 border-l border-white/5 h-1/2 md:h-auto">
                    <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-[#0F0F11] shrink-0">
                        <div className="flex gap-4">
                            <button onClick={() => setTab('blueprints')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${tab === 'blueprints' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white'}`}>Blueprints</button>
                            <button onClick={() => setTab('history')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${tab === 'history' ? 'text-white border-b border-white' : 'text-white/30 hover:text-white'}`}>Historial</button>
                        </div>
                        <button onClick={onClose} className="hidden md:block text-white/20 hover:text-white transition-colors text-xl">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-[#08080A]">
                        {tab === 'blueprints' && (
                            <div className="space-y-3">
                                {blueprints.map((bp) => (
                                    <div 
                                        key={bp.id}
                                        onClick={() => { setPrompt(bp.prompt); if(navigator.vibrate) navigator.vibrate(20); }}
                                        className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 cursor-pointer transition-all active:scale-95"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">{bp.title}</h4>
                                            {/* Prevent Delete Click Propagation */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteBlueprint(bp.id); }}
                                                className="text-[10px] text-white/10 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-white/40 line-clamp-2 leading-relaxed font-medium">{bp.prompt}</p>
                                        <div className="flex gap-1 mt-3">
                                            {bp.tags.map(t => <span key={t} className="text-[7px] font-black uppercase bg-black px-2 py-1 rounded text-white/30 border border-white/5">{t}</span>)}
                                        </div>
                                    </div>
                                ))}
                                {blueprints.length === 0 && <div className="text-center text-[10px] text-white/20 py-10">No hay blueprints guardados</div>}
                            </div>
                        )}

                        {tab === 'history' && (
                            <div className="space-y-3">
                                {history.map((h, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => setPrompt(h)}
                                        className="p-4 rounded-2xl bg-black border border-white/5 hover:border-white/20 cursor-pointer transition-all group"
                                    >
                                        <p className="text-[10px] text-white/60 line-clamp-3 leading-relaxed group-hover:text-white transition-colors">{h}</p>
                                        <p className="text-[8px] text-white/20 mt-2 text-right">Reciente</p>
                                    </div>
                                ))}
                                {history.length === 0 && <div className="text-center text-[10px] text-white/20 py-10">Sin historial reciente</div>}
                            </div>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

export const WorkoutManager: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor' | 'assign'>('list');
  const [templates, setTemplates] = useState<Workout[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Workout | null>(null);
  
  const [assignTarget, setAssignTarget] = useState<Workout | null>(null);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  
  const [projConfig, setProjConfig] = useState({
    startDate: new Date().toISOString().split('T')[0],
    weeks: 4,
    days: [1, 3, 5] 
  });

  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const systemConfig = storageService.getSystemConfig(); // Check feature flag

  useEffect(() => { refreshData(); }, []);

  const refreshData = () => {
    setTemplates(storageService.getTemplates());
    setAthletes(storageService.getAthletes());
  };

  const handleAiGenerate = async (prompt: string) => {
      setIsAiLoading(true);
      const dbExercises = storageService.getExercises();
      const generated = await aiService.generateWorkoutPlan(prompt, dbExercises);
      setIsAiLoading(false);

      if (!generated) {
          alert("Error de IA. Revisa tu conexión o usa una rutina manual.");
          return;
      }

      setShowAiModal(false);
      const newTemplate: Workout = {
          id: `tpl-${Date.now()}`,
          name: generated.name || 'Nueva Rutina IA',
          publicTitle: generated.publicTitle || 'Sesión Generada',
          category: 'general',
          day: 1,
          exercises: generated.exercises as WorkoutExercise[],
          isTemplate: true
      };
      setEditingTemplate(newTemplate);
      setView('editor');
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate || !editingTemplate.name.trim()) return alert("Nombre obligatorio");
    storageService.saveTemplate(editingTemplate);
    refreshData();
    setView('list');
    setEditingTemplate(null);
  };

  const handleAddBlock = () => {
      if (!editingTemplate) return;
      const newEx: WorkoutExercise = {
          exerciseId: 'ch-1', 
          name: 'Nuevo Bloque', 
          targetSets: 3, 
          targetReps: '10', 
          targetRest: 60, 
          method: 'standard'
      };
      setEditingTemplate({
          ...editingTemplate, 
          exercises: [...editingTemplate.exercises, newEx]
      });
  };

  return (
    <div className="pt-20 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
       <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
             <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2 animate-pulse">Kinetix OS v4.0</p>
             <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                {view === 'list' ? 'Routine Manager' : view === 'editor' ? 'Editor Obsidian' : 'Assign Protocol'}
             </h1>
          </div>
          {view === 'list' && (
             <div className="flex gap-4">
                <button onClick={() => {setEditingTemplate({ id: `tpl-${Date.now()}`, name: '', publicTitle: '', category: 'general', day: 1, exercises: [], isTemplate: true }); setView('editor');}} className="bg-white/5 border border-white/10 hover:bg-white hover:text-black px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                    <span>+</span> Manual
                </button>
                
                {/* AI BUTTON (CONDITIONAL) */}
                {systemConfig.enableAI && (
                    <button onClick={() => setShowAiModal(true)} className="bg-gradient-to-r from-purple-900 to-purple-600 hover:from-purple-800 hover:to-purple-500 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 border border-purple-500/30">
                        <span>✨</span> AI Architect
                    </button>
                )}
             </div>
          )}
       </div>

       {view === 'list' && (
         <div className="space-y-1">
            {/* DATA GRID HEADER */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 text-[9px] font-black uppercase text-white/30 tracking-widest">
                <div className="col-span-6 md:col-span-5">Protocolo</div>
                <div className="hidden md:block col-span-3">Tipo</div>
                <div className="hidden md:block col-span-2 text-center">Volumen</div>
                <div className="col-span-6 md:col-span-2 text-right">Control</div>
            </div>

            {/* DATA GRID BODY */}
            <div className="space-y-2">
                {templates.map(tpl => (
                <div key={tpl.id} className="group grid grid-cols-12 gap-4 items-center bg-[#0F0F11] border border-white/5 hover:border-white/20 p-6 rounded-2xl transition-all hover:translate-x-2">
                    <div className="col-span-6 md:col-span-5">
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-white group-hover:text-red-500 transition-colors truncate">{tpl.name}</h3>
                        <p className="text-[10px] text-white/40 font-bold mt-1 truncate">{tpl.publicTitle || 'Sin título público'}</p>
                    </div>
                    <div className="hidden md:block col-span-3">
                        <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${tpl.category === 'travel' ? 'bg-blue-900/10 text-blue-400 border-blue-900/30' : 'bg-white/5 text-white/40 border-white/5'}`}>
                            {tpl.category === 'travel' ? '✈️ REMOTE' : '🏋️ GYM STD'}
                        </span>
                    </div>
                    <div className="hidden md:block col-span-2 text-center">
                        <span className="text-xl font-black text-white/20 group-hover:text-white transition-colors">{tpl.exercises.length}</span>
                        <span className="text-[8px] font-bold text-white/10 block uppercase tracking-widest">Bloques</span>
                    </div>
                    <div className="col-span-6 md:col-span-2 flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {setEditingTemplate({...tpl}); setView('editor');}} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white hover:text-black flex items-center justify-center text-sm transition-colors border border-white/10">✎</button>
                        <button onClick={() => {setAssignTarget(tpl); setView('assign');}} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-green-600 hover:text-white flex items-center justify-center text-sm transition-colors border border-white/10">📅</button>
                        <button 
                            onClick={() => { if(window.confirm("¿Eliminar rutina?")) { storageService.deleteTemplate(tpl.id); refreshData(); } }}
                            className="w-10 h-10 rounded-lg bg-white/5 hover:bg-red-600 hover:text-white flex items-center justify-center text-sm transition-colors border border-white/10"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                ))}
            </div>
            {templates.length === 0 && (
                <div className="text-center py-20 opacity-30 border-2 border-dashed border-white/5 rounded-3xl mt-4">
                    <p className="text-xl font-black uppercase italic">Sin datos en el sistema</p>
                </div>
            )}
         </div>
       )}

       {view === 'editor' && editingTemplate && (
         <div className="animate-in slide-in-from-bottom-10">
            <div className="sticky top-0 z-40 bg-[#050507]/95 backdrop-blur-md py-4 border-b border-white/10 mb-8 flex justify-between items-center -mx-4 px-4 md:mx-0 md:px-0">
               <button onClick={() => setView('list')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">← Volver</button>
               <div className="flex gap-4">
                   <button onClick={() => { if(window.confirm("¿Borrar cambios no guardados?")) setView('list'); }} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-red-900/30 text-white/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors">Descartar</button>
                   <button onClick={handleSaveTemplate} className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">Guardar Cambios</button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-[#0F0F11] p-8 rounded-[32px] border border-white/5 shadow-lg">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">Nombre Interno (Sistema)</label>
                        <input type="text" className="w-full bg-transparent text-4xl font-black italic uppercase outline-none placeholder-white/10 focus:placeholder-white/5" placeholder="NOMBRE RUTINA" value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} />
                    </div>
                    <div className="bg-[#0F0F11] p-8 rounded-[32px] border border-white/5 shadow-lg">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">Título Público (App Atleta)</label>
                        <input type="text" className="w-full bg-transparent text-2xl font-bold uppercase outline-none placeholder-white/10 text-white/70 focus:placeholder-white/5" placeholder="Ej: Pierna de Acero - Semana 1" value={editingTemplate.publicTitle || ''} onChange={e => setEditingTemplate({...editingTemplate, publicTitle: e.target.value})} />
                    </div>
                </div>
                <div className="bg-[#0F0F11] p-8 rounded-[32px] border border-white/5 flex flex-col justify-center shadow-lg">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-4">Configuración</label>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-black rounded-2xl border border-white/5">
                            <input type="checkbox" id="isTravel" className="w-5 h-5 accent-red-600 bg-black cursor-pointer" checked={editingTemplate.category === 'travel'} onChange={e => setEditingTemplate({...editingTemplate, category: e.target.checked ? 'travel' : 'general'})} />
                            <div>
                                <label htmlFor="isTravel" className="text-xs font-bold uppercase select-none cursor-pointer block text-white">Rutina de Viaje</label>
                                <label htmlFor="isTravel" className="text-[9px] font-medium text-white/40 cursor-pointer">Activar para Plan B</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
               {editingTemplate.exercises.map((ex, idx) => (
                 <ExerciseBlockEditor key={idx} exercise={ex} onUpdate={(u) => {
                   const newExs = [...editingTemplate.exercises];
                   newExs[idx] = u;
                   setEditingTemplate({...editingTemplate, exercises: newExs});
                 }} />
               ))}
            </div>

            <button 
                onClick={handleAddBlock}
                className="w-full py-12 border-2 border-dashed border-white/10 hover:border-white/30 rounded-[40px] text-white/20 hover:text-white font-black uppercase tracking-widest transition-all mt-8 flex flex-col items-center justify-center gap-2 hover:bg-white/5 group"
            >
                <span className="text-5xl group-hover:scale-110 transition-transform text-white/10 group-hover:text-white">+</span> 
                <span className="group-hover:translate-y-1 transition-transform">Añadir Bloque Táctico</span>
            </button>
         </div>
       )}

       {view === 'assign' && assignTarget && (
         <div className="animate-in zoom-in-95 max-w-xl mx-auto bg-[#0F0F11] border border-white/10 p-12 rounded-[50px] shadow-2xl relative">
            <button onClick={() => setView('list')} className="absolute top-8 right-8 text-white/30 hover:text-white text-xl">✕</button>
            
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Desplegar Protocolo</p>
            <h2 className="text-3xl font-black uppercase italic mb-8 tracking-tighter text-white">{assignTarget.name}</h2>
            
            <div className="space-y-8">
               <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Seleccionar Atleta</label>
                   <select className="w-full bg-black border border-white/10 rounded-2xl p-5 font-black text-white text-lg outline-none focus:border-red-600 transition-colors" value={selectedAthleteId} onChange={e => setSelectedAthleteId(e.target.value)}>
                      <option value="">-- Lista de Activos --</option>
                      {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                   </select>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Fecha Inicio</label>
                       <input type="date" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={projConfig.startDate} onChange={e => setProjConfig({...projConfig, startDate: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Duración Ciclo</label>
                       <select className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={projConfig.weeks} onChange={e => setProjConfig({...projConfig, weeks: parseInt(e.target.value)})}>
                           <option value={1}>1 Semana</option>
                           <option value={4}>4 Semanas</option>
                           <option value={8}>8 Semanas</option>
                           <option value={12}>12 Semanas (Mesociclo)</option>
                       </select>
                   </div>
               </div>
               
               <div className="bg-white/5 p-4 rounded-2xl">
                   <label className="text-[9px] font-black uppercase text-white/30 tracking-widest block mb-3">Días de la semana</label>
                   <div className="flex justify-between">
                       {['D','L','M','X','J','V','S'].map((d, i) => (
                           <button 
                                key={i}
                                onClick={() => {
                                    const newDays = projConfig.days.includes(i) ? projConfig.days.filter(x => x !== i) : [...projConfig.days, i];
                                    setProjConfig({...projConfig, days: newDays});
                                }}
                                className={`w-10 h-10 rounded-full text-xs font-black transition-all ${projConfig.days.includes(i) ? 'bg-red-600 text-white shadow-lg scale-110' : 'bg-black text-white/30 hover:bg-white/10'}`}
                           >
                               {d}
                           </button>
                       ))}
                   </div>
               </div>

               <button onClick={() => {
                 const athlete = athletes.find(a => a.id === selectedAthleteId);
                 if (!athlete) return alert("Selecciona un atleta.");
                 if (projConfig.days.length === 0) return alert("Selecciona al menos un día.");
                 
                 calendarService.projectMesocycle(assignTarget, athlete, projConfig.days, projConfig.startDate, projConfig.weeks);
                 alert("✅ Protocolo desplegado exitosamente.");
                 setView('list');
               }} className="w-full py-5 bg-white text-black font-black uppercase text-sm rounded-2xl hover:bg-gray-200 transition-colors shadow-xl">
                   Confirmar Despliegue
               </button>
            </div>
         </div>
       )}

       {showAiModal && <AiGeneratorModal onClose={() => setShowAiModal(false)} onGenerate={handleAiGenerate} isLoading={isAiLoading} />}
    </div>
  );
};
