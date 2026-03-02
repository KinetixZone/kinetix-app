import { User, Workout, WorkoutLog, Exercise, BodyMetric, Goal, UserLevel, WorkoutExercise } from '../types/kinetix';
import { EXERCISES_DB } from '../constants/exercises';

const KEYS = {
  USER: 'kinetix_user',
  WORKOUT_TEMPLATES: 'kinetix_templates', 
  CURRENT_WORKOUT: 'kinetix_current_active',
  CALENDAR: 'kinetix_calendar',
  SETTINGS: 'kinetix_settings',
  PRS: 'kinetix_personal_records',
  LOG_HISTORY: 'kinetix_workout_history',
  CUSTOM_WORKOUTS: 'kinetix_custom_workouts',
  COMPLETED_SESSIONS: 'kinetix_completed_sessions_ids',
  EXERCISE_LIBRARY: 'kinetix_exercise_library_v2',
  ATHLETES_DB: 'kinetix_athletes_db',
  STAFF_DB: 'kinetix_staff_db',
  BODY_METRICS: 'kinetix_body_metrics',
  AI_PROMPT_HISTORY: 'kinetix_ai_prompts',
  AI_BLUEPRINTS: 'kinetix_ai_blueprints',
  SYSTEM_CONFIG: 'kinetix_system_config' 
};

export interface AthleteInsight {
    athleteId: string;
    athleteName: string;
    lastWorkoutDate?: string;
    lastRpe?: number;
    status: 'optimal' | 'warning' | 'critical' | 'inactive';
    message: string;
    compliance?: number;
}

export interface MuscleStatus {
    zone: string;
    level: number; // 0-100 (100 = Fatiga máxima)
    status: 'fresh' | 'recovering' | 'fatigued';
}

export interface SystemConfig {
    enableAI: boolean;
    enableCloud: boolean;
}

export interface AiBlueprint {
    id: string;
    title: string;
    prompt: string;
    tags: string[];
    dateCreated?: string;
}

const MUSCLE_ZONES: Record<string, string> = {
  'Pecho': 'Push', 'Hombro': 'Push', 'Tríceps': 'Push',
  'Espalda': 'Pull', 'Bíceps': 'Pull', 'Abdomen': 'Core',
  'Piernas': 'Legs', 'Glúteo': 'Legs',
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
            t.category === 'travel' || 
            t.assignedTo === athleteId ||
            (t.isTemplate === false && t.id.includes(athleteId))
        );
    }
    
    // El coach ve todo, pero marcamos cuáles son "Instancias de Mesociclo" para no ensuciar.
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
      for (let w = 1; w <= weeks; w++) {
          const cloned: Workout = JSON.parse(JSON.stringify(workout));
          // ID único que vincula al atleta y la semana para evitar colisiones
          cloned.id = `${workout.id}-ath-${athleteId}-w${w}-${Date.now()}`;
          cloned.name = `${workout.name} (Sem ${w}) [${athleteId}]`;
          cloned.publicTitle = `${workout.publicTitle || workout.name} - W${w}`;
          cloned.assignedTo = athleteId;
          cloned.isTemplate = false; // Importante: No es una plantilla maestra
          
          cloned.exercises = cloned.exercises.map(ex => {
              if (incrementWeight > 0 && ex.targetLoad) {
                  ex.targetLoad = ex.targetLoad.split(',').map(v => {
                      const num = parseFloat(v.trim());
                      return isNaN(num) ? v : (num + (incrementWeight * (w - 1))).toString();
                  }).join(', ');
              }
              if (incrementReps > 0 && ex.targetReps) {
                ex.targetReps = ex.targetReps.split(',').map(v => {
                    const num = parseInt(v.trim());
                    return isNaN(num) ? v : (num + (incrementReps * (w - 1))).toString();
                }).join(', ');
              }
              return ex;
          });
          results.push(cloned);
      }
      return results;
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
        const diffHours = (today.getTime() - logDate.getTime()) / (1000 * 60 * 60);
        
        if (diffHours < 72) {
            const ex = exercises.find(e => e.id === log.exerciseId);
            if (ex) {
                const zone = MUSCLE_ZONES[ex.muscleGroup.split(' / ')[0]] || 'Metabolic';
                const impact = Math.max(0, 10 * (1 - diffHours / 72));
                status[zone] = Math.min(100, (status[zone] || 0) + impact);
            }
        }
    });

    return Object.entries(status).map(([zone, level]) => ({
        zone,
        level: Math.round(level),
        status: level > 70 ? 'fatigued' : level > 30 ? 'recovering' : 'fresh'
    }));
  }

  getAthleteInsights(): AthleteInsight[] {
    const athletes = this.getAthletes();
    const logs = this.getAllLogs();
    
    return athletes.map(athlete => {
        // Fix: Filter logs by athlete and find the most recent one with feedback
        const athleteLogs = logs.filter(l => l.exerciseId && l.feedback !== undefined);
        const lastLog = athleteLogs
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        
        let status: AthleteInsight['status'] = 'optimal';
        let message = 'Rendimiento estable.';
        
        if (lastLog?.feedback) {
            if (lastLog.feedback.rpe >= 9) {
                status = 'critical';
                message = 'ALERTA: Esfuerzo límite reportado (RPE 9+). Riesgo de sobreentreno.';
            } else if (lastLog.feedback.fatigue >= 4) {
                status = 'warning';
                message = 'Fatiga alta detectada post-sesión.';
            }
        } else {
          // Check for inactivity
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
            lastWorkoutDate: lastLog?.timestamp,
            lastRpe: lastLog?.feedback?.rpe,
            status,
            message,
            compliance: 85
        };
    });
  }

  getLastPerformance(exerciseId: string): { weight: number, reps: number } | null {
      const logs = this.getAllLogs();
      const exLogs = logs
          .filter(l => l.exerciseId === exerciseId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (exLogs.length === 0) return null;
      return { weight: exLogs[0].weight, reps: exLogs[0].reps };
  }

  markSessionComplete(workoutId: string): boolean {
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