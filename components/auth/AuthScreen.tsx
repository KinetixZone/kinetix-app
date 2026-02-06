
import React, { useState, useMemo } from 'react';
import { authService } from '../../services/authService';
import { User } from '../../types/kinetix';

interface Props {
    onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<Props> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
    const [error, setError] = useState<string | null>(null);

    // Detectar si el correo ingresado es de un Admin para mostrar el campo de password
    const isAdminMode = useMemo(() => authService.isAdminEmail(email), [email]);

    const handleAccessRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) return setError("Ingresa un correo válido.");
        
        // Si es admin y no ha puesto password, le avisamos (aunque el botón debería estar bloqueado)
        if (isAdminMode && !password) return setError("INGRESA CLAVE MAESTRA");

        setStatus('loading');
        setError(null);

        const { success, error: authError } = await authService.requestAccess(email, isAdminMode ? password : undefined);
        
        if (success) {
            const profile = await authService.finalizeLogin(email);
            if (profile) {
                setTimeout(() => onLoginSuccess(profile), 1500);
                setStatus('sent');
            } else {
                setError("Error al recuperar perfil. Contacta soporte.");
                setStatus('idle');
            }
        } else {
            setError(authError);
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full transition-colors duration-700 ${isAdminMode ? 'bg-red-600/20' : 'bg-blue-600/10'}`} />
            </div>

            <div className="w-full max-w-sm space-y-10 relative z-10">
                <div className="text-center space-y-4">
                    <div className={`inline-block px-3 py-1 rounded-full border transition-all duration-500 ${isAdminMode ? 'bg-red-600/20 border-red-500/50 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                        <p className={`text-[8px] font-black uppercase tracking-[0.4em] ${isAdminMode ? 'text-red-500' : 'text-white/40'}`}>
                            {isAdminMode ? 'PROTOCOLO ALPHA DETECTADO' : 'Secure Terminal v128'}
                        </p>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter">
                        Kinetix <span className={isAdminMode ? 'text-red-600' : 'text-blue-500'}>ID</span>
                    </h1>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                        {isAdminMode ? 'AUTORIZACIÓN DE NIVEL 5 REQUERIDA' : 'Acceso para Atletas & Staff'}
                    </p>
                </div>

                <form onSubmit={handleAccessRequest} className="space-y-4">
                    <div className="space-y-3">
                        <div className="relative group">
                            <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 ${isAdminMode ? 'bg-red-600/40' : 'bg-blue-600/20'}`}></div>
                            <input 
                                type="email" 
                                placeholder="TU@CORREO.COM" 
                                className={`relative w-full bg-[#0F0F11] border p-5 rounded-2xl font-black text-sm text-center uppercase tracking-widest outline-none transition-all placeholder-white/10 ${isAdminMode ? 'border-red-600/50 focus:border-red-500' : 'border-white/10 focus:border-white/30'}`}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={status !== 'idle'}
                                autoFocus
                            />
                        </div>

                        {isAdminMode && (
                            <div className="relative animate-in slide-in-from-top-2 duration-500">
                                <div className="absolute -inset-1 bg-red-600/20 rounded-2xl blur-sm"></div>
                                <input 
                                    type="password" 
                                    placeholder="CLAVE MAESTRA" 
                                    className="relative w-full bg-[#0F0F11] border border-red-600/40 p-5 rounded-2xl font-black text-sm text-center uppercase tracking-[0.5em] outline-none focus:border-red-500 transition-all placeholder-red-900/40 text-red-500"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={status !== 'idle'}
                                />
                                <p className="text-[8px] text-red-500/40 font-black uppercase text-center mt-2 tracking-widest">Acceso Privado Administrador</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl animate-in fade-in zoom-in-95">
                            <p className="text-[10px] text-red-500 font-black uppercase text-center leading-relaxed">{error}</p>
                        </div>
                    )}

                    <button 
                        disabled={status !== 'idle' || !email.trim() || (isAdminMode && !password.trim())}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] transition-all shadow-2xl relative overflow-hidden ${status === 'loading' ? 'bg-white/5 text-white/20' : isAdminMode ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-white text-black hover:bg-gray-200'} active:scale-95`}
                    >
                        {status === 'loading' ? 'IDENTIFICANDO...' : status === 'sent' ? 'ACCESO CONCEDIDO' : isAdminMode ? 'INICIAR SESIÓN ALPHA' : 'SOLICITAR ENTRADA →'}
                        {status === 'loading' && <div className={`absolute bottom-0 left-0 h-1 animate-[loading_2s_ease-in-out_infinite] ${isAdminMode ? 'bg-red-500' : 'bg-blue-500'}`} />}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-[8px] font-black text-white/10 uppercase tracking-widest leading-relaxed">
                        {isAdminMode 
                            ? "ESTÁS INTENTANDO ACCEDER A LA RED MAESTRA DE KINETIX. CUALQUIER INTENTO FALLIDO SERÁ MONITOREADO."
                            : "Si no tienes acceso, contacta a tu Head Coach para ser dado de alta en el sistema."}
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes loading {
                    0% { width: 0%; left: 0; }
                    50% { width: 70%; left: 15%; }
                    100% { width: 0%; left: 100%; }
                }
            `}</style>
        </div>
    );
};
