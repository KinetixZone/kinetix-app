
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { User } from '../../types/kinetix';

interface Props {
    onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<Props> = ({ onLoginSuccess }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({ email: '', password: '', name: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSupabaseConfigured) {
            setError("NO ENLAZADO: El proyecto no tiene llaves de Supabase. El login está desactivado.");
            return;
        }
        setLoading(true);
        setError(null);

        const { user, error: authError } = await authService.login(form.email, form.password);
        if (authError) setError(authError);
        else if (user) onLoginSuccess(user);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 text-white">
            <div className="w-full max-w-sm space-y-8">
                
                {/* AVISO DE CONEXIÓN */}
                {!isSupabaseConfigured && (
                    <div className="bg-red-600/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <span className="text-xl">⚠️</span>
                        <div className="text-[10px] font-black uppercase">
                            <p className="text-red-500">Error de Enlace</p>
                            <p className="text-white/50">Faltan las claves de Supabase. Conecta tu DB para habilitar el login.</p>
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Kinetix <span className="text-red-600">ID</span></h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#0F0F11] p-8 rounded-[32px] border border-white/10 space-y-4">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full bg-black border border-white/10 p-4 rounded-xl font-bold"
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña" 
                        className="w-full bg-black border border-white/10 p-4 rounded-xl font-bold"
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                    />
                    {error && <p className="text-[10px] text-red-500 font-bold uppercase text-center">{error}</p>}
                    <button 
                        disabled={loading || !isSupabaseConfigured}
                        className="w-full py-4 bg-red-600 rounded-xl font-black uppercase text-xs shadow-lg disabled:opacity-20"
                    >
                        {loading ? 'Cargando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};
