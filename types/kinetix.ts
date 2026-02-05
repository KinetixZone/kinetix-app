export enum Goal { LOSE_FAT = 'Bajar Grasa', GAIN_MUSCLE = 'Subir Músculo', PERFORMANCE = 'Rendimiento' }
export enum UserLevel { BEGINNER = 'Principiante', INTERMEDIATE = 'Intermedio', ADVANCED = 'Avanzado' }
export type UserRole = 'coach' | 'client' | 'admin' | 'owner';
export interface User { id: string; name: string; email: string; goal: Goal; level: UserLevel; role: UserRole; streak: number; isActive: boolean; cycleEndDate?: string; }
export interface Workout { id: string; name: string; publicTitle?: string; exercises: any[]; }