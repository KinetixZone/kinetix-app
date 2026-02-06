
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
  STAFF_DB: 'kinetix_staff_db', // NUEVA: Base de datos de personal
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

  // --- GESTIÓN DE STAFF ---
  getStaff(): User[] {
    try {
        const data = localStorage.getItem(KEYS.STAFF_DB);
        return data ? JSON.parse(data) : [];
    } catch(e) { return []; }
  }

  saveStaff(staff: User[]) {
    localStorage.setItem(KEYS.STAFF_DB, JSON.stringify(staff));
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
            id: 'athlete-101', name: 'Alex T. (Demo)', email: 'alex@demo.com', goal: Goal.PERFORMANCE,
            level: UserLevel.ADVANCED, role: 'client', daysPerWeek: 5, streak: 12, createdAt: '2023-01-01',
            equipment: ['Full Gym'], isActive: true, cycleEndDate: nextMonth.toISOString().split('T')[0]
        }
    ];
  }

  getExercises(): Exercise[] {
    try {
      const data = localStorage.getItem(KEYS.EXERCISE_LIBRARY);
      if (data) return JSON.parse(data);
      this.saveExercises(EXERCISES_DB);
      return EXERCISES_DB;
    } catch (e) { return EXERCISES_DB; }
  }

  saveExercises(exercises: Exercise[]) { localStorage.setItem(KEYS.EXERCISE_LIBRARY, JSON.stringify(exercises)); }

  // FIX: Added missing addOrUpdateExercise method
  addOrUpdateExercise(exercise: Exercise) {
    const exercises = this.getExercises();
    const idx = exercises.findIndex(e => e.id === exercise.id);
    if (idx >= 0) exercises[idx] = exercise; else exercises.push(exercise);
    this.saveExercises(exercises);
  }

  // FIX: Added missing deleteExercise method
  deleteExercise(id: string) {
    const exercises = this.getExercises().filter(e => e.id !== id);
    this.saveExercises(exercises);
  }

  getTemplates(): Workout[] {
    const data = localStorage.getItem(KEYS.WORKOUT_TEMPLATES);
    return data ? JSON.parse(data) : [];
  }

  saveTemplate(template: Workout) {
    const templates = this.getTemplates();
    const idx = templates.findIndex(t => t.id === template.id);
    if (idx >= 0) templates[idx] = template; else templates.push(template);
    localStorage.setItem(KEYS.WORKOUT_TEMPLATES, JSON.stringify(templates));
  }

  // FIX: Added missing deleteTemplate method
  deleteTemplate(id: string) {
    const templates = this.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(KEYS.WORKOUT_TEMPLATES, JSON.stringify(templates));
  }

  // FIX: Added missing saveUserSpecificWorkout method
  saveUserSpecificWorkout(workout: Workout) {
    this.saveTemplate(workout);
  }

  getWorkoutById(id: string): Workout | undefined {
    const templates = this.getTemplates();
    return templates.find(w => w.id === id);
  }

  saveSessionLogs(logs: WorkoutLog[]) {
    const current = this.getAllLogs();
    localStorage.setItem(KEYS.LOG_HISTORY, JSON.stringify([...current, ...logs]));
  }

  getAllLogs(): WorkoutLog[] {
    const data = localStorage.getItem(KEYS.LOG_HISTORY);
    return data ? JSON.parse(data) : [];
  }

  markSessionComplete(workoutId: string) {
    const data = localStorage.getItem(KEYS.COMPLETED_SESSIONS);
    const list = data ? JSON.parse(data) : [];
    if (!list.includes(workoutId)) {
      list.push(workoutId);
      localStorage.setItem(KEYS.COMPLETED_SESSIONS, JSON.stringify(list));
    }
  }

  isSessionComplete(workoutId: string): boolean {
    const data = localStorage.getItem(KEYS.COMPLETED_SESSIONS);
    const list = data ? JSON.parse(data) : [];
    return list.includes(workoutId);
  }

  // FIX: Added missing getBodyMetrics method
  getBodyMetrics(): BodyMetric[] {
    try {
      const data = localStorage.getItem(KEYS.BODY_METRICS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  }

  // FIX: Added missing saveBodyMetric method
  saveBodyMetric(metric: BodyMetric) {
    const metrics = this.getBodyMetrics();
    localStorage.setItem(KEYS.BODY_METRICS, JSON.stringify([metric, ...metrics]));
  }

  getStorageUsage() { return { usedKB: 0, percentage: 5 }; }
  createBackup() { return JSON.stringify({ backup_meta: { integrity: 'kinetix-signed' } }); }
  
  // FIX: Implemented getAiBlueprints method
  getAiBlueprints(): AiBlueprint[] {
    try {
      const data = localStorage.getItem(KEYS.AI_BLUEPRINTS);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  }

  // FIX: Added missing saveAiBlueprint method
  saveAiBlueprint(blueprint: AiBlueprint) {
    const blueprints = this.getAiBlueprints();
    localStorage.setItem(KEYS.AI_BLUEPRINTS, JSON.stringify([blueprint, ...blueprints]));
  }

  // FIX: Added missing deleteAiBlueprint method
  deleteAiBlueprint(id: string) {
    const blueprints = this.getAiBlueprints().filter(b => b.id !== id);
    localStorage.setItem(KEYS.AI_BLUEPRINTS, JSON.stringify(blueprints));
  }

  // FIX: Implemented getAiPrompts method
  getAiPrompts(): string[] {
    try {
      const data = localStorage.getItem(KEYS.AI_PROMPT_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  }

  // FIX: Added missing saveAiPrompt method
  saveAiPrompt(prompt: string) {
    const prompts = this.getAiPrompts();
    if (prompts[0] === prompt) return;
    const updated = [prompt, ...prompts].slice(0, 10);
    localStorage.setItem(KEYS.AI_PROMPT_HISTORY, JSON.stringify(updated));
  }

  init(d: any) {}
}

export const storageService = new StorageService();
