export enum Goal { 
  LOSE_FAT = 'Bajar Grasa', 
  GAIN_MUSCLE = 'Subir Músculo', 
  PERFORMANCE = 'Rendimiento' 
}

export enum UserLevel { 
  BEGINNER = 'Principiante', 
  INTERMEDIATE = 'Intermedio', 
  ADVANCED = 'Avanzado' 
}

export type UserRole = 'coach' | 'client' | 'admin' | 'owner';

export type TrainingMethod = 'standard' | 'biserie' | 'ahap' | 'dropset' | 'tabata' | 'emom' | 'superset';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  videoUrl: string;
  technique: string;
  commonErrors: string[];
}

export interface User {
  id: string; 
  name: string; 
  email: string; 
  goal: Goal; 
  level: UserLevel; 
  role: UserRole;
  daysPerWeek: number; 
  equipment: string[]; 
  injuries?: string; 
  streak: number;
  createdAt: string; 
  isActive?: boolean; 
  coachId?: string;
  lastPrDate?: string;
  complianceRate?: number; 
  lastWorkoutDate?: string;
  emergencyWorkoutId?: string; 
  cycleEndDate?: string;
  age?: number;
  weight?: number;
  medicalConditions?: string;
}

export interface CalendarEvent {
  id: string;
  type: 'workout' | 'rest' | 'event';
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  coachId: string;
  athleteIds: string[];
  workoutTemplateId?: string;
  location?: string; 
  venueSessionId?: string; 
}

export interface WorkoutLog {
  exerciseId: string;
  setIndex: number;
  weight: number;
  reps: number;
  timestamp: string; 
  isPR: boolean;
  executionMode?: 'Venue' | 'Remote' | 'Emergency_Home';
  // Fix: Added feedback property to support RPE and fatigue tracking
  feedback?: {
    rpe: number; // Rate of Perceived Exertion (1-10 scale)
    fatigue: number; // Fatigue level (1-10 scale)
    notes?: string; // Optional notes about the set
  };
}

export interface BodyMetric {
    date: string; 
    weight: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    arm?: number;
    thigh?: number;
    notes?: string;
}

export interface IntervalItem {
  exerciseId: string;
  name: string;
  targetReps?: string; 
  targetLoad?: string; // CARGA POR ITEM (EMOM/TABATA)
  videoUrl?: string;
}

export interface TabataConfig {
  workTimeSec: number; 
  restTimeSec: number; 
  rounds: number; 
  sequence?: IntervalItem[]; 
}

export interface EmomConfig {
  durationMin: number; 
  sequence?: IntervalItem[]; 
}

export interface DropSetNode {
  weight: string; 
  reps: string; 
}

export interface WorkoutExercise {
  exerciseId: string; 
  name: string; 
  targetSets: number; 
  targetReps: string;
  targetLoad?: string; 
  targetRest?: number; 
  coachCue?: string; 
  videoUrl?: string;
  method?: TrainingMethod;
  pair?: { 
    exerciseId: string; 
    name: string; 
    targetReps: string; 
    targetLoad?: string; 
    // Fix: Added videoUrl to pair to support biserie tracking
    videoUrl?: string;
  };
  supersetChain?: { 
    exerciseId: string; 
    name: string; 
    targetReps: string;
    targetLoad?: string;
    // Fix: Added videoUrl for consistency in superset tracking
    videoUrl?: string;
  }[];
  ahapConfig?: { 
    notes?: string;
  };
  tabataConfig?: TabataConfig; 
  emomConfig?: EmomConfig;
  dropsetConfig?: {
    drops: DropSetNode[];
    strategy?: 'fixed' | 'progressive'; 
  };
}

export interface Workout {
  id: string; 
  name: string; 
  publicTitle?: string; 
  category?: 'general' | 'travel'; 
  day: number; 
  exercises: WorkoutExercise[];
  isCompleted?: boolean; 
  scheduledDate?: string;
  isTemplate?: boolean; 
  assignedTo?: string; 
  location?: string; 
}

export interface ProgressState {
  currentExerciseIndex: number;
  completedSets: number;
  isPairTurn: boolean; 
  subIndex: number; 
  performanceData: { [exerciseId: string]: { weights: number[]; reps: number[] } };
  workoutLogs: WorkoutLog[]; 
  emomCurrentMin: number;
  tabataCurrentRound: number;
  tabataCurrentSet: number;
}