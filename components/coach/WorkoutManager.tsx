
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
                <div className={`absolute -top-20 -right-20 p-40 blur-[150px] pointer-events-none ${isAiOnline ? 'bg-purple-600/10' : 'bg-red-600/10'}`} />

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
                        <button onClick={onClose} className="md:hidden text-white/40 hover:text-white text-xl p-2">✕</button>
                    </div>

                    <div className="flex-1 flex flex-col gap-4 min-h-0">
                        <textarea 
                            className="flex-1 w-full bg-[#151518] border border-white/10 rounded-3xl p-6 text-white font-medium outline-none focus:border-purple-500 transition-colors resize-none text-sm leading-relaxed placeholder-white/20 custom-scrollbar shadow-inner"
                            placeholder={isAiOnline ? "Describe el objetivo táctico..." : "MODO SIMULACIÓN activo..."}
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
                                    <button onClick={handleSaveBlueprint} className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-lg text-white hover:scale-105">✓</button>
                                    <button onClick={() => setIsSaving(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-white">✕</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setIsSaving(true)} 
                                    disabled={!prompt.trim()}
                                    className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                                >
                                    💾 GUARDAR PROMPT
                                </button>
                            )}
                            
                            <button 
                                onClick={() => {
                                    storageService.saveAiPrompt(prompt);
                                    onGenerate(prompt);
                                }}
                                disabled={!prompt.trim() || isLoading}
                                className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center justify-center gap-3 ${isLoading ? 'bg-purple-900/50 text-white/50 cursor-wait' : isAiOnline ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02]' : 'bg-red-900 text-red-200'}`}
                            >
                                {isLoading ? 'PROCESANDO...' : 'EJECUTAR PROTOCOLO'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-[2] bg-[#08080A] flex flex-col relative z-10 border-l border-white/5 h-1/2 md:h-auto">
                    <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-[#0F0F11]">
                        <div className="flex gap-4">
                            <button onClick={() => setTab('blueprints')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${tab === 'blueprints' ? 'text-white border-b border-white' : 'text-white/30'}`}>Blueprints</button>
                            <button onClick={() => setTab('history')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${tab === 'history' ? 'text-white border-b border-white' : 'text-white/30'}`}>Historial</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {tab === 'blueprints' && blueprints.map((bp) => (
                            <div key={bp.id} onClick={() => setPrompt(bp.prompt)} className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all active:scale-95">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300">{bp.title}</h4>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteBlueprint(bp.id); }} className="text-[10px] text-white/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                                </div>
                                <p className="text-[9px] text-white/40 line-clamp-2 leading-relaxed">{bp.prompt}</p>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        </div>
    );
};

export const WorkoutManager: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor' | 'assign' | 'meso'>('list');
  const [templates, setTemplates] = useState<Workout[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Workout | null>(null);
  const [assignTarget, setAssignTarget] = useState<Workout | null>(null);
  const [athletes, setAthletes] = useState<User[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [projConfig, setProjConfig] = useState({ startDate: new Date().toISOString().split('T')[0], weeks: 4, days: [1, 3, 5], incWeight: 2.5, incReps: 0 });
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const systemConfig = storageService.getSystemConfig();

  useEffect(() => { refreshData(); }, []);

  const refreshData = () => {
    setTemplates(storageService.getTemplates());
    setAthletes(storageService.getAthletes());
  };

  const handleAiGenerate = async (prompt: string) => {
      setIsAiLoading(true);
      const generated = await aiService.generateWorkoutPlan(prompt, storageService.getExercises());
      setIsAiLoading(false);
      if (!generated) return;
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
    if (!editingTemplate || !editingTemplate.name.trim()) return;
    storageService.saveTemplate(editingTemplate);
    refreshData();
    setView('list');
    setEditingTemplate(null);
  };

  const handleCreateMesocycle = () => {
      if (!assignTarget) return;
      const mesocycleSessions = storageService.cloneWithProgression(assignTarget, projConfig.weeks, projConfig.incWeight, projConfig.incReps);
      mesocycleSessions.forEach(session => storageService.saveTemplate(session));
      refreshData();
      alert(`✅ Mesociclo de ${projConfig.weeks} semanas creado. Las rutinas progresivas están listas en tu lista.`);
      setView('list');
  };

  const addExerciseBlock = () => {
      if (!editingTemplate) return;
      const allExs = storageService.getExercises();
      const newEx: WorkoutExercise = {
          exerciseId: allExs[0].id,
          name: allExs[0].name,
          targetSets: 3,
          targetReps: '10',
          targetLoad: '0',
          method: 'standard',
          videoUrl: allExs[0].videoUrl
      };
      setEditingTemplate({ ...editingTemplate, exercises: [...editingTemplate.exercises, newEx] });
  };

  return (
    <div className="pt-20 pb-32 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
       <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
             <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-2 animate-pulse">Kinetix Coach Pro</p>
             <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-tight">
                {view === 'list' ? 'Routine Manager' : view === 'editor' ? 'Protocol Editor' : view === 'meso' ? 'Meso Architect' : 'Assign Protocol'}
             </h1>
          </div>
          {view === 'list' && (
             <div className="flex gap-4">
                <button onClick={() => {setEditingTemplate({ id: `tpl-${Date.now()}`, name: '', publicTitle: '', category: 'general', day: 1, exercises: [], isTemplate: true }); setView('editor');}} className="bg-white/5 border border-white/10 hover:bg-white hover:text-black px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">+ MANUAL</button>
                {systemConfig.enableAI && <button onClick={() => setShowAiModal(true)} className="bg-gradient-to-r from-purple-900 to-purple-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all border border-purple-500/30">✨ AI ARCHITECT</button>}
             </div>
          )}
          {view === 'editor' && (
             <div className="flex gap-4">
                <button onClick={() => setView('list')} className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">CANCELAR</button>
                <button onClick={handleSaveTemplate} className="bg-red-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">GUARDAR MASTER</button>
             </div>
          )}
       </div>

       {view === 'list' && (
         <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[9px] font-black uppercase text-white/20 tracking-widest">
                <div className="col-span-6 md:col-span-5">Protocolo</div>
                <div className="hidden md:block col-span-3 text-center">Config</div>
                <div className="col-span-6 md:col-span-4 text-right">Acciones Tácticas</div>
            </div>

            <div className="space-y-3">
                {templates.map(tpl => (
                <div key={tpl.id} className="group grid grid-cols-12 gap-4 items-center bg-[#0F0F11] border border-white/5 hover:border-white/20 p-6 rounded-3xl transition-all">
                    <div className="col-span-6 md:col-span-5">
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-white group-hover:text-red-500 transition-colors">{tpl.name}</h3>
                        <p className="text-[10px] text-white/30 font-bold mt-1 uppercase">{tpl.exercises.length} Bloques de Inteligencia</p>
                    </div>
                    <div className="hidden md:block col-span-3 text-center">
                        <span className="text-[8px] font-black uppercase bg-white/5 px-4 py-1.5 rounded-full text-white/40 tracking-widest">v2.0 MASTER</span>
                    </div>
                    <div className="col-span-6 md:col-span-4 flex justify-end gap-3">
                        <button onClick={() => {setEditingTemplate({...tpl}); setView('editor');}} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white hover:text-black flex items-center justify-center text-sm border border-white/5 transition-all">✎</button>
                        <button onClick={() => {setAssignTarget(tpl); setView('meso');}} className="px-5 h-12 rounded-2xl bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white flex items-center justify-center text-[10px] font-black uppercase tracking-widest border border-blue-600/20 transition-all">🏗 MESO</button>
                        <button onClick={() => {setAssignTarget(tpl); setView('assign');}} className="w-12 h-12 rounded-2xl bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white flex items-center justify-center text-sm border border-green-600/20 transition-all">📅</button>
                    </div>
                </div>
                ))}
            </div>
         </div>
       )}

       {view === 'editor' && editingTemplate && (
           <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
               <div className="bg-[#0F0F11] p-8 rounded-[40px] border border-white/5 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Nombre del Protocolo (ID Interno)</label>
                           <input type="text" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xl font-black text-white outline-none focus:border-red-600" value={editingTemplate.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} placeholder="Ej: HIPERTROFIA ALPHA W1" />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Título Público (Para Atleta)</label>
                           <input type="text" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xl font-black text-red-600 italic outline-none focus:border-red-600" value={editingTemplate.publicTitle || ''} onChange={e => setEditingTemplate({...editingTemplate, publicTitle: e.target.value})} placeholder="Ej: SESIÓN DE PODER" />
                       </div>
                   </div>
               </div>

               <div className="space-y-6">
                   {editingTemplate.exercises.map((ex, idx) => (
                       <div key={idx} className="relative group">
                           <button onClick={() => {
                               const newExs = editingTemplate.exercises.filter((_, i) => i !== idx);
                               setEditingTemplate({...editingTemplate, exercises: newExs});
                           }} className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity font-black">✕</button>
                           <ExerciseBlockEditor exercise={ex} onUpdate={(updated) => {
                               const newExs = [...editingTemplate.exercises];
                               newExs[idx] = updated;
                               setEditingTemplate({...editingTemplate, exercises: newExs});
                           }} />
                       </div>
                   ))}
               </div>

               <button onClick={addExerciseBlock} className="w-full py-8 border-2 border-dashed border-white/5 rounded-[40px] text-[11px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all">
                   + AÑADIR BLOQUE DE ENTRENAMIENTO
               </button>
           </div>
       )}

       {view === 'meso' && assignTarget && (
           <div className="animate-in zoom-in-95 max-w-2xl mx-auto bg-[#0F0F11] border border-blue-500/20 p-12 rounded-[50px] shadow-2xl relative">
                <button onClick={() => setView('list')} className="absolute top-8 right-8 text-white/20 hover:text-white">✕</button>
                <div className="mb-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-blue-500">Meso Architect</h2>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-2 italic">Proyección Progresiva Automática</p>
                </div>
                
                <div className="space-y-10">
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 space-y-8">
                        <div>
                            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-4">Alcance de la Progresión</label>
                            <div className="flex gap-4">
                                {[2, 4, 8, 12].map(w => (
                                    <button key={w} onClick={() => setProjConfig({...projConfig, weeks: w})} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${projConfig.weeks === w ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-black text-white/20'}`}>{w} Sem</button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block">Incr. Peso (Sem)</label>
                                <div className="flex items-center gap-4 bg-black p-4 rounded-2xl border border-white/10">
                                    <input type="number" step="0.5" className="bg-transparent text-2xl font-black text-white outline-none w-full" value={projConfig.incWeight} onChange={e => setProjConfig({...projConfig, incWeight: parseFloat(e.target.value)})} />
                                    <span className="text-[10px] font-black text-white/20">KG</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block">Incr. Reps (Sem)</label>
                                <div className="flex items-center gap-4 bg-black p-4 rounded-2xl border border-white/10">
                                    <input type="number" className="bg-transparent text-2xl font-black text-white outline-none w-full" value={projConfig.incReps} onChange={e => setProjConfig({...projConfig, incReps: parseInt(e.target.value)})} />
                                    <span className="text-[10px] font-black text-white/20">RPS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600/5 p-6 rounded-3xl border border-blue-500/10 italic text-[10px] text-white/50 leading-relaxed">
                        💡 Este motor clonará "{assignTarget.name}" por {projConfig.weeks} semanas. Cada nueva sesión tendrá los pesos ajustados automáticamente según tu regla de progresión. El Coach siempre mantiene el control final.
                    </div>

                    <button onClick={handleCreateMesocycle} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-[24px] shadow-2xl transition-all active:scale-95 tracking-[0.4em] text-[10px]">CONSTRUIR MESOCICLO ⚡</button>
                </div>
           </div>
       )}

       {view === 'assign' && assignTarget && (
         <div className="animate-in zoom-in-95 max-w-xl mx-auto bg-[#0F0F11] border border-white/10 p-12 rounded-[50px] shadow-2xl relative">
            <button onClick={() => setView('list')} className="absolute top-8 right-8 text-white/20 hover:text-white">✕</button>
            <h2 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">Desplegar Protocolo</h2>
            <div className="space-y-8">
               <div className="space-y-2">
                   <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Atleta Objetivo</label>
                   <select className="w-full bg-black border border-white/10 rounded-2xl p-5 font-black text-white text-lg" value={selectedAthleteId} onChange={e => setSelectedAthleteId(e.target.value)}>
                      <option value="">-- SELECCIONAR --</option>
                      {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                   </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Fecha de Inicio</label>
                       <input type="date" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={projConfig.startDate} onChange={e => setProjConfig({...projConfig, startDate: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-white/30 tracking-widest">Días Semanales</label>
                       <div className="flex gap-1">
                           {[1,3,5].map(d => (
                               <button key={d} onClick={() => setProjConfig({...projConfig, days: projConfig.days.includes(d) ? projConfig.days.filter(x => x !== d) : [...projConfig.days, d]})} className={`flex-1 py-3 rounded-lg text-[8px] font-black ${projConfig.days.includes(d) ? 'bg-red-600 text-white' : 'bg-white/5 text-white/30'}`}>{['','L','M','X','J','V','S','D'][d]}</button>
                           ))}
                       </div>
                   </div>
               </div>
               <button onClick={() => {
                 const athlete = athletes.find(a => a.id === selectedAthleteId);
                 if (!athlete) return alert("Selecciona un atleta.");
                 calendarService.projectMesocycle(assignTarget, athlete, projConfig.days, projConfig.startDate, projConfig.weeks);
                 alert("✅ Protocolo desplegado exitosamente.");
                 setView('list');
               }} className="w-full py-6 bg-red-600 text-white font-black uppercase rounded-2xl shadow-xl hover:bg-red-500 transition-all">ASIGNAR A CALENDARIO</button>
            </div>
         </div>
       )}

       {showAiModal && <AiGeneratorModal onClose={() => setShowAiModal(false)} onGenerate={handleAiGenerate} isLoading={isAiLoading} />}
    </div>
  );
};
