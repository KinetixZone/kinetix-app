import React, { useState, useMemo } from 'react';
import { WorkoutExercise, TrainingMethod, DropSetNode, IntervalItem } from '../../types/kinetix';
import { storageService } from '../../services/storageService';

interface Props {
  exercise: WorkoutExercise;
  onUpdate: (updated: WorkoutExercise) => void;
}

export const ExerciseBlockEditor: React.FC<Props> = ({ exercise, onUpdate }) => {
  const allExercises = useMemo(() => storageService.getExercises(), []);
  
  const groupedExercises = useMemo(() => {
    const groups: Record<string, typeof allExercises> = {};
    allExercises.forEach(ex => {
      const category = ex.muscleGroup.split(' / ')[0];
      if (!groups[category]) groups[category] = [];
      groups[category].push(ex);
    });
    return groups;
  }, [allExercises]);

  // Normaliza la longitud de las cadenas de matriz para evitar errores de índice
  const normalizeMatrixString = (str: string | undefined, length: number, fallback: string): string => {
    const parts = (str || '').split(',').map(s => s.trim()).filter(s => s !== '');
    if (parts.length === 0) return Array(length).fill(fallback).join(', ');
    const normalized = [];
    for (let i = 0; i < length; i++) {
      normalized.push(parts[i] || parts[parts.length - 1] || fallback);
    }
    return normalized.join(', ');
  };

  const handleUpdate = (updates: Partial<WorkoutExercise>) => {
    let finalUpdates = { ...updates };
    
    if (updates.targetSets !== undefined && updates.targetSets !== exercise.targetSets) {
      const newLen = updates.targetSets;
      finalUpdates.targetLoad = normalizeMatrixString(exercise.targetLoad, newLen, '0');
      finalUpdates.targetReps = normalizeMatrixString(exercise.targetReps, newLen, '10');
      
      if (exercise.dropsetConfig?.drops) {
        finalUpdates.dropsetConfig = {
          ...exercise.dropsetConfig,
          drops: exercise.dropsetConfig.drops.map(d => ({
            ...d,
            weight: normalizeMatrixString(d.weight, newLen, '0')
          }))
        };
      }
    }
    
    onUpdate({ ...exercise, ...finalUpdates });
  };

  const updateMatrixLoad = (setIdx: number, val: string) => {
    const weights = (exercise.targetLoad || '').split(',').map(s => s.trim());
    while (weights.length < exercise.targetSets) weights.push(weights[weights.length - 1] || '0');
    weights[setIdx] = val;
    handleUpdate({ targetLoad: weights.join(', ') });
  };

  const updateMatrixReps = (setIdx: number, val: string) => {
    const reps = (exercise.targetReps || '').split(',').map(s => s.trim());
    while (reps.length < exercise.targetSets) reps.push(reps[reps.length - 1] || '10');
    reps[setIdx] = val;
    handleUpdate({ targetReps: reps.join(', ') });
  };

  const updateDropWeight = (setIdx: number, dropIdx: number, val: string) => {
    const config = exercise.dropsetConfig || { drops: [] };
    const currentDrops = [...config.drops];
    if (!currentDrops[dropIdx]) return;

    const setWeights = (currentDrops[dropIdx].weight || '').split(',').map(s => s.trim());
    while (setWeights.length < exercise.targetSets) setWeights.push(setWeights[setWeights.length - 1] || '0');
    setWeights[setIdx] = val;
    
    currentDrops[dropIdx] = { ...currentDrops[dropIdx], weight: setWeights.join(', ') };
    handleUpdate({ dropsetConfig: { ...config, drops: currentDrops } });
  };

  const updateIntervalItem = (type: 'emom' | 'tabata', idx: number, updates: Partial<IntervalItem>) => {
    const configKey = type === 'emom' ? 'emomConfig' : 'tabataConfig';
    const config = (exercise as any)[configKey] || { sequence: [] };
    const seq = [...(config.sequence || [])];
    if (seq[idx]) {
      seq[idx] = { ...seq[idx], ...updates };
      handleUpdate({ [configKey]: { ...config, sequence: seq } });
    }
  };

  const addIntervalItem = (type: 'emom' | 'tabata') => {
    const configKey = type === 'emom' ? 'emomConfig' : 'tabataConfig';
    const config = (exercise as any)[configKey] || (type === 'emom' ? { durationMin: 10, sequence: [] } : { rounds: 8, workTimeSec: 20, restTimeSec: 10, sequence: [] });
    const newItem: IntervalItem = { exerciseId: allExercises[0].id, name: allExercises[0].name, targetReps: '10', targetLoad: '0' };
    handleUpdate({ [configKey]: { ...config, sequence: [...(config.sequence || []), newItem] } });
  };

  const METHODS: { id: TrainingMethod; label: string; color: string; icon: string }[] = [
      { id: 'standard', label: 'STD', color: 'bg-white', icon: '⚡' },
      { id: 'ahap', label: 'AHAP', color: 'bg-yellow-500', icon: '🔥' },
      { id: 'dropset', label: 'DROPSET', color: 'bg-purple-600', icon: '📉' },
      { id: 'biserie', label: 'BISERIE', color: 'bg-blue-500', icon: '🔗' },
      { id: 'tabata', label: 'TABATA', color: 'bg-pink-500', icon: '⏱' },
      { id: 'emom', label: 'EMOM', color: 'bg-cyan-500', icon: '⚡' },
  ];

  const currentMethod = METHODS.find(m => m.id === exercise.method) || METHODS[0];

  return (
    <div className="bg-[#0A0A0C] rounded-[40px] border border-white/5 mb-8 overflow-hidden shadow-2xl transition-all hover:border-white/10 group/block">
      {/* METHOD SELECTOR */}
      <div className="flex bg-[#121215] p-2 overflow-x-auto border-b border-white/5 no-scrollbar gap-1">
        {METHODS.map(m => (
          <button 
            key={m.id} 
            onClick={() => handleUpdate({ method: m.id })} 
            className={`shrink-0 px-4 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 ${exercise.method === m.id ? `${m.color} text-black font-black scale-[1.02]` : 'text-white/20 hover:text-white hover:bg-white/5'}`}
          >
            <span className="text-sm">{m.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="p-8 space-y-10 relative">
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-[0.03] pointer-events-none rounded-full ${currentMethod.color}`} />

        {/* SELECTOR EJERCICIO */}
        {exercise.method !== 'biserie' && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full ${currentMethod.color}`} />
                      Módulo Principal
                  </label>
                  <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{exercise.method} ACTIVE</span>
                </div>
                <div className="relative group">
                  <select 
                    className="w-full bg-[#151518] border border-white/10 rounded-[24px] p-5 text-white text-lg font-black italic uppercase outline-none focus:border-white/40 transition-all appearance-none cursor-pointer" 
                    value={exercise.exerciseId} 
                    onChange={(e) => {
                      const sel = allExercises.find(x => x.id === e.target.value);
                      if (sel) handleUpdate({ exerciseId: sel.id, name: sel.name, videoUrl: sel.videoUrl });
                    }}
                  >
                      {Object.keys(groupedExercises).map(cat => (
                          <optgroup key={cat} label={cat.toUpperCase()} className="bg-[#0F0F11] text-white/40 font-black">
                              {groupedExercises[cat].map(ex => <option key={ex.id} value={ex.id} className="text-white bg-[#151518]">{ex.name}</option>)}
                          </optgroup>
                      ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">▼</div>
                </div>
            </div>
        )}

        {/* CONTENIDO POR MODO */}
        {exercise.method === 'biserie' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[35px] space-y-6">
              <div className="flex justify-between items-center">
                <span className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[10px] text-black font-black shadow-lg">A</span>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Primario</p>
              </div>
              <select className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white font-black italic uppercase text-sm" value={exercise.exerciseId} onChange={(e) => {
                  const sel = allExercises.find(x => x.id === e.target.value);
                  if (sel) handleUpdate({ exerciseId: sel.id, name: sel.name, videoUrl: sel.videoUrl });
              }}>
                {allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/60 p-3 rounded-xl">
                  <span className="text-[7px] font-black text-white/20 uppercase block mb-1">Carga A</span>
                  <input type="text" className="w-full bg-transparent text-xl font-black text-white outline-none" value={exercise.targetLoad || ''} onChange={e => handleUpdate({ targetLoad: e.target.value })} placeholder="0"/>
                </div>
                <div className="bg-black/60 p-3 rounded-xl">
                  <span className="text-[7px] font-black text-white/20 uppercase block mb-1">Reps A</span>
                  <input type="text" className="w-full bg-transparent text-xl font-black text-white outline-none" value={exercise.targetReps} onChange={e => handleUpdate({ targetReps: e.target.value })} placeholder="10"/>
                </div>
              </div>
            </div>
            <div className="bg-blue-600/[0.02] border border-blue-500/20 p-8 rounded-[35px] space-y-6">
              <div className="flex justify-between items-center">
                <span className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-[10px] text-white font-black shadow-lg">B</span>
                <p className="text-[10px] font-black text-blue-400/40 uppercase tracking-widest">Secundario</p>
              </div>
              <select className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white font-black italic uppercase text-sm" value={exercise.pair?.exerciseId || ''} onChange={(e) => {
                  const sel = allExercises.find(x => x.id === e.target.value);
                  if (sel) handleUpdate({ pair: { ...(exercise.pair || { targetReps: '10', targetLoad: '0' }), exerciseId: sel.id, name: sel.name } });
              }}>
                <option value="">Seleccionar B...</option>
                {allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/60 p-3 rounded-xl border border-blue-500/10">
                  <span className="text-[7px] font-black text-blue-400/40 uppercase block mb-1">Carga B</span>
                  <input type="text" className="w-full bg-transparent text-xl font-black text-white outline-none" value={exercise.pair?.targetLoad || ''} onChange={e => handleUpdate({ pair: { ...(exercise.pair || { exerciseId: '', name: '', targetReps: '10' }), targetLoad: e.target.value } })} placeholder="0"/>
                </div>
                <div className="bg-black/60 p-3 rounded-xl border border-blue-500/10">
                  <span className="text-[7px] font-black text-blue-400/40 uppercase block mb-1">Reps B</span>
                  <input type="text" className="w-full bg-transparent text-xl font-black text-white outline-none" value={exercise.pair?.targetReps || ''} onChange={e => handleUpdate({ pair: { ...(exercise.pair || { exerciseId: '', name: '', targetLoad: '0' }), targetReps: e.target.value } })} placeholder="10"/>
                </div>
              </div>
            </div>
          </div>
        ) : exercise.method === 'ahap' ? (
            <div className="bg-yellow-900/[0.03] border border-yellow-500/10 p-8 rounded-[40px] space-y-8 animate-in fade-in">
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] italic">Telemetry Matrix AHAP</p>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {Array.from({ length: exercise.targetSets || 3 }).map((_, sIdx) => (
                        <div key={sIdx} className="shrink-0 w-28">
                            <div className="bg-black/40 p-4 rounded-3xl border border-white/5 flex flex-col items-center gap-4">
                                <span className="text-[9px] font-black text-white/20 uppercase">Set {sIdx + 1}</span>
                                <div className="space-y-3 w-full text-center">
                                    <input 
                                        type="text" 
                                        className="w-full bg-transparent text-center text-2xl font-black text-yellow-500 outline-none" 
                                        value={(exercise.targetLoad || '').split(',')[sIdx]?.trim() || ''} 
                                        onChange={e => updateMatrixLoad(sIdx, e.target.value)}
                                        placeholder="0"
                                    />
                                    <div className="bg-white/5 rounded-xl p-2">
                                      <input 
                                          type="text" 
                                          className="w-full bg-transparent text-center text-[11px] font-black text-white outline-none" 
                                          value={(exercise.targetReps || '').split(',')[sIdx]?.trim() || ''} 
                                          onChange={e => updateMatrixReps(sIdx, e.target.value)}
                                          placeholder="10"
                                      />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : exercise.method === 'dropset' ? (
            <div className="bg-purple-900/[0.03] border border-purple-500/10 p-8 rounded-[40px] space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] italic">Drop Matrix Engineering</p>
                    <button 
                        onClick={() => handleUpdate({ dropsetConfig: { drops: [...(exercise.dropsetConfig?.drops || []), { weight: '0', reps: 'Fallo' }] } })}
                        className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-4 py-2 rounded-xl"
                    >
                        + ADD DROP
                    </button>
                </div>
                <div className="overflow-x-auto no-scrollbar rounded-2xl border border-white/5">
                    <div className="min-w-[600px] bg-black/40">
                        <div className="grid grid-cols-6 gap-2 p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest text-center">Set</div>
                            <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest text-center">Base Load</div>
                            {(exercise.dropsetConfig?.drops || []).map((_, i) => (
                                <div key={i} className="text-[8px] font-black text-purple-500/60 uppercase tracking-widest text-center">Drop {i+1}</div>
                            ))}
                        </div>
                        <div className="divide-y divide-white/5">
                          {Array.from({ length: exercise.targetSets || 3 }).map((_, sIdx) => (
                              <div key={sIdx} className="grid grid-cols-6 gap-2 p-3 hover:bg-white/[0.02]">
                                  <div className="flex items-center justify-center text-[10px] font-black text-white/10">{sIdx + 1}</div>
                                  <div className="px-2">
                                    <input type="text" className="w-full bg-purple-500/10 border border-purple-500/20 rounded-xl p-2 text-center text-sm font-black text-white" value={(exercise.targetLoad || '').split(',')[sIdx]?.trim() || ''} onChange={e => updateMatrixLoad(sIdx, e.target.value)} placeholder="0"/>
                                  </div>
                                  {(exercise.dropsetConfig?.drops || []).map((drop, dIdx) => (
                                      <div key={dIdx} className="px-1">
                                        <input type="text" className="w-full bg-black/40 border border-white/5 rounded-xl p-2 text-center text-xs font-bold text-purple-300" value={(drop.weight || '').split(',')[sIdx]?.trim() || ''} onChange={e => updateDropWeight(sIdx, dIdx, e.target.value)} placeholder="0"/>
                                      </div>
                                  ))}
                              </div>
                          ))}
                        </div>
                    </div>
                </div>
            </div>
        ) : (exercise.method === 'tabata' || exercise.method === 'emom') ? (
            <div className="space-y-10 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
                        <label className="text-[9px] font-black text-white/30 uppercase block mb-4">{exercise.method === 'emom' ? 'Duración Total' : 'Rondas Totales'}</label>
                        <div className="flex items-end gap-3">
                          <input type="number" className="bg-transparent text-5xl font-black text-white outline-none w-24" value={exercise.method === 'emom' ? exercise.emomConfig?.durationMin : exercise.tabataConfig?.rounds} onChange={e => {
                              const val = parseInt(e.target.value);
                              if(exercise.method === 'emom') handleUpdate({ targetSets: val, emomConfig: { ...(exercise.emomConfig || { sequence: [] }), durationMin: val } });
                              else handleUpdate({ targetSets: val, tabataConfig: { ...(exercise.tabataConfig || { rounds: val, workTimeSec: 20, restTimeSec: 10, sequence: [] }), rounds: val } });
                          }}/>
                          <span className="text-sm font-black text-white/20 mb-2 uppercase">{exercise.method === 'emom' ? 'MIN' : 'RND'}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Sequence Architecture</p>
                        <button onClick={() => addIntervalItem(exercise.method as 'emom' | 'tabata')} className="text-[9px] font-black bg-white/10 px-5 py-2.5 rounded-xl">+ ADD ITEM</button>
                    </div>
                    <div className="space-y-3">
                        {(exercise.method === 'emom' ? exercise.emomConfig?.sequence : exercise.tabataConfig?.sequence)?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-[#151518] p-4 rounded-3xl border border-white/5">
                                <span className="text-[11px] font-black text-white/10 w-6 italic">#{idx + 1}</span>
                                <select className="flex-1 bg-transparent text-xs font-black uppercase text-white outline-none" value={item.exerciseId} onChange={e => {
                                    const sel = allExercises.find(x => x.id === e.target.value);
                                    if(sel) updateIntervalItem(exercise.method as 'emom' | 'tabata', idx, { exerciseId: sel.id, name: sel.name });
                                }}>
                                    {allExercises.map(ex => <option key={ex.id} value={ex.id} className="bg-black text-white">{ex.name}</option>)}
                                </select>
                                <div className="flex gap-2">
                                  <input type="text" className="w-16 bg-black/40 border border-white/5 rounded-xl p-2.5 text-center text-xs font-black text-white" value={item.targetLoad} onChange={e => updateIntervalItem(exercise.method as 'emom' | 'tabata', idx, { targetLoad: e.target.value })} placeholder="KG"/>
                                  <input type="text" className="w-16 bg-black/40 border border-white/5 rounded-xl p-2.5 text-center text-xs font-black text-white" value={item.targetReps} onChange={e => updateIntervalItem(exercise.method as 'emom' | 'tabata', idx, { targetReps: e.target.value })} placeholder="REPS"/>
                                </div>
                                <button onClick={() => {
                                    const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
                                    const seq = [...((exercise as any)[key]?.sequence || [])].filter((_: any, i: number) => i !== idx);
                                    handleUpdate({ [key]: { ...(exercise as any)[key], sequence: seq } });
                                }} className="text-red-500/30 hover:text-red-500 px-2">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : null}

        {/* PARÁMETROS GLOBALES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
            <div className="bg-[#121215] p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
                <label className="text-[8px] font-black text-white/20 uppercase block mb-2">Sets Totales</label>
                <input type="number" className="w-full bg-transparent text-3xl font-black text-white outline-none" value={exercise.targetSets} onChange={e => handleUpdate({ targetSets: parseInt(e.target.value) })}/>
            </div>
            {exercise.method !== 'biserie' && exercise.method !== 'tabata' && exercise.method !== 'emom' && (
                <>
                <div className="bg-[#121215] p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
                    <label className="text-[8px] font-black text-white/20 uppercase block mb-2">Repeticiones</label>
                    <input type="text" className="w-full bg-transparent text-3xl font-black text-white outline-none" value={exercise.targetReps} onChange={e => handleUpdate({ targetReps: e.target.value })}/>
                </div>
                {exercise.method !== 'ahap' && exercise.method !== 'dropset' && (
                    <div className="bg-red-600/[0.03] p-5 rounded-3xl border border-red-600/20 flex flex-col justify-between">
                        <label className="text-[8px] font-black text-red-600 uppercase block mb-2">Carga Global</label>
                        <input type="text" className="w-full bg-transparent text-3xl font-black text-white outline-none" value={exercise.targetLoad || ''} onChange={e => handleUpdate({ targetLoad: e.target.value })} placeholder="0"/>
                    </div>
                )}
                </>
            )}
            <div className="bg-[#121215] p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
                <label className="text-[8px] font-black text-white/20 uppercase block mb-2">Rest (sec)</label>
                <input type="number" className="w-full bg-transparent text-3xl font-black text-red-600 outline-none" value={exercise.targetRest} onChange={e => handleUpdate({ targetRest: parseInt(e.target.value) })}/>
            </div>
        </div>
      </div>
    </div>
  );
};
