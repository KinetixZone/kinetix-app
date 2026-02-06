import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { User } from '../types/kinetix';
import { storageService } from './storageService';

class AuthService {
    // Lista maestra de administradores autorizados
    private readonly ADMIN_EMAILS = [
        'les_barrera@outlook.com', 
        'jorge02gonzalez@outlook.com',
        'kinetixzone@outlook.com',
        'kinetixzone@gmail.com'
    ];
    
    private readonly MASTER_KEY = 'kinetix.2302';

    // Verificar si el correo requiere Clave Maestra Alpha
    isAdminEmail(email: string): boolean {
        if (!email) return false;
        return this.ADMIN_EMAILS.includes(email.toLowerCase());
    }

    // Iniciar Sesión con protocolo de seguridad
    async requestAccess(email: string, password?: string): Promise<{ success: boolean, error: string | null }> {
        const emailLower = email.toLowerCase();
        const athletes = storageService.getAthletes();
        const staff = storageService.getStaff();
        
        const isOwner = this.isAdminEmail(emailLower);
        const isStaff = staff.some(s => s.email.toLowerCase() === emailLower);
        const isAthlete = athletes.some(a => a.email.toLowerCase() === emailLower);

        // Si no está en ninguna lista, denegar inmediatamente
        if (!isOwner && !isStaff && !isAthlete) {
            return { success: false, error: "IDENTIDAD NO RECONOCIDA EN EL SISTEMA ELITE" };
        }

        // Validación de Seguridad Alpha para Administradores
        if (isOwner) {
            if (!password) {
                return { success: false, error: "AUTORIZACIÓN ALPHA REQUERIDA" };
            }
            if (password !== this.MASTER_KEY) {
                return { success: false, error: "CLAVE ALPHA INVÁLIDA. ACCESO BLOQUEADO." };
            }
        }

        // Si Supabase no está configurado, permitimos el acceso local para desarrollo/demo
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

    // Finalizar proceso de login y cargar el perfil correspondiente
    async finalizeLogin(email: string): Promise<User | null> {
        const athletes = storageService.getAthletes();
        const staff = storageService.getStaff();
        const emailLower = email.toLowerCase();

        // Prioridad 1: Administradores / Dueños
        if (this.isAdminEmail(emailLower)) {
            let name = 'Admin Kinetix';
            if (emailLower.includes('les_barrera')) name = 'Leslie';
            if (emailLower.includes('jorge02gonzalez')) name = 'Jorge González';
            if (emailLower.includes('kinetixzone')) name = 'Kinetix Zone Admin';

            const owner: User = {
                id: `owner-${emailLower.split('@')[0]}`,
                name: name,
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

        // Prioridad 2: Staff Técnico
        const staffMember = staff.find(s => s.email.toLowerCase() === emailLower);
        if (staffMember) {
            storageService.saveUser(staffMember);
            return staffMember;
        }

        // Prioridad 3: Atletas
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
