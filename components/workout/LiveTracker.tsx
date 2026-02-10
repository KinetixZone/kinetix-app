import React, { useState, useEffect, useMemo } from 'react';
import { Workout, ProgressState, WorkoutLog, WorkoutExercise } from '../../types/kinetix';
import { soundService } from '../../services/soundService';

interface Props {
  workout: Workout;
  onFinish: (data: ProgressState) => void;
  user?: any;
}

const parseWeightValue = (input: string | undefined): number => {
    if (!input) return 0;
    const clean = input.toString().replace(/,/g, '.').replace(/[^0-9.]/g, ''); 
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
};

interface TrackingRow {
    type: 'base' | 'drop' | 'interval' | 'pair';
    label: string;
    targetWeight: string;
    targetReps: string;
    exerciseName: string;
    exerciseId: string;
    globalIndex: number;
    videoUrl?: string;
}

const generateTrackingRows = (ex: WorkoutExercise): TrackingRow[] => {
    const rows: TrackingRow[] = [];
    let counter = 0;

    if (ex.method === 'emom' || ex.method === 'tabata') {
        const isEmom = ex.method === 'emom';
        const totalUnits = (isEmom ? ex.emomConfig?.durationMin : ex.tabataConfig?.rounds) || 8;
        const sequence = (isEmom ? ex.emomConfig?.sequence : ex.tabataConfig?.sequence) || [];
        for (let i = 0; i < totalUnits; i++) {
            const step = sequence[i % sequence.length] || { exerciseId: ex.exerciseId, name: ex.name, targetReps: '10' };
            rows.push({ 
                type: 'interval', 
                label: isEmom ? `Min ${i+1}` : `Rnd ${i+1}`, 
                targetWeight: step.targetLoad || '0', 
                targetReps: step.targetReps || '10', 
                exerciseName: step.name, 
                exerciseId: step.exerciseId, 
                globalIndex: counter++, 
                videoUrl: step.videoUrl 
            });
        }
        return rows;
    }

    if (ex.method === 'biserie' && ex.pair) {
        for (let i = 0; i < (ex.targetSets || 3); i++) {
            // Fila para Ejercicio A
            rows.push({ 
                type: 'pair', 
                label: `A - Set ${i+1}`, 
                targetWeight: ex.targetLoad?.split(',')[i]?.trim() || '0', 
                targetReps: ex.targetReps?.split(',')[i]?.trim() || '10', 
                exerciseName: ex.name, 
                exerciseId: ex.exerciseId, 
                globalIndex: counter++, 
                videoUrl: ex.videoUrl 
            });
            // Fila para Ejercicio B con su propia matriz
            rows.push({ 
                type: 'pair', 
                label: `B - Set ${i+1}`, 
                targetWeight: ex.pair.targetLoad?.split(',')[i]?.trim() || '0', 
                targetReps: ex.pair.targetReps?.split(',')[i]?.trim() || '10', 
                exerciseName: ex.pair.name, 
                exerciseId: ex.pair.exerciseId, 
                globalIndex: counter++, 
                videoUrl: ex.pair.videoUrl 
            });
        }
        return rows;
    }

    if (ex.method === 'dropset' && ex.dropsetConfig) {
        for (let i = 0; i < (ex.targetSets || 3); i++) {
            rows.push({ 
                type: 'base', 
                label: `Set ${i+1}`, 
                targetWeight: ex.targetLoad?.split(',')[i]?.trim() || '0', 
                targetReps: ex.targetReps?.split(',')[i]?.trim() || '10', 
                exerciseName: ex.name, 
                exerciseId: ex.exerciseId, 
                globalIndex: counter++, 
                videoUrl: ex.videoUrl 
            });
            ex.dropsetConfig.drops.forEach((d, dIdx) => {
                rows.push({ 
                    type: 'drop', 
                    label: `Drop ${dIdx+1}`, 
                    targetWeight: d.weight.split(',')[i]?.trim() || '0', 
                    targetReps: d.reps.split(',')[i]?.trim() || '10', 
                    exerciseName: ex.name, 
                    exerciseId: ex.exerciseId, 
                    globalIndex: counter++, 
                    videoUrl: ex.videoUrl 
                });
            });
        }
        return rows;
    }

    for (let i = 0; i < (ex.targetSets || 3); i++) {
        rows.push({ 
            type: 'base', 
            label: `Set ${i+1}`, 
            targetWeight: ex.targetLoad?.split(',')[i]?.trim() || '0', 
            targetReps: ex.targetReps?.split(',')[i]?.trim() || '10', 
            exerciseName: ex.name, 
            exerciseId: ex.exerciseId, 
            globalIndex: counter++, 
            videoUrl: ex.videoUrl 
        });
    }
    return rows;
};

export const LiveTracker: React.FC<Props> = ({ workout, onFinish, user }) => {
  const [progress, setProgress] = useState<ProgressState>({ currentExerciseIndex: 0, completedSets: 0, isPairTurn: false, subIndex: 0, performanceData: {}, workoutLogs: [], emomCurrentMin: 1, tabataCurrentRound: 1, tabataCurrentSet: 1 });
  const [expandedId, setExpandedId] = useState<string | null>(workout.exercises[0]?.exerciseId);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => { const t = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(t); }, []);

  const handleLog = (exId: string, row: TrackingRow) => {
      const isDone = progress.workoutLogs.some(l => l.exerciseId === row.exerciseId && l.setIndex === row.globalIndex);
      if (isDone) {
          setProgress(p => ({ ...p, workoutLogs: p.workoutLogs.filter(l => !(l.exerciseId === row.exerciseId && l.setIndex === row.globalIndex)) }));
      } else {
          const manualW = progress.performanceData[exId]?.weights[row.globalIndex];
          const manualR = progress.performanceData[exId]?.reps[row.globalIndex];
          
          const log: WorkoutLog = {
              exerciseId: row.exerciseId,
              setIndex: row.globalIndex,
              weight: manualW !== undefined && manualW > 0 ? manualW : parseWeightValue(row.targetWeight),
              reps: manualR !== undefined && manualR > 0 ? manualR : parseWeightValue(row.targetReps),
              timestamp: new Date().toISOString(),
              isPR: false
          };
          soundService.playTone(800, 0.1);
          setProgress(p => ({ ...p, workoutLogs: [...p.workoutLogs, log] }));
      }
  };

  const updateInput = (exId: string, idx: number, field: 'weights' | 'reps', val: string) => {
      setProgress(p => {
          const exData = p.performanceData[exId] || { weights: [], reps: [] };
          const newArr = [...(exData[field] || [])];
          newArr[idx] = parseFloat(val);
          return { ...p, performanceData: { ...p.performanceData, [exId]: { ...exData, [field]: newArr } } };
      });
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-32">
        <div className="sticky top-0 z-50 bg-[#050507]/90 backdrop-blur-md p-6 border-b border-white/5 flex justify-between items-center px-8">
            <div>
                <h1 className="text-[10px] font-black uppercase text-white/30 tracking-widest">{workout.publicTitle || workout.name}</h1>
                <p className="text-xl font-black italic">{Math.floor(elapsed/60)}:{(elapsed%60).toString().padStart(2,'0')}</p>
            </div>
            <button onClick={() => onFinish(progress)} className="px-6 py-2.5 bg-red-600 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">Finalizar</button>
        </div>

        <div className="p-4 space-y-4 max-w-xl mx-auto">
            {workout.exercises.map((ex, i) => {
                const rows = generateTrackingRows(ex);
                const isExpanded = expandedId === ex.exerciseId;
                const completedCount = progress.workoutLogs.filter(l => l.exerciseId === ex.exerciseId || (ex.pair && l.exerciseId === ex.pair.exerciseId)).length;
                const isAllDone = completedCount >= rows.length;

                return (
                    <div key={i} className={`rounded-[32px] border transition-all ${isExpanded ? 'bg-[#121215] border-white/20 shadow-2xl scale-[1.01]' : isAllDone ? 'bg-black opacity-40 border-green-900/30' : 'bg-[#0F0F11] border-white/5'}`}>
                        <div onClick={() => setExpandedId(isExpanded ? null : ex.exerciseId)} className="p-6 flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black ${isAllDone ? 'bg-green-600' : 'bg-white/5'}`}>{isAllDone ? '✓' : i + 1}</div>
                                <div><h3 className="text-sm font-black uppercase italic">{ex.name}</h3><p className="text-[9px] text-white/20 uppercase font-black">{completedCount}/{rows.length} Estaciones</p></div>
                            </div>
                            <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                        </div>

                        {isExpanded && (
                            <div className="p-4 border-t border-white/5 space-y-3 bg-black/20">
                                {rows.map((row, rIdx) => {
                                    const log = progress.workoutLogs.find(l => l.exerciseId === row.exerciseId && l.setIndex === row.globalIndex);
                                    return (
                                        <div key={rIdx} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${log ? 'bg-green-600/10 border-green-500/30' : 'bg-black border-white/5'}`}>
                                            <div className="w-16 text-center flex flex-col items-center">
                                                <p className="text-[7px] font-black text-white/30 uppercase leading-none mb-1">{row.label}</p>
                                                {row.type === 'pair' && <span className="text-[6px] text-blue-500 font-black">BI-S</span>}
                                            </div>
                                            <div className="flex-1 flex gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute -top-3 left-0 text-[6px] text-white/20 uppercase font-black">KG</span>
                                                    <input type="number" placeholder={row.targetWeight} className="w-full bg-transparent text-lg font-black text-white outline-none border-b border-white/5" value={progress.performanceData[ex.exerciseId]?.weights[row.globalIndex] || ''} onChange={e => updateInput(ex.exerciseId, row.globalIndex, 'weights', e.target.value)} />
                                                </div>
                                                <div className="relative w-16">
                                                    <span className="absolute -top-3 left-0 text-[6px] text-white/20 uppercase font-black">REPS</span>
                                                    <input type="number" placeholder={row.targetReps} className="w-full bg-transparent text-lg font-black text-white outline-none border-b border-white/5 text-center" value={progress.performanceData[ex.exerciseId]?.reps[row.globalIndex] || ''} onChange={e => updateInput(ex.exerciseId, row.globalIndex, 'reps', e.target.value)} />
                                                </div>
                                            </div>
                                            <button onClick={() => handleLog(ex.exerciseId, row)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${log ? 'bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-95' : 'bg-white/5 hover:bg-white/10 active:scale-90'}`}>
                                                {log ? <span className="text-white font-black text-sm">✓</span> : <span className="text-[10px] font-black opacity-40">OK</span>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};
