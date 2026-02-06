
import { User, Workout, WorkoutLog, Exercise, BodyMetric, Goal, UserLevel } from '../types/kinetix';
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
  BODY_METRICS: 'kinetix_body_metrics',
  AI_PROMPT_HISTORY: 'kinetix_ai_prompts',
  AI_BLUEPRINTS: 'kinetix_ai_blueprints',
  SYSTEM_CONFIG: 'kinetix_system_config' 
};

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

class StorageService {
  getSystemConfig(): SystemConfig {
      try {
          const data = localStorage.getItem(KEYS.SYSTEM_CONFIG);
          return data ? JSON.parse(data) : { enableAI: true, enableCloud: true };
      } catch (e) {
          return { enableAI: true, enableCloud: true };
      }
  }

  saveSystemConfig(config: SystemConfig) {
      localStorage.setItem(KEYS.SYSTEM_CONFIG, JSON.stringify(config));
      window.location.reload();
  }

  saveUser(user: User) {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  }

  getUser(): User | null {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  }

  logout() {
    localStorage.removeItem(KEYS.USER);
  }

  saveAiPrompt(prompt: string) {
    if (!prompt) return;
    const prompts = this.getAiPrompts();
    if (prompts[0] === prompt) return;
    const newPrompts = [prompt, ...prompts.filter(p => p !== prompt)].slice(0, 15);
    localStorage.setItem(KEYS.AI_PROMPT_HISTORY, JSON.stringify(newPrompts));
  }

  getAiPrompts(): string[] {
    try {
        const data = localStorage.getItem(KEYS.AI_PROMPT_HISTORY);
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  }

  saveAiBlueprint(blueprint: AiBlueprint) {
      const all = this.getAiBlueprints();
      const idx = all.findIndex(b => b.id === blueprint.id);
      
      const safeBlueprint = {
          ...blueprint,
          dateCreated: blueprint.dateCreated || new Date().toISOString()
      };

      if (idx >= 0) all[idx] = safeBlueprint;
      else all.unshift(safeBlueprint); 
      
      localStorage.setItem(KEYS.AI_BLUEPRINTS, JSON.stringify(all));
  }

  getAiBlueprints(): AiBlueprint[] {
      try {
          const data = localStorage.getItem(KEYS.AI_BLUEPRINTS);
          if (data) return JSON.parse(data);
          
          const defaults: AiBlueprint[] = [
            { 
                id: 'bp-1', 
                title: 'Fuerza Base 5x5 (Power)', 
                tags: ['Fuerza', 'Básicos'], 
                prompt: 'Crea una rutina de Fuerza Base enfocada en Powerlifting. Usa el método 5x5 en compuestos principales (Sentadilla, Press Banca, Peso Muerto) con descansos largos (180s). Accesorios en 3x10.',
                dateCreated: new Date().toISOString()
            },
            { 
                id: 'bp-2', 
                title: 'Hipertrofia PPL (Push)', 
                tags: ['Estética', 'Volumen'], 
                prompt: 'Genera una sesión de Empuje (Push) para hipertrofia máxima. Usa método Standard para presses pesados, y Dropsets (Mechanical Drop) en los ejercicios de aislamiento final para bombeo.',
                dateCreated: new Date().toISOString()
            }
          ];
          this.saveAiBlueprintsList(defaults);
          return defaults;
      } catch (e) {
          return [];
      }
  }

  saveAiBlueprintsList(list: AiBlueprint[]) {
      localStorage.setItem(KEYS.AI_BLUEPRINTS, JSON.stringify(list));
  }

  deleteAiBlueprint(id: string) {
      const list = this.getAiBlueprints().filter(b => b.id !== id);
      this.saveAiBlueprintsList(list);
  }

  saveAthletes(athletes: User[]) {
    localStorage.setItem(KEYS.ATHLETES_DB, JSON.stringify(athletes));
  }

  getAthletes(): User[] {
    try {
        const data = localStorage.getItem(KEYS.ATHLETES_DB);
        if (data) return JSON.parse(data);
        
        const initialAthletes = this.getInitialAthletes();
        this.saveAthletes(initialAthletes);
        return initialAthletes;
    } catch(e) { return []; }
  }

  private getInitialAthletes(): User[] {
    const today = new Date();
    const nextMonth = new Date(); nextMonth.setDate(today.getDate() + 30);
    return [
        {
            id: 'athlete-101', name: 'Alex T. (OK)', email: 'alex@demo.com', goal: Goal.PERFORMANCE,
            level: UserLevel.ADVANCED, role: 'client', daysPerWeek: 5, streak: 12, createdAt: '2023-01-01',
            equipment: ['Full Gym'], injuries: 'Hombro Izquierdo', isActive: true, complianceRate: 92,
            cycleEndDate: nextMonth.toISOString().split('T')[0],
            age: 28, weight: 82, medicalConditions: 'Ninguna',
            emergencyWorkoutId: 'tpl-cardio-burn'
        },
        {
            id: 'athlete-102', name: 'Maria S. (Vence)', email: 'maria@demo.com', goal: Goal.LOSE_FAT,
            level: UserLevel.INTERMEDIATE, role: 'client', daysPerWeek: 3, streak: 4, createdAt: '2023-05-10',
            equipment: ['Mancuernas'], isActive: true, complianceRate: 85,
            cycleEndDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            age: 34, weight: 65, medicalConditions: 'Asma leve'
        }
    ];
  }

  saveCurrentWorkout(workout: Workout) {
    localStorage.setItem(KEYS.CURRENT_WORKOUT, JSON.stringify(workout));
  }

  getCurrentWorkout(): Workout | null {
    try {
        const data = localStorage.getItem(KEYS.CURRENT_WORKOUT);
        return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
  }

  getExercises(): Exercise[] {
    try {
      const data = localStorage.getItem(KEYS.EXERCISE_LIBRARY);
      if (data) return JSON.parse(data);
      this.saveExercises(EXERCISES_DB);
      return EXERCISES_DB;
    } catch (e) {
      return EXERCISES_DB;
    }
  }

  saveExercises(exercises: Exercise[]) {
    localStorage.setItem(KEYS.EXERCISE_LIBRARY, JSON.stringify(exercises));
  }

  addOrUpdateExercise(exercise: Exercise) {
    const list = this.getExercises();
    const idx = list.findIndex(e => e.id === exercise.id);
    if (idx >= 0) list[idx] = exercise; 
    else list.push(exercise);
    this.saveExercises(list);
  }

  deleteExercise(id: string) {
    const list = this.getExercises().filter(e => e.id !== id);
    this.saveExercises(list);
  }

  getTemplates(): Workout[] {
    try {
        const data = localStorage.getItem(KEYS.WORKOUT_TEMPLATES);
        if (data) return JSON.parse(data);

        const initialTemplates = this.getInitialTemplates();
        localStorage.setItem(KEYS.WORKOUT_TEMPLATES, JSON.stringify(initialTemplates));
        return initialTemplates;
    } catch(e) { return []; }
  }

  private getInitialTemplates(): Workout[] {
      return [
        {
            id: 'tpl-travel-default',
            name: 'Full Body - En Casa (Sin Equipo)',
            publicTitle: 'Protocolo de Viaje',
            category: 'travel',
            day: 1,
            isTemplate: true,
            exercises: [
                { exerciseId: 'fun-2', name: 'Burpees', targetSets: 4, targetReps: '15', targetRest: 60, method: 'standard' },
                { exerciseId: 'leg-1', name: 'Air Squats', targetSets: 4, targetReps: '30', targetRest: 45, method: 'standard' },
                { exerciseId: 'ch-4', name: 'Push-ups', targetSets: 4, targetReps: 'Failure', targetRest: 60, method: 'standard' }
            ]
        },
        {
            id: 'tpl-cardio-burn',
            name: 'Metabolic Inferno (Cardio)',
            publicTitle: 'Quema Calórica - En Casa',
            category: 'travel',
            day: 1,
            isTemplate: true,
            exercises: [
                {
                    exerciseId: 'fun-3', name: 'Jumping Jacks', targetSets: 1, targetReps: 'Max', targetRest: 0, method: 'tabata',
                    tabataConfig: { workTimeSec: 20, restTimeSec: 10, rounds: 8, sequence: [] }
                },
                { exerciseId: 'fun-4', name: 'Mountain Climbers', targetSets: 4, targetReps: '45s', targetRest: 30, method: 'standard' }
            ]
        }
      ];
  }

  saveTemplate(template: Workout) {
    const templates = this.getTemplates();
    const idx = templates.findIndex(t => t.id === template.id);
    if (idx >= 0) templates[idx] = template;
    else templates.push(template);
    localStorage.setItem(KEYS.WORKOUT_TEMPLATES, JSON.stringify(templates));
  }

  deleteTemplate(templateId: string) {
    const templates = this.getTemplates().filter(t => t.id !== templateId);
    localStorage.setItem(KEYS.WORKOUT_TEMPLATES, JSON.stringify(templates));
  }

  saveUserSpecificWorkout(workout: Workout) {
    const data = localStorage.getItem(KEYS.CUSTOM_WORKOUTS);
    const list: Workout[] = data ? JSON.parse(data) : [];
    const idx = list.findIndex(w => w.id === workout.id);
    if (idx >= 0) list[idx] = workout;
    else list.push(workout);
    localStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(list));
  }

  // BUSCADOR ROBUSTO: Mira en todas las colecciones posibles
  getWorkoutById(id: string): Workout | undefined {
    // 1. Mirar en rutinas personalizadas (Customs)
    const customsData = localStorage.getItem(KEYS.CUSTOM_WORKOUTS);
    if (customsData) {
      const cList: Workout[] = JSON.parse(customsData);
      const c = cList.find(w => w.id === id);
      if (c) return c;
    }
    
    // 2. Mirar en plantillas globales (Templates)
    const templates = this.getTemplates();
    const t = templates.find(w => w.id === id);
    if (t) return t;

    // 3. Caso especial: si el ID contiene 'class-', es un placeholder generado por el calendario
    if (id.startsWith('class-')) {
        return {
            id: id, name: 'Clase Kinetix', publicTitle: 'Kinetix Class', day: 1, exercises: [], isTemplate: false
        };
    }

    return undefined;
  }

  saveSessionLogs(logs: WorkoutLog[]) {
    const currentHistory = this.getAllLogs();
    const newHistory = [...currentHistory, ...logs];
    localStorage.setItem(KEYS.LOG_HISTORY, JSON.stringify(newHistory));
    logs.forEach(log => {
      if(log.isPR) this.savePR(log.exerciseId, log.weight);
    });
  }

  getAllLogs(): WorkoutLog[] {
    try {
        const data = localStorage.getItem(KEYS.LOG_HISTORY);
        return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
  }

  savePR(exerciseId: string, weight: number) {
    const prs = this.getAllPRs();
    if ((prs[exerciseId] || 0) < weight) {
      prs[exerciseId] = weight;
      localStorage.setItem(KEYS.PRS, JSON.stringify(prs));
    }
  }

  getExercisePR(exerciseId: string): number {
    return this.getAllPRs()[exerciseId] || 0;
  }

  getAllPRs(): Record<string, number> {
    const data = localStorage.getItem(KEYS.PRS);
    return data ? JSON.parse(data) : {};
  }

  markSessionComplete(workoutId: string) {
    const data = localStorage.getItem(KEYS.COMPLETED_SESSIONS);
    const list: string[] = data ? JSON.parse(data) : [];
    if (!list.includes(workoutId)) {
      list.push(workoutId);
      localStorage.setItem(KEYS.COMPLETED_SESSIONS, JSON.stringify(list));
    }
  }

  isSessionComplete(workoutId: string): boolean {
    const data = localStorage.getItem(KEYS.COMPLETED_SESSIONS);
    const list: string[] = data ? JSON.parse(data) : [];
    return list.includes(workoutId);
  }

  saveBodyMetric(metric: BodyMetric) {
      const all = this.getBodyMetrics();
      const existingIdx = all.findIndex(m => m.date === metric.date);
      if (existingIdx >= 0) all[existingIdx] = metric;
      else all.push(metric);
      all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem(KEYS.BODY_METRICS, JSON.stringify(all));
  }

  getBodyMetrics(): BodyMetric[] {
      const data = localStorage.getItem(KEYS.BODY_METRICS);
      return data ? JSON.parse(data) : [];
  }

  init(defaultWorkout: Workout) {
    if (!this.getCurrentWorkout()) this.saveCurrentWorkout(defaultWorkout);
    this.getExercises();
    if (!localStorage.getItem(KEYS.ATHLETES_DB)) this.getAthletes();
    this.getTemplates();
  }

  createBackup(): string {
    const backup: Record<string, any> = {};
    Object.values(KEYS).forEach(key => {
        const val = localStorage.getItem(key);
        if (val) backup[key] = JSON.parse(val);
    });
    backup['backup_meta'] = { date: new Date().toISOString(), version: '4.0', integrity: 'kinetix-signed' };
    return JSON.stringify(backup, null, 2);
  }

  restoreBackup(jsonString: string): boolean {
    try {
        const backup = JSON.parse(jsonString);
        if (!backup.backup_meta || backup.backup_meta.integrity !== 'kinetix-signed') return false;
        Object.values(KEYS).forEach(key => {
            if (backup[key]) localStorage.setItem(key, JSON.stringify(backup[key]));
        });
        return true;
    } catch (e) {
        return false;
    }
  }

  getStorageUsage(): { usedKB: number; percentage: number } {
    let total = 0;
    for (const key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue;
        total += ((localStorage[key].length + key.length) * 2);
    }
    const usedKB = Math.round(total / 1024);
    const percentage = Math.min(Math.round((usedKB / 5120) * 100), 100);
    return { usedKB, percentage };
  }
}

export const storageService = new StorageService();
