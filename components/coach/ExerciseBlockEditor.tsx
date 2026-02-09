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

        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${currentMethod.color}`} />
                  Módulo Principal
              </label>
              <span className="text-[8px] font-black text-white/10 uppercase tracking-widest">{exercise.method} ACTIVE</span>
            </div>
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
        </div>

        {exercise.method === 'ahap' && (
            <div className="bg-yellow-900/[0.03] border border-yellow-500/10 p-8 rounded-[40px] space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] italic">Telemetry Matrix AHAP</p>
                    <div className="flex gap-4">
                        <span className="text-[8px] font-black text-yellow-500/40 uppercase">Yellow: KG</span>
                        <span className="text-[8px] font-black text-white/40 uppercase">White: REPS</span>
                    </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {Array.from({ length: exercise.targetSets || 3 }).map((_, sIdx) => (
                        <div key={sIdx} className="shrink-0 w-32">
                            <div className="bg-black/40 p-4 rounded-3xl border border-white/5 flex flex-col gap-3">
                                <span className="text-[9px] font-black text-white/20 uppercase text-center">SET {sIdx + 1}</span>
                                
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-yellow-500/40 uppercase block ml-2">Carga (KG)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center text-xl font-black text-yellow-500 outline-none focus:border-yellow-500" 
                                        value={(exercise.targetLoad || '').split(',')[sIdx]?.trim() || ''} 
                                        onChange={e => updateMatrixLoad(sIdx, e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-white/20 uppercase block ml-2">Volumen (REPS)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-center text-sm font-black text-white outline-none focus:border-white/40" 
                                        value={(exercise.targetReps || '').split(',')[sIdx]?.trim() || ''} 
                                        onChange={e => updateMatrixReps(sIdx, e.target.value)}
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {(exercise.method === 'tabata' || exercise.method === 'emom') && (
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
                        <button onClick={() => {
                            const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
                            const config = (exercise as any)[key] || { sequence: [] };
                            const newItem = { exerciseId: allExercises[0].id, name: allExercises[0].name, targetReps: '10', targetLoad: '0', videoUrl: allExercises[0].videoUrl };
                            handleUpdate({ [key]: { ...config, sequence: [...(config.sequence || []), newItem] } });
                        }} className="text-[9px] font-black bg-white/10 px-5 py-2.5 rounded-xl">+ ADD ITEM</button>
                    </div>
                    <div className="space-y-3">
                        {(exercise.method === 'emom' ? exercise.emomConfig?.sequence : exercise.tabataConfig?.sequence)?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-[#151518] p-4 rounded-3xl border border-white/5">
                                <span className="text-[11px] font-black text-white/10 w-6 italic">#{idx + 1}</span>
                                <select className="flex-1 bg-transparent text-xs font-black uppercase text-white outline-none" value={item.exerciseId} onChange={e => {
                                    const sel = allExercises.find(x => x.id === e.target.value);
                                    if(sel) {
                                        const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
                                        const config = (exercise as any)[key];
                                        const seq = [...config.sequence];
                                        seq[idx] = { ...seq[idx], exerciseId: sel.id, name: sel.name, videoUrl: sel.videoUrl };
                                        handleUpdate({ [key]: { ...config, sequence: seq } });
                                    }
                                }}>
                                    {allExercises.map(ex => <option key={ex.id} value={ex.id} className="bg-black text-white">{ex.name}</option>)}
                                </select>
                                <div className="flex gap-2">
                                  <input type="text" className="w-16 bg-black/40 border border-white/5 rounded-xl p-2.5 text-center text-xs font-black text-white" value={item.targetLoad} onChange={e => {
                                      const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
                                      const config = (exercise as any)[key];
                                      const seq = [...config.sequence];
                                      seq[idx] = { ...seq[idx], targetLoad: e.target.value };
                                      handleUpdate({ [key]: { ...config, sequence: seq } });
                                  }} placeholder="KG"/>
                                  <input type="text" className="w-16 bg-black/40 border border-white/5 rounded-xl p-2.5 text-center text-xs font-black text-white" value={item.targetReps} onChange={e => {
                                      const key = exercise.method === 'emom' ? 'emomConfig' : 'tabataConfig';
                                      const config = (exercise as any)[key];
                                      const seq = [...config.sequence];
                                      seq[idx] = { ...seq[idx], targetReps: e.target.value };
                                      handleUpdate({ [key]: { ...config, sequence: seq } });
                                  }} placeholder="REPS"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
            <div className="bg-[#121215] p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
                <label className="text-[8px] font-black text-white/20 uppercase block mb-2">Sets Totales</label>
                <input type="number" className="w-full bg-transparent text-3xl font-black text-white outline-none" value={exercise.targetSets} onChange={e => handleUpdate({ targetSets: parseInt(e.target.value) })}/>
            </div>
            <div className="bg-[#121215] p-5 rounded-3xl border border-white/5 flex flex-col justify-between">
                <label className="text-[8px] font-black text-white/20 uppercase block mb-2">Rest (sec)</label>
                <input type="number" className="w-full bg-transparent text-3xl font-black text-red-600 outline-none" value={exercise.targetRest} onChange={e => handleUpdate({ targetRest: parseInt(e.target.value) })}/>
            </div>
        </div>
      </div>
    </div>
  );
};
