import { User, Workout, WorkoutLog, Exercise, BodyMetric, Goal, UserLevel, WorkoutExercise } from '../types/kinetix';
import { EXERCISES_DB } from '../constants/exercises';

interface SystemConfig {
  enableAI: boolean;
  enableCloud: boolean;
}

interface AiBlueprint {
  id: string;
  name: string;
  prompt: string;
  timestamp: string;
}

interface AthleteInsight {
  athleteId: string;
  athleteName: string;
  status: 'optimal' | 'warning' | 'inactive';
  message: string;
  lastActivity: string;
}

export interface MuscleStatus {
  zone: string;
  level: number;
  status: 'optimal' | 'recovering' | 'fatigued';
}

const KEYS = {
  USER: 'kinetix_user',
  SYSTEM_CONFIG: 'kinetix_system_config',
  STAFF_DB: 'kinetix_staff_db',
  ATHLETES_DB: 'kinetix_athletes_db',
  EXERCISE_LIBRARY: 'kinetix_exercise_library',
  WORKOUT_TEMPLATES: 'kinetix_workout_templates',
  LOG_HISTORY: 'kinetix_log_history',
  COMPLETED_SESSIONS: 'kinetix_completed_sessions',
  BODY_METRICS: 'kinetix_body_metrics',
  AI_BLUEPRINTS: 'kinetix_ai_blueprints',
  AI_PROMPT_HISTORY: 'kinetix_ai_prompt_history'
};

const MUSCLE_ZONES: Record<string, string> = {
  'Pecho': 'Push', 'Hombros': 'Push', 'Tríceps': 'Push', 'Deltoides': 'Push',
  'Espalda': 'Pull', 'Bíceps': 'Pull', 'Dorsal': 'Pull', 'Trapecio': 'Pull',
  'Cuádriceps': 'Legs', 'Glúteos': 'Legs', 'Isquiotibiales': 'Legs', 'Pantorrillas': 'Legs',
  'Core': 'Core', 'Abdomen': 'Core', 'Oblicuos': 'Core',
  'Funcional': 'Metabolic', 'Halterofilia': 'Power'
};

// Utility functions for safe localStorage operations
const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
};

const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
};

const safeParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing JSON data:', error);
    return fallback;
  }
};

class StorageService {
  getSystemConfig(): SystemConfig {
    const data = safeGetItem(KEYS.SYSTEM_CONFIG);
    return safeParse(data, { enableAI: true, enableCloud: true });
  }

  saveSystemConfig(config: SystemConfig): boolean {
    const success = safeSetItem(KEYS.SYSTEM_CONFIG, JSON.stringify(config));
    if (success) {
      window.location.reload();
    }
    return success;
  }

  saveUser(user: User): boolean {
    return safeSetItem(KEYS.USER, JSON.stringify(user));
  }

  getUser(): User | null {
    const data = safeGetItem(KEYS.USER);
    return safeParse(data, null);
  }

  logout(): boolean {
    try {
      localStorage.removeItem(KEYS.USER);
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  }

  getStaff(): User[] {
    const data = safeGetItem(KEYS.STAFF_DB);
    return safeParse(data, []);
  }

  saveStaff(staff: User[]): boolean {
    return safeSetItem(KEYS.STAFF_DB, JSON.stringify(staff));
  }

  saveAthletes(athletes: User[]): boolean {
    return safeSetItem(KEYS.ATHLETES_DB, JSON.stringify(athletes));
  }

  getAthletes(): User[] {
    const data = safeGetItem(KEYS.ATHLETES_DB);
    const athletes = safeParse(data, null);

    if (athletes) return athletes;

    // Initialize with default athletes if none exist
    const initialAthletes = this.getInitialAthletes();
    this.saveAthletes(initialAthletes);
    return initialAthletes;
  }

  private getInitialAthletes(): User[] {
    const today = new Date();
    const nextMonth = new Date(); 
    nextMonth.setDate(today.getDate() + 30);

    return [
        {
            id: 'athlete-101', 
            name: 'Alex T. (Demo)', 
            email: 'alex@demo.com', 
            goal: Goal.PERFORMANCE,
            level: UserLevel.ADVANCED, 
            role: 'client', 
            daysPerWeek: 5, 
            streak: 12, 
            createdAt: '2023-01-01',
            equipment: ['Full Gym'], 
            isActive: true, 
            cycleEndDate: nextMonth.toISOString().split('T')[0]
        }
    ];
  }

  getExercises(): Exercise[] {
    const data = safeGetItem(KEYS.EXERCISE_LIBRARY);
    const exercises = safeParse(data, null);

    if (exercises) return exercises;

    // Initialize with default exercises if none exist
    this.saveExercises(EXERCISES_DB);
    return EXERCISES_DB;
  }

  saveExercises(exercises: Exercise[]): boolean {
    return safeSetItem(KEYS.EXERCISE_LIBRARY, JSON.stringify(exercises));
  }

  // MEJORA DE PRIVACIDAD: Los atletas solo ven lo suyo o lo general.
  getTemplates(athleteId?: string): Workout[] {
    const data = safeGetItem(KEYS.WORKOUT_TEMPLATES);
    const allTemplates: Workout[] = safeParse(data, []);

    if (athleteId) {
        return allTemplates.filter(t => 
            t.assignedTo === athleteId || 
            t.assignedTo === 'general' || 
            !t.assignedTo
        );
    }
    return allTemplates;
  }

  saveTemplate(template: Workout): boolean {
    const templates = this.getTemplates();
    const idx = templates.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      templates[idx] = template;
    } else {
      templates.push(template);
    }
    return safeSetItem(KEYS.WORKOUT_TEMPLATES, JSON.stringify(templates));
  }

  cloneWithProgression(workout: Workout, athleteId: string, weeks: number, incrementWeight: number, incrementReps: number): Workout[] {
     const results: Workout[] = [];
     for (let week = 1; week <= weeks; week++) {
         const cloned: Workout = {
             ...workout,
             id: `${workout.id}-w${week}-${athleteId}`,
             name: `${workout.name} - Semana ${week}`,
             assignedTo: athleteId,
             exercises: workout.exercises.map(ex => ({
                 ...ex,
                 targetReps: this.adjustReps(ex.targetReps, week, incrementReps),
                 targetWeight: ex.targetWeight ? ex.targetWeight + (incrementWeight * (week - 1)) : undefined
             }))
         };
         results.push(cloned);
     }
     return results;
  }

  private adjustReps(reps: string, week: number, increment: number): string {
      if (reps.includes('-')) {
          const [min, max] = reps.split('-').map(Number);
          return `${min + increment * (week - 1)}-${max + increment * (week - 1)}`;
      }
      const num = parseInt(reps);
      return isNaN(num) ? reps : (num + increment * (week - 1)).toString();
  }

  saveSessionLogs(logs: WorkoutLog[]): boolean {
    const current = this.getAllLogs();
    return safeSetItem(KEYS.LOG_HISTORY, JSON.stringify([...current, ...logs]));
  }

  getAllLogs(): WorkoutLog[] {
    const data = safeGetItem(KEYS.LOG_HISTORY);
    return safeParse(data, []);
  }

  getMuscleStatus(): MuscleStatus[] {
    const logs = this.getAllLogs();
    const exercises = this.getExercises();
    const today = new Date();
    const status: Record<string, number> = { 
      'Push': 0, 'Pull': 0, 'Legs': 0, 'Core': 0, 'Metabolic': 0 
    };

    logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const daysDiff = (today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 7) return;

        const exercise = exercises.find(e => e.id === log.exerciseId);
        if (exercise?.targetMuscles) {
            exercise.targetMuscles.forEach(muscle => {
                const zone = MUSCLE_ZONES[muscle] || 'Metabolic';
                status[zone] += Math.max(0, 10 - daysDiff);
            });
        }
    });

    return Object.entries(status).map(([zone, level]) => ({
        zone,
        level: Math.min(100, level),
        status: level > 70 ? 'fatigued' : level > 30 ? 'recovering' : 'optimal'
    }));
  }

  // ✅ CORRECCIÓN: Análisis mejorado de insights de atletas
  getAthleteInsights(): AthleteInsight[] {
    const athletes = this.getAthletes();
    const logs = this.getAllLogs();

    return athletes.map(athlete => {
        // Filter logs by athlete and find the most recent one with feedback
        const athleteLogs = logs.filter(l => l.exerciseId && l.feedback !== undefined);
        const lastLog = athleteLogs
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        let status: AthleteInsight['status'] = 'optimal';
        let message = 'Rendimiento estable.';

        if (lastLog && lastLog.feedback) {
            // ✅ CORRECCIÓN: Análisis mejorado del nuevo formato de feedback
            if (typeof lastLog.feedback === 'object') {
                const { rpe, fatigue, notes } = lastLog.feedback;
                
                if (rpe > 8 || fatigue > 7) {
                    status = 'warning';
                    message = `RPE alto (${rpe}/10) o fatiga elevada (${fatigue}/10). ${notes || ''}`;
                } else if (rpe < 4 && fatigue < 3) {
                    status = 'optimal';
                    message = `Excelente recuperación. RPE: ${rpe}/10, Fatiga: ${fatigue}/10.`;
                }
            } else {
                // Compatibilidad con formato anterior
                const feedbackValue = parseInt(lastLog.feedback as string);
                if (feedbackValue > 7) {
                    status = 'warning';
                    message = 'Fatiga alta detectada post-sesión.';
                }
            }
        } else {
            // ✅ CORRECCIÓN: Verificar inactividad
            const recentLogs = logs.filter(l => {
                const logDate = new Date(l.timestamp);
                const daysDiff = (Date.now() - logDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysDiff <= 7;
            });

            if (recentLogs.length === 0) {
                status = 'inactive';
                message = 'Sin actividad reciente. Revisar adherencia al programa.';
            }
        }

        return {
            athleteId: athlete.id,
            athleteName: athlete.name,
            status,
            message,
            lastActivity: lastLog?.timestamp || 'N/A'
        };
    });
  }

  getLastPerformance(exerciseId: string): { weight: number; reps: number } | null {
     const exLogs = this.getAllLogs().filter(l => l.exerciseId === exerciseId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
     if (exLogs.length === 0) return null;
     return { weight: exLogs[0].weight, reps: exLogs[0].reps };
  }

  // ✅ CORRECCIÓN: Solo marcar sesión como completada cuando tiene logs reales
  markSessionComplete(workoutId: string): boolean {
    // Verificar que existan logs reales para esta sesión específica
    const logs = this.getAllLogs();
    const sessionLogs = logs.filter(log => 
      log.workoutId === workoutId && 
      log.weight > 0 && 
      log.reps > 0
    );
    
    if (sessionLogs.length === 0) {
      console.warn('No se puede marcar como completada una sesión sin logs válidos');
      return false;
    }

    const data = safeGetItem(KEYS.COMPLETED_SESSIONS);
    const list = safeParse(data, []);

    if (!list.includes(workoutId)) {
      list.push(workoutId);
      return safeSetItem(KEYS.COMPLETED_SESSIONS, JSON.stringify(list));
    }
    return true;
  }

  isSessionComplete(workoutId: string): boolean {
    const data = safeGetItem(KEYS.COMPLETED_SESSIONS);
    const list = safeParse(data, []);
    return list.includes(workoutId);
  }

  getBodyMetrics(): BodyMetric[] {
    const data = safeGetItem(KEYS.BODY_METRICS);
    return safeParse(data, []);
  }

  saveBodyMetric(metric: BodyMetric): boolean {
    const metrics = this.getBodyMetrics();
    return safeSetItem(KEYS.BODY_METRICS, JSON.stringify([metric, ...metrics]));
  }

  getStorageUsage() { 
    // Simple storage usage estimation
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('kinetix_')) {
          totalSize += localStorage[key].length;
        }
      }
      const usedKB = Math.round(totalSize / 1024);
      const percentage = Math.min(100, Math.round((usedKB / 5120) * 100)); // Assuming 5MB limit
      return { usedKB, percentage };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { usedKB: 0, percentage: 5 };
    }
  }

  getAiBlueprints(): AiBlueprint[] {
    const data = safeGetItem(KEYS.AI_BLUEPRINTS);
    return safeParse(data, []);
  }

  saveAiBlueprint(blueprint: AiBlueprint): boolean {
    const blueprints = this.getAiBlueprints();
    return safeSetItem(KEYS.AI_BLUEPRINTS, JSON.stringify([blueprint, ...blueprints]));
  }

  deleteAiBlueprint(id: string): boolean {
    const blueprints = this.getAiBlueprints().filter(b => b.id !== id);
    return safeSetItem(KEYS.AI_BLUEPRINTS, JSON.stringify(blueprints));
  }

  getAiPrompts(): string[] {
    const data = safeGetItem(KEYS.AI_PROMPT_HISTORY);
    return safeParse(data, []);
  }

  saveAiPrompt(prompt: string): boolean {
    const prompts = this.getAiPrompts();
    if (prompts[0] === prompt) return true; // Already exists at top

    const updated = [prompt, ...prompts].slice(0, 10);
    return safeSetItem(KEYS.AI_PROMPT_HISTORY, JSON.stringify(updated));
  }

  init(d: any) {
    // Initialization method - can be used for future setup
    console.log('StorageService initialized');
  }

  deleteExercise(id: string): boolean {
    const exercises = this.getExercises().filter(e => e.id !== id);
    return this.saveExercises(exercises);
  }

  addOrUpdateExercise(exercise: Exercise): boolean {
    const exercises = this.getExercises();
    const idx = exercises.findIndex(e => e.id === exercise.id);
    if (idx >= 0) {
      exercises[idx] = exercise;
    } else {
      exercises.push(exercise);
    }
    return this.saveExercises(exercises);
  }

  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates().filter(t => t.id !== id);
    return safeSetItem(KEYS.WORKOUT_TEMPLATES, JSON.stringify(templates));
  }

  saveUserSpecificWorkout(workout: Workout): boolean {
    return this.saveTemplate(workout);
  }

  getWorkoutById(id: string): Workout | undefined {
    const templates = this.getTemplates();
    return templates.find(w => w.id === id);
  }
}

export const storageService = new StorageService();