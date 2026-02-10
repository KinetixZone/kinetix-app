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
      
      if (exercise.pair) {
        finalUpdates.pair = {
          ...exercise.pair,
          targetLoad: normalizeMatrixString(exercise.pair.targetLoad, newLen, '0'),
          targetReps: normalizeMatrixString(exercise.pair.targetReps, newLen, '10')
        };
      }

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

  const updateMatrixValue = (field: 'targetLoad' | 'targetReps', setIdx: number, val: string, isPair = false) => {
    const targetObj = isPair ? exercise.pair : exercise;
    if (!targetObj) return;

    const currentStr = (isPair ? exercise.pair?.[field as 'targetLoad' | 'targetReps'] : exercise[field]) || '';
    const parts = currentStr.split(',').map(s => s.trim());
    while (parts.length < (exercise.targetSets || 1)) parts.push(parts[parts.length - 1] || (field === 'targetLoad' ? '0' : '10'));
    parts[setIdx] = val;
    
    if (isPair) {
      handleUpdate({ pair: { ...exercise.pair!, [field]: parts.join(', ') } });
    } else {
      handleUpdate({ [field]: parts.join(', ') });
    }
  };

  const updateIntervalItem = (idx: number, updates: Partial<IntervalItem>) => {
    const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
    const config = (exercise as any)[key];
    if (!config) return;
    const seq = [...(config.sequence || [])];
    seq[idx] = { ...seq[idx], ...updates };
    handleUpdate({ [key]: { ...config, sequence: seq } });
  };

  // MEJORA: Propagar configuración del primer ítem a toda la secuencia
  const propagateSequence = () => {
    const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
    const config = (exercise as any)[key];
    if (!config || !config.sequence || config.sequence.length === 0) return;
    const first = config.sequence[0];
    const newSeq = config.sequence.map((item: any) => ({
      ...item,
      targetLoad: first.targetLoad,
      targetReps: first.targetReps
    }));
    handleUpdate({ [key]: { ...config, sequence: newSeq } });
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

      <div className="p-8 space-y-8 relative">
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-[0.03] pointer-events-none rounded-full ${currentMethod.color}`} />

        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white/[0.02] p-6 rounded-[32px] border border-white/5">
            <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Ajustes de este bloque</p>
                <h3 className="text-xl font-black uppercase italic text-white leading-none">{exercise.name || 'Seleccionar...'}</h3>
            </div>
            
            <div className="flex gap-4">
                <div className="bg-black/60 px-5 py-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4">
                    <span className="text-[9px] font-black text-white/40 uppercase">Sets:</span>
                    <div className="flex items-center gap-4">
                        <button onClick={() => handleUpdate({ targetSets: Math.max(1, (exercise.targetSets || 1) - 1) })} className="text-white/40 hover:text-white font-black text-xl">-</button>
                        <input type="number" className="bg-transparent text-white font-black w-10 outline-none text-center text-xl" value={exercise.targetSets || 1} onChange={e => handleUpdate({ targetSets: parseInt(e.target.value) || 1 })} />
                        <button onClick={() => handleUpdate({ targetSets: (exercise.targetSets || 1) + 1 })} className="text-white/40 hover:text-white font-black text-xl">+</button>
                    </div>
                </div>

                <div className="bg-black/60 px-5 py-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-4">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Rest:</span>
                    <div className="flex items-center gap-2">
                        <input type="number" className="bg-transparent text-red-600 font-black w-12 outline-none text-center text-xl" value={exercise.targetRest || 0} onChange={e => handleUpdate({ targetRest: parseInt(e.target.value) || 0 })} />
                        <span className="text-[8px] font-black text-white/20">S</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Módulo Principal (A)</label>
                <select className="w-full bg-[#151518] border border-white/10 rounded-[24px] p-5 text-white text-lg font-black italic uppercase outline-none focus:border-white/40" value={exercise.exerciseId} onChange={e => {
                    const sel = allExercises.find(x => x.id === e.target.value);
                    if (sel) handleUpdate({ exerciseId: sel.id, name: sel.name, videoUrl: sel.videoUrl });
                }}>
                  {Object.keys(groupedExercises).map(cat => (
                    <optgroup key={cat} label={cat.toUpperCase()} className="bg-[#0F0F11]">
                      {groupedExercises[cat].map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </optgroup>
                  ))}
                </select>
            </div>

            {exercise.method === 'biserie' && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Módulo Pareja (B)</label>
                    <select className="w-full bg-[#151518] border border-blue-500/20 rounded-[24px] p-5 text-white text-lg font-black italic uppercase outline-none focus:border-blue-500/40" value={exercise.pair?.exerciseId || ''} onChange={e => {
                        const sel = allExercises.find(x => x.id === e.target.value);
                        if (sel) handleUpdate({ pair: { exerciseId: sel.id, name: sel.name, targetReps: '10', targetLoad: '0', videoUrl: sel.videoUrl } });
                    }}>
                      <option value="">-- SELECCIONAR B --</option>
                      {allExercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                </div>
            )}
        </div>

        {/* MATRIZ DE RENDIMIENTO (Diferenciada para Biserie) */}
        {(exercise.method === 'ahap' || exercise.method === 'standard' || exercise.method === 'biserie') && (
            <div className={`bg-black/40 p-6 rounded-[32px] border border-white/5 space-y-6`}>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] text-center italic">Matriz de Rendimiento Individual</p>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {Array.from({ length: exercise.targetSets || 1 }).map((_, i) => (
                        <div key={i} className={`shrink-0 ${exercise.method === 'biserie' ? 'w-48' : 'w-32'} space-y-3`}>
                            <p className="text-[9px] font-black text-white/10 uppercase text-center">SET {i+1}</p>
                            <div className="bg-[#121215] p-3 rounded-2xl border border-white/5 space-y-4 group/set hover:border-white/20 transition-colors">
                                
                                {/* Ejercicio A */}
                                <div className="space-y-2">
                                    {exercise.method === 'biserie' && <p className="text-[7px] font-black text-white/40 uppercase ml-1">Ejercicio A</p>}
                                    <div className="relative">
                                        <span className="absolute top-1/2 -translate-y-1/2 left-2 text-[7px] font-black text-white/20">KG</span>
                                        <input type="text" className="w-full bg-transparent text-center text-xl font-black text-yellow-500 outline-none" value={(exercise.targetLoad || '').split(',')[i]?.trim() || '0'} onChange={e => updateMatrixValue('targetLoad', i, e.target.value)} placeholder="0" />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute top-1/2 -translate-y-1/2 left-2 text-[7px] font-black text-white/20">REPS</span>
                                        <input type="text" className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-center text-xs font-black text-white outline-none" value={(exercise.targetReps || '').split(',')[i]?.trim() || '10'} onChange={e => updateMatrixValue('targetReps', i, e.target.value)} placeholder="10" />
                                    </div>
                                </div>

                                {/* Ejercicio B (Solo Biserie) */}
                                {exercise.method === 'biserie' && exercise.pair && (
                                    <div className="pt-3 border-t border-white/10 space-y-2">
                                        <p className="text-[7px] font-black text-blue-500 uppercase ml-1">Ejercicio B</p>
                                        <div className="relative">
                                            <span className="absolute top-1/2 -translate-y-1/2 left-2 text-[7px] font-black text-white/20">KG</span>
                                            <input type="text" className="w-full bg-transparent text-center text-xl font-black text-blue-400 outline-none" value={(exercise.pair.targetLoad || '').split(',')[i]?.trim() || '0'} onChange={e => updateMatrixValue('targetLoad', i, e.target.value, true)} placeholder="0" />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute top-1/2 -translate-y-1/2 left-2 text-[7px] font-black text-white/20">REPS</span>
                                            <input type="text" className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-center text-xs font-black text-white outline-none" value={(exercise.pair.targetReps || '').split(',')[i]?.trim() || '10'} onChange={e => updateMatrixValue('targetReps', i, e.target.value, true)} placeholder="10" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* DROIPSET / INTERVALOS (Se mantienen con mejoras de UX) */}
        {exercise.method === 'dropset' && (
            <div className="bg-purple-900/5 border border-purple-500/10 p-6 rounded-[32px] space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Drop Matrix Engineering</p>
                    <button onClick={() => {
                        const newDrops = [...(exercise.dropsetConfig?.drops || []), { weight: '0', reps: 'Fallo' }];
                        handleUpdate({ dropsetConfig: { ...exercise.dropsetConfig!, drops: newDrops } });
                    }} className="text-[9px] font-black bg-purple-600 px-5 py-3 rounded-xl text-white shadow-lg">+ DROP</button>
                </div>
                <div className="overflow-x-auto no-scrollbar rounded-3xl border border-white/5 bg-black/40">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-[8px] font-black text-white/30 uppercase tracking-widest">
                                <th className="p-4">Set</th>
                                <th className="p-4 text-purple-400">Base (KG)</th>
                                {exercise.dropsetConfig?.drops.map((_, idx) => (
                                    <th key={idx} className="p-4 text-purple-300/50">Drop {idx+1}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: exercise.targetSets || 1 }).map((_, sIdx) => (
                                <tr key={sIdx} className="border-b border-white/5">
                                    <td className="p-4 text-[10px] font-black text-white/10 italic">{sIdx+1}</td>
                                    <td className="p-3">
                                        <input type="text" className="w-16 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center text-xs font-black text-white" value={(exercise.targetLoad || '').split(',')[sIdx]?.trim() || '0'} onChange={e => updateMatrixValue('targetLoad', sIdx, e.target.value)} />
                                    </td>
                                    {exercise.dropsetConfig?.drops.map((d, dIdx) => (
                                        <td key={dIdx} className="p-3">
                                            <input type="text" className="w-16 bg-black/40 border border-white/5 rounded-xl p-3 text-center text-xs font-black text-purple-300/60" value={(d.weight || '').split(',')[sIdx]?.trim() || '0'} onChange={() => {}} /* Drop weight logic... */ />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {(exercise.method === 'emom' || exercise.method === 'tabata') && (
            <div className="space-y-8 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-cyan-900/5 p-8 rounded-[40px] border border-cyan-500/10">
                        <label className="text-[10px] font-black text-white/30 uppercase block mb-6 tracking-widest">{exercise.method === 'emom' ? 'Duración Máxima (MIN)' : 'Rondas Totales (RND)'}</label>
                        <div className="flex items-end gap-3">
                          <input type="number" className="bg-transparent text-6xl font-black text-white outline-none w-28" value={exercise.method === 'emom' ? (exercise.emomConfig?.durationMin || 1) : (exercise.tabataConfig?.rounds || 1)} onChange={e => {
                              const val = parseInt(e.target.value) || 1;
                              if(exercise.method === 'emom') handleUpdate({ targetSets: val, emomConfig: { ...(exercise.emomConfig || { sequence: [] }), durationMin: val } });
                              else handleUpdate({ targetSets: val, tabataConfig: { ...(exercise.tabataConfig || { rounds: val, workTimeSec: 20, restTimeSec: 10, sequence: [] }), rounds: val } });
                          }}/>
                          <span className="text-sm font-black text-white/10 mb-2 uppercase">{exercise.method === 'emom' ? 'MINUTOS' : 'RONDAS'}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Sequence Architecture</p>
                        <div className="flex gap-2">
                            <button onClick={propagateSequence} className="text-[8px] font-black bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl text-white/40 hover:text-white border border-white/5 uppercase tracking-widest transition-all">Propagar Cargas ⚡</button>
                            <button onClick={() => {
                                const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
                                const config = (exercise as any)[key] || { sequence: [] };
                                const newItem = { exerciseId: allExercises[0].id, name: allExercises[0].name, targetReps: '10', targetLoad: '0' };
                                handleUpdate({ [key]: { ...config, sequence: [...(config.sequence || []), newItem] } });
                            }} className="text-[9px] font-black bg-cyan-600 px-6 py-3 rounded-xl text-white shadow-xl hover:scale-105 active:scale-95 transition-all">+ ITEM</button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(exercise.method === 'emom' ? exercise.emomConfig?.sequence : exercise.tabataConfig?.sequence)?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-[#151518] p-5 rounded-[28px] border border-white/5 group/item">
                                <span className="text-[11px] font-black text-white/10 w-8 italic">#{idx + 1}</span>
                                <select className="flex-1 bg-transparent text-xs font-black uppercase text-white outline-none cursor-pointer" value={item.exerciseId} onChange={e => {
                                    const sel = allExercises.find(x => x.id === e.target.value);
                                    if(sel) updateIntervalItem(idx, { exerciseId: sel.id, name: sel.name });
                                }}>
                                    {allExercises.map(ex => <option key={ex.id} value={ex.id} className="bg-black text-white">{ex.name}</option>)}
                                </select>
                                <div className="flex gap-3">
                                  <input type="text" className="w-20 bg-black/40 border border-white/5 rounded-xl p-3 text-center text-xs font-black text-cyan-400" value={item.targetLoad} onChange={e => updateIntervalItem(idx, { targetLoad: e.target.value })} placeholder="KG"/>
                                  <input type="text" className="w-20 bg-black/40 border border-white/5 rounded-xl p-3 text-center text-xs font-black text-white" value={item.targetReps} onChange={e => updateIntervalItem(idx, { targetReps: e.target.value })} placeholder="REPS"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
