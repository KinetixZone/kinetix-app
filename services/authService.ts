
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, Goal, UserLevel } from '../types/kinetix';
import { storageService } from './storageService';

class AuthService {
    
    // Iniciar Sesión con Email
    async login(email: string, password: string): Promise<{ user: User | null, error: string | null }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) return { user: null, error: error.message };
            if (!data.user) return { user: null, error: 'No se recibieron datos del usuario.' };

            // Intentar recuperar perfil de la base de datos "profiles" (Si existe en un futuro)
            // Por ahora, construimos el usuario localmente o recuperamos del localStorage si ya existe
            let appUser = storageService.getUser();
            
            // Si no hay datos locales o el email es diferente, creamos estructura base
            if (!appUser || appUser.email !== email) {
                appUser = {
                    id: data.user.id,
                    email: data.user.email!,
                    name: data.user.user_metadata?.full_name || email.split('@')[0],
                    role: (data.user.user_metadata?.role as UserRole) || 'client',
                    goal: Goal.PERFORMANCE,
                    level: UserLevel.BEGINNER,
                    daysPerWeek: 3,
                    equipment: [],
                    streak: 0,
                    createdAt: new Date().toISOString(),
                    isActive: true
                };
            }

            // Guardar sesión local para que la app funcione offline-first
            storageService.saveUser(appUser);
            return { user: appUser, error: null };

        } catch (e: any) {
            console.error("Login error:", e);
            // Mensaje amigable si falla por configuración
            if (e.message && e.message.includes('supabaseUrl')) {
                return { user: null, error: "Error de configuración: Faltan claves de API." };
            }
            return { user: null, error: e.message || "Error desconocido de conexión." };
        }
    }

    // Registro de Nuevo Usuario
    async register(email: string, password: string, name: string): Promise<{ success: boolean, error: string | null }> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: 'client' // Por defecto todos son clientes
                    }
                }
            });

            if (error) return { success: false, error: error.message };
            return { success: true, error: null };

        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    // Cerrar Sesión
    async logout() {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.warn("Error al cerrar sesión en Supabase (posiblemente ya cerrada o sin conexión)");
        }
        storageService.logout();
    }

    // Recuperar sesión activa al recargar
    async getSession(): Promise<User | null> {
        try {
            // Verificar si tenemos conexión válida antes de llamar a auth
            // Esto evita errores de red innecesarios si estamos en modo placeholder
            const url = (supabase as any).supabaseUrl;
            if (url && url.includes('placeholder')) {
                return null;
            }

            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                return null;
            }

            if (data.session?.user) {
                // Sincronizar con lo que tenemos en local storage
                return storageService.getUser(); 
            }
        } catch (e) {
            console.warn("Kinetix Auth: No se pudo verificar sesión (posiblemente sin conexión o config incompleta).");
        }
        return null;
    }
}

export const authService = new AuthService();
