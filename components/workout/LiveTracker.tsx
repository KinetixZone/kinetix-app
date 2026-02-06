import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Workout, ProgressState, WorkoutLog, WorkoutExercise } from '../../types/kinetix';
import { soundService } from '../../services/soundService';
import { storageService } from '../../services/storageService';

interface Props {
  workout: Workout;
  onFinish: (data: ProgressState) => void;
  user?: any;
}

const getYoutubeId = (url: string | undefined) => {
    if (!url || typeof url !== 'string') return null;
    const cleanUrl = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const extractValueFromMatrix = (input: string | undefined, setIndex: number): string => {
    if (!input) return '--';
    const parts = input.split(',').map(s => s.trim()).filter(s => s !== '');
    if (parts.length === 0) return '--';
    // Lógica de fill-forward: si el set actual no tiene valor definido, usa el último disponible
    return parts[setIndex] || parts[parts.length - 1] || '--';
};

const parseWeightValue = (input: string | undefined): number => {
    if (!input) return 0;
    const clean = input.toString().replace(/,/g, '.').replace(/[^0-9.]/g, ''); 
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
};

interface TrackingRow {
    type: 'base' | 'drop' | 'interval' | 'pair' | 'chain';
    label: string;
    targetWeight: string;
    targetReps: string;
    exerciseName?: string; 
    exerciseId: string; 
    globalIndex: number; 
}

const generateTrackingRows = (ex: WorkoutExercise): TrackingRow[] => {
    const rows: TrackingRow[] = [];
    let counter = 0;
    
    if (ex.method === 'emom' || ex.method === 'tabata') {
        const isEmom = ex.method === 'emom';
        const totalUnits = (isEmom ? ex.emomConfig?.durationMin : ex.tabataConfig?.rounds) || ex.targetSets || 8;
        const sequence = (isEmom ? ex.emomConfig?.sequence : ex.tabataConfig?.sequence) || [];
        
        for (let i = 0; i < totalUnits; i++) {
             const seqItem = sequence.length > 0 ? sequence[i % sequence.length] : null;
             rows.push({ 
                type: 'interval', 
                label: isEmom ? `Min ${i + 1}` : `Rnd ${i + 1}`, 
                targetWeight: seqItem?.targetLoad || ex.targetLoad || '0', 
                targetReps: seqItem?.targetReps || ex.targetReps || '10', 
                exerciseName: seqItem?.name || ex.name, 
                exerciseId: seqItem?.exerciseId || ex.exerciseId,
                globalIndex: counter++ 
             });
        }
        return rows;
    }

    if (ex.method === 'biserie' && ex.pair) {
        for (let i = 0; i < (ex.targetSets || 3); i++) {
            rows.push({ type: 'pair', label: `A${i + 1}`, targetWeight: extractValueFromMatrix(ex.targetLoad, i), targetReps: extractValueFromMatrix(ex.targetReps, i), exerciseName: ex.name, exerciseId: ex.exerciseId, globalIndex: counter++ });
            rows.push({ type: 'pair', label: `B${i + 1}`, targetWeight: extractValueFromMatrix(ex.pair.targetLoad, i), targetReps: extractValueFromMatrix(ex.pair.targetReps, i), exerciseName: ex.pair.name, exerciseId: ex.pair.exerciseId, globalIndex: counter++ });
        }
        return rows;
    }

    for (let i = 0; i < (ex.targetSets || 3); i++) {
        rows.push({ type: 'base', label: `Set ${i + 1}`, targetWeight: extractValueFromMatrix(ex.targetLoad, i), targetReps: extractValueFromMatrix(ex.targetReps, i), exerciseName: ex.name, exerciseId: ex.exerciseId, globalIndex: counter++ });
        
        if (ex.method === 'dropset' && ex.dropsetConfig?.drops) {
            ex.dropsetConfig.drops.forEach((drop, dIdx) => {
                rows.push({ type: 'drop', label: `Drop ${dIdx + 1}`, targetWeight: extractValueFromMatrix(drop.weight, i), targetReps: drop.reps, exerciseName: ex.name, exerciseId: ex.exerciseId, globalIndex: counter++ });
            });
        }
    }
    return rows;
};

export const LiveTracker: React.FC<Props> = ({ workout: activeWorkout, onFinish, user }) => {
  const STORAGE_KEY = `kinetix_live_v17_${user?.id || 'guest'}_${activeWorkout?.id}`;
  
  const [progress, setProgress] = useState<ProgressState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { currentExerciseIndex: 0, completedSets: 0, isPairTurn: false, subIndex: 0, performanceData: {}, workoutLogs: [], emomCurrentMin: 1, tabataCurrentRound: 1, tabataCurrentSet: 1 };
  });

  const [expandedExId, setExpandedExId] = useState<string | null>(activeWorkout?.exercises?.[0]?.exerciseId || null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }, [progress, STORAGE_KEY]);
  useEffect(() => { timerRef.current = window.setInterval(() => setElapsedTime(p => p + 1), 1000); return () => clearInterval(timerRef.current); }, []);

  const handleInput = (exBlockId: string, uniqueIdx: number, field: 'reps' | 'weight', value: string) => {
    const numVal = value === '' ? 0 : parseFloat(value);
    setProgress(prev => {
        const currentData = prev.performanceData[exBlockId] || { weights: [], reps: [] };
        const newReps = [...(currentData.reps || [])];
        const newWeights = [...(currentData.weights || [])];
        if (field === 'reps') newReps[uniqueIdx] = numVal;
        if (field === 'weight') newWeights[uniqueIdx] = numVal;
        return { ...prev, performanceData: { ...prev.performanceData, [exBlockId]: { ...currentData, reps: newReps, weights: newWeights } } };
    });
  };

  const toggleSet = (exBlockId: string, row: TrackingRow, targetWeightStr: string) => {
    const isDone = progress.workoutLogs.some(l => l.exerciseId === row.exerciseId && l.setIndex === row.globalIndex);
    if (isDone) {
        setProgress(prev => ({ ...prev, workoutLogs: prev.workoutLogs.filter(l => !(l.exerciseId === row.exerciseId && l.setIndex === row.globalIndex)) }));
    } else {
        const manualWeight = progress.performanceData[exBlockId]?.weights?.[row.globalIndex];
        const detectedWeight = manualWeight && manualWeight > 0 ? manualWeight : parseWeightValue(targetWeightStr);
        const log: WorkoutLog = {
            exerciseId: row.exerciseId, setIndex: row.globalIndex, weight: detectedWeight, reps: progress.performanceData[exBlockId]?.reps[row.globalIndex] || 0,
            timestamp: new Date().toISOString(), isPR: false
        };
        soundService.playTone(800, 0.1);
        setProgress(prev => ({ ...prev, workoutLogs: [...prev.workoutLogs, log] }));
    }
  };

  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs.toString().padStart(2, '0')}`; };

  if (showFinishModal) return (
      <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center p-6 text-white text-center space-y-6">
          <div className="text-6xl animate-bounce">🔥</div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Misión Cumplida</h1>
          <button onClick={() => { localStorage.removeItem(STORAGE_KEY); onFinish(progress); }} className="w-full py-5 bg-red-600 rounded-full font-black uppercase tracking-widest shadow-2xl transition-transform active:scale-95">Guardar Registro</button>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-32">
        <div className="fixed top-0 left-0 w-full bg-[#050507]/95 backdrop-blur-xl border-b border-white/10 z-50 px-6 py-4 flex justify-between items-center">
             <div className="flex flex-col">
                 <h1 className="text-[9px] font-black uppercase italic text-white/40 tracking-[0.3em] truncate max-w-[180px]">{activeWorkout.publicTitle || activeWorkout.name}</h1>
                 <span className="font-mono text-xl font-black text-white">{formatTime(elapsedTime)}</span>
             </div>
             <button onClick={() => setShowFinishModal(true)} className="bg-white text-black px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200">Finalizar</button>
        </div>

        <div className="pt-24 px-4 max-w-2xl mx-auto space-y-4">
            {activeWorkout.exercises.map((ex, i) => {
                const isExpanded = expandedExId === ex.exerciseId;
                const trackingRows = generateTrackingRows(ex);
                const blockLogs = progress.workoutLogs.filter(l => {
                    const relatedIds = [ex.exerciseId, ex.pair?.exerciseId, ...(ex.emomConfig?.sequence?.map(s => s.exerciseId) || []), ...(ex.tabataConfig?.sequence?.map(s => s.exerciseId) || [])].filter(Boolean);
                    return relatedIds.includes(l.exerciseId);
                });
                const isComplete = blockLogs.length >= trackingRows.length;
                const videoId = getYoutubeId(ex.videoUrl);

                return (
                    <div key={`${ex.exerciseId}-${i}`} className={`rounded-[30px] border transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-[#121215] border-red-600/50 shadow-2xl' : isComplete ? 'bg-[#0A0A0C] border-green-900/30 opacity-60' : 'bg-[#0F0F11] border-white/5'}`}>
                        <div onClick={() => setExpandedExId(isExpanded ? null : ex.exerciseId)} className="p-5 flex items-center justify-between cursor-pointer active:bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ${isComplete ? 'bg-green-600' : 'bg-white/5 text-white/20'}`}>{isComplete ? '✓' : i + 1}</div>
                                <div>
                                    <h3 className="text-sm font-black uppercase italic">{ex.name}</h3>
                                    <p className="text-[8px] font-black text-white/20 uppercase mt-1">{blockLogs.length}/{trackingRows.length} MÓDULOS • {ex.targetRest}s REST</p>
                                </div>
                            </div>
                            <span className={`text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>

                        {isExpanded && (
                            <div className="border-t border-white/5 p-4 space-y-3">
                                {videoId && (
                                    <div className="mb-4 aspect-video rounded-2xl overflow-hidden bg-black">
                                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    {trackingRows.map((row) => {
                                        const isSetDone = progress.workoutLogs.some(l => l.exerciseId === row.exerciseId && l.setIndex === row.globalIndex);
                                        const rVal = progress.performanceData[ex.exerciseId]?.reps?.[row.globalIndex];
                                        const wVal = progress.performanceData[ex.exerciseId]?.weights?.[row.globalIndex];

                                        return (
                                            <div key={row.globalIndex} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isSetDone ? 'bg-green-600/10 border-green-500/20' : 'bg-white/5 border-white/5'}`}>
                                                <div className="w-10 text-center flex flex-col justify-center shrink-0">
                                                    <span className="text-[10px] font-black uppercase text-white/40">{row.label}</span>
                                                </div>
                                                <div className="flex-1 flex flex-col min-w-0">
                                                    <p className="text-[7px] font-black text-white/30 uppercase truncate">{row.exerciseName || ex.name}</p>
                                                    <div className="flex gap-2 items-end">
                                                        <div className="flex-1">
                                                            <input type="number" inputMode="decimal" className="w-full bg-transparent text-sm font-black text-white outline-none border-b border-white/10" placeholder={row.targetWeight} value={wVal || ''} onChange={(e) => handleInput(ex.exerciseId, row.globalIndex, 'weight', e.target.value)}/>
                                                            <span className="text-[7px] font-black text-white/20 uppercase">OBJ: {row.targetWeight} KG</span>
                                                        </div>
                                                        <div className="w-14">
                                                            <input type="number" inputMode="decimal" className="w-full bg-black/40 border border-white/10 rounded-lg py-2 text-center text-sm font-black text-white" placeholder={row.targetReps} value={rVal || ''} onChange={(e) => handleInput(ex.exerciseId, row.globalIndex, 'reps', e.target.value)}/>
                                                            <span className="text-[7px] font-black text-white/20 uppercase block text-center">REPS</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => toggleSet(ex.exerciseId, row, row.targetWeight)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isSetDone ? 'bg-green-600 text-white' : 'bg-white/10 text-white/20'}`}>
                                                    {isSetDone ? '✓' : 'OK'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};
