
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { User } from '../types/kinetix';
import { storageService } from './storageService';

class AuthService {
    private readonly ADMIN_EMAILS = ['les_barrera@outlook.com', 'jorge02gonzalez@outlook.com'];
    private readonly MASTER_KEY = 'kinetix.2302';

    // Verificar si el correo requiere Clave Maestra
    isAdminEmail(email: string): boolean {
        return this.ADMIN_EMAILS.includes(email.toLowerCase());
    }

    // Iniciar Sesión por Correo (Handshake)
    async requestAccess(email: string, password?: string): Promise<{ success: boolean, error: string | null }> {
        const emailLower = email.toLowerCase();
        const athletes = storageService.getAthletes();
        const staff = storageService.getStaff();
        
        const isOwner = this.isAdminEmail(emailLower);
        const isStaff = staff.some(s => s.email.toLowerCase() === emailLower);
        const isAthlete = athletes.some(a => a.email.toLowerCase() === emailLower);

        if (!isOwner && !isStaff && !isAthlete) {
            return { success: false, error: "IDENTIDAD NO REGISTRADA EN EL SISTEMA ELITE" };
        }

        // Validación de Seguridad Alpha para Owners
        if (isOwner) {
            if (!password) {
                return { success: false, error: "AUTORIZACIÓN ALPHA REQUERIDA" };
            }
            if (password !== this.MASTER_KEY) {
                return { success: false, error: "CLAVE MAESTRA INCORRECTA. ACCESO BLOQUEADO." };
            }
        }

        if (!isSupabaseConfigured) {
            return { success: true, error: null };
        }

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: { emailRedirectTo: window.location.origin },
            });
            if (error) return { success: false, error: error.message };
            return { success: true, error: null };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    // Validar y Cargar Perfil
    async finalizeLogin(email: string): Promise<User | null> {
        const athletes = storageService.getAthletes();
        const staff = storageService.getStaff();
        const emailLower = email.toLowerCase();

        // Prioridad 1: Dueños (Leslie / Jorge)
        if (this.isAdminEmail(emailLower)) {
            const owner: User = {
                id: emailLower === 'les_barrera@outlook.com' ? 'owner-leslie' : 'owner-jorge',
                name: emailLower === 'les_barrera@outlook.com' ? 'Leslie' : 'Jorge González',
                email: emailLower,
                role: 'owner',
                goal: 'Rendimiento' as any,
                level: 'Avanzado' as any,
                daysPerWeek: 7,
                equipment: [],
                streak: 100,
                createdAt: new Date().toISOString(),
                isActive: true
            };
            storageService.saveUser(owner);
            return owner;
        }

        // Prioridad 2: Staff Dinámico
        const staffMember = staff.find(s => s.email.toLowerCase() === emailLower);
        if (staffMember) {
            storageService.saveUser(staffMember);
            return staffMember;
        }

        // Prioridad 3: Atleta
        const athlete = athletes.find(a => a.email.toLowerCase() === emailLower);
        if (athlete) {
            storageService.saveUser(athlete);
            return athlete;
        }

        return null;
    }

    async logout() {
        storageService.logout();
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
    }
}

export const authService = new AuthService();
