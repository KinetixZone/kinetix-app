import React, { useState, useMemo } from 'react';
import { WorkoutExercise, TrainingMethod, IntervalItem } from '../../types/kinetix';
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
            weight: normalizeMatrixString(d.weight, newLen, '0'),
            reps: normalizeMatrixString(d.reps, newLen, '10')
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

  const updateIntervalItem = (idx: number, updates: Partial<IntervalItem>) => {
    const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
    const config = (exercise as any)[key];
    if (!config) return;
    const seq = [...(config.sequence || [])];
    seq[idx] = { ...seq[idx], ...updates };
    handleUpdate({ [key]: { ...config, sequence: seq } });
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Módulo Principal</label>
                <select className="w-full bg-[#151518] border border-white/10 rounded-[24px] p-5 text-white text-lg font-black italic uppercase outline-none" value={exercise.exerciseId} onChange={e => {
                    const sel = allExercises.find(x => x.id === e.target.value);
                    if (sel) handleUpdate({ exerciseId: sel.id, name: sel.name, videoUrl: sel.videoUrl });
                }}>
                  {Object.keys(groupedExercises).map(cat => (
                    <optgroup key={cat} label={cat.toUpperCase()}>
                      {groupedExercises[cat].map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </optgroup>
                  ))}
                </select>
            </div>

            {exercise.method === 'biserie' && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Pareja (Par B)</label>
                    <select className="w-full bg-[#151518] border border-blue-500/20 rounded-[24px] p-5 text-white text-lg font-black italic uppercase outline-none" value={exercise.pair?.exerciseId || ''} onChange={e => {
                        const sel = allExercises.find(x => x.id === e.target.value);
                        if (sel) handleUpdate({ pair: { exerciseId: sel.id, name: sel.name, targetReps: '10', targetLoad: '0', videoUrl: sel.videoUrl } });
                    }}>
                      <option value="">-- SELECCIONAR --</option>
                      {allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                </div>
            )}
        </div>

        {/* MATRIX EDITOR (AHAP / STANDARD / BI-SERIE) */}
        {(exercise.method === 'ahap' || exercise.method === 'standard' || exercise.method === 'biserie') && (
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[40px] space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Protocolo de Carga por Set</p>
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                        <span className="text-[9px] font-black text-white/40 uppercase">Sets:</span>
                        <input type="number" className="bg-transparent text-white font-black w-8 outline-none text-center" value={exercise.targetSets} onChange={e => handleUpdate({ targetSets: parseInt(e.target.value) || 1 })} />
                    </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {Array.from({ length: exercise.targetSets || 1 }).map((_, i) => (
                        <div key={i} className="shrink-0 w-32 space-y-3">
                            <p className="text-[9px] font-black text-white/10 uppercase text-center">SET {i+1}</p>
                            <div className="bg-black/40 p-3 rounded-2xl border border-white/5 space-y-2">
                                <input type="text" className="w-full bg-transparent text-center text-xl font-black text-yellow-500 outline-none" value={(exercise.targetLoad || '').split(',')[i]?.trim() || '0'} onChange={e => updateMatrixLoad(i, e.target.value)} placeholder="KG" />
                                <input type="text" className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-center text-xs font-black text-white outline-none" value={(exercise.targetReps || '').split(',')[i]?.trim() || '10'} onChange={e => updateMatrixReps(i, e.target.value)} placeholder="REPS" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* DROIPSET EDITOR */}
        {exercise.method === 'dropset' && (
            <div className="bg-purple-900/10 border border-purple-500/20 p-8 rounded-[40px] space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Drop Matrix Engineering</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[8px] font-bold text-white/30 uppercase">Sets Totales:</span>
                            <input type="number" className="bg-transparent text-white font-black w-6 text-[10px] outline-none" value={exercise.targetSets} onChange={e => handleUpdate({ targetSets: parseInt(e.target.value) || 1 })} />
                        </div>
                    </div>
                    <button onClick={() => {
                        const newDrops = [...(exercise.dropsetConfig?.drops || []), { weight: '0', reps: 'Fallo' }];
                        handleUpdate({ dropsetConfig: { ...exercise.dropsetConfig!, drops: newDrops } });
                    }} className="text-[9px] font-black bg-purple-600 px-4 py-2 rounded-xl text-white">+ DROP</button>
                </div>
                <div className="overflow-x-auto no-scrollbar rounded-2xl border border-white/5 bg-black/20">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-3 text-[8px] font-black text-white/30 uppercase">Set</th>
                                <th className="p-3 text-[8px] font-black text-purple-400 uppercase">Base (KG)</th>
                                {exercise.dropsetConfig?.drops.map((_, idx) => (
                                    <th key={idx} className="p-3 text-[8px] font-black text-purple-300/50 uppercase">Drop {idx+1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: exercise.targetSets || 1 }).map((_, sIdx) => (
                                <tr key={sIdx} className="border-b border-white/5">
                                    <td className="p-3 text-[10px] font-black text-white/10">{sIdx+1}</td>
                                    <td className="p-2">
                                        <input type="text" className="w-14 bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 text-center text-xs font-black text-white" value={(exercise.targetLoad || '').split(',')[sIdx]?.trim() || '0'} onChange={e => updateMatrixLoad(sIdx, e.target.value)} />
                                    </td>
                                    {exercise.dropsetConfig?.drops.map((d, dIdx) => (
                                        <td key={dIdx} className="p-2">
                                            <input type="text" className="w-14 bg-black/40 border border-white/5 rounded-lg p-2 text-center text-xs font-black text-purple-300/60" value={(d.weight || '').split(',')[sIdx]?.trim() || '0'} onChange={e => updateDropWeight(sIdx, dIdx, e.target.value)} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* INTERVAL EDITOR (EMOM / TABATA) */}
        {(exercise.method === 'emom' || exercise.method === 'tabata') && (
            <div className="space-y-10 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
                        <label className="text-[9px] font-black text-white/30 uppercase block mb-4">{exercise.method === 'emom' ? 'Duración Total' : 'Rondas Totales'}</label>
                        <div className="flex items-end gap-3">
                          <input type="number" className="bg-transparent text-5xl font-black text-white outline-none w-24" value={exercise.method === 'emom' ? exercise.emomConfig?.durationMin : exercise.tabataConfig?.rounds} onChange={e => {
                              const val = parseInt(e.target.value) || 1;
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
                        <button onClick={() => {
                            const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
                            const config = (exercise as any)[key] || { sequence: [] };
                            const newItem = { exerciseId: allExercises[0].id, name: allExercises[0].name, targetReps: '10', targetLoad: '0' };
                            handleUpdate({ [key]: { ...config, sequence: [...(config.sequence || []), newItem] } });
                        }} className="text-[9px] font-black bg-cyan-600 px-4 py-2 rounded-xl text-white">+ ITEM</button>
                    </div>
                    <div className="space-y-3">
                        {(exercise.method === 'emom' ? exercise.emomConfig?.sequence : exercise.tabataConfig?.sequence)?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-[#151518] p-4 rounded-3xl border border-white/5">
                                <span className="text-[11px] font-black text-white/10 w-6 italic">#{idx + 1}</span>
                                <select className="flex-1 bg-transparent text-xs font-black uppercase text-white outline-none" value={item.exerciseId} onChange={e => {
                                    const sel = allExercises.find(x => x.id === e.target.value);
                                    if(sel) updateIntervalItem(idx, { exerciseId: sel.id, name: sel.name });
                                }}>
                                    {allExercises.map(ex => <option key={ex.id} value={ex.id} className="bg-black text-white">{ex.name}</option>)}
                                </select>
                                <div className="flex gap-2">
                                  <input type="text" className="w-16 bg-black/40 border border-white/5 rounded-xl p-2.5 text-center text-xs font-black text-cyan-400" value={item.targetLoad} onChange={e => updateIntervalItem(idx, { targetLoad: e.target.value })} placeholder="KG"/>
                                  <input type="text" className="w-16 bg-black/40 border border-white/5 rounded-xl p-2.5 text-center text-xs font-black text-white" value={item.targetReps} onChange={e => updateIntervalItem(idx, { targetReps: e.target.value })} placeholder="REPS"/>
                                </div>
                                <button onClick={() => {
                                    const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
                                    const config = (exercise as any)[key];
                                    const seq = [...(config.sequence || [])].filter((_, i) => i !== idx);
                                    handleUpdate({ [key]: { ...config, sequence: seq } });
                                }} className="text-red-500/30 hover:text-red-500 px-2">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
            <div className="bg-[#121215] p-5 rounded-3xl border border-white/5">
                <label className="text-[8px] font-black text-white/20 uppercase block mb-1">Rest (sec)</label>
                <input type="number" className="w-full bg-transparent text-3xl font-black text-red-600 outline-none" value={exercise.targetRest} onChange={e => handleUpdate({ targetRest: parseInt(e.target.value) || 0 })}/>
            </div>
        </div>
      </div>
    </div>
  );
};
