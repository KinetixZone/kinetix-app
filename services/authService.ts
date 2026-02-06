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

    const isAdminMode = useMemo(() => authService.isAdminEmail(email), [email]);

    const handleAccessRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) return setError("CREDENCIAL NO VÁLIDA");
        if (isAdminMode && !password) return setError("AUTORIZACIÓN ALPHA REQUERIDA");

        setStatus('loading');
        setError(null);

        const { success, error: authError } = await authService.requestAccess(email, isAdminMode ? password : undefined);
        
        if (success) {
            const profile = await authService.finalizeLogin(email);
            if (profile) {
                setTimeout(() => onLoginSuccess(profile), 1500);
                setStatus('sent');
            } else {
                setError("FALLO EN ENLACE DE DATOS");
                setStatus('idle');
            }
        } else {
            setError(authError?.toUpperCase() || "ACCESO DENEGADO");
            setStatus('idle');
        }
    };

    return (
        <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-between p-6 text-white relative overflow-hidden selection:bg-red-600">
            
            {/* TACTICAL BACKGROUND GRID */}
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-40 z-0"></div>
            
            {/* DYNAMIC GLOWS */}
            <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[150px] rounded-full transition-all duration-1000 z-0 ${isAdminMode ? 'bg-red-600/20' : 'bg-blue-600/10'}`}></div>

            {/* TOP SECTION: BRANDING & LOGO */}
            <div className="relative z-10 pt-10 flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-top-12 duration-1000">
                {/* Logo Frame */}
                <div className="relative group">
                    <div className={`absolute -inset-4 rounded-full blur-3xl transition-all duration-700 animate-pulse ${isAdminMode ? 'bg-red-600/40' : 'bg-white/5 opacity-50'}`}></div>
                    <div className={`relative w-32 h-32 md:w-44 md:h-44 bg-black border-2 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 shadow-2xl ${isAdminMode ? 'border-red-600' : 'border-white/10'}`}>
                        {/* FALLBACK LOGO */}
                        <div className="flex flex-col items-center">
                            <span className={`text-6xl md:text-7xl font-black italic tracking-tighter leading-none transition-colors duration-500 ${isAdminMode ? 'text-red-600' : 'text-white'}`}>K</span>
                            <div className={`h-1.5 w-10 mt-1 transition-colors duration-500 ${isAdminMode ? 'bg-red-600' : 'bg-white/20'}`}></div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] mb-2">
                        KINETIX<br/>
                        <span className={isAdminMode ? 'text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'text-white'}>ZONE</span>
                    </h1>
                    <div className="flex flex-col items-center">
                        <div className={`h-[2px] w-24 my-3 transition-colors duration-500 ${isAdminMode ? 'bg-red-600' : 'bg-white/10'}`}></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 italic">Lead by Jorge González</p>
                    </div>
                </div>
            </div>

            {/* CENTER SECTION: AUTH TERMINAL */}
            <div className="w-full max-w-sm relative z-10 space-y-8 my-8">
                <div className="text-center">
                    <div className={`inline-block px-5 py-1.5 rounded-sm border transition-all duration-500 ${isAdminMode ? 'bg-red-600/10 border-red-500/40' : 'bg-white/5 border-white/10'}`}>
                        <p className={`text-[9px] font-black uppercase tracking-[0.6em] ${isAdminMode ? 'text-red-500 animate-pulse' : 'text-white/30'}`}>
                            {isAdminMode ? 'SISTEMA ALPHA: IDENTIFICADO' : 'Terminal de Acceso Obsidian'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAccessRequest} className="space-y-4">
                    <div className="space-y-3">
                        <div className="relative group">
                            <input 
                                type="email" 
                                placeholder="IDENTIFICADOR (EMAIL)" 
                                className={`w-full bg-black/60 backdrop-blur-xl border p-5 rounded-none font-black text-xs text-center uppercase tracking-[0.3em] outline-none transition-all placeholder-white/10 ${isAdminMode ? 'border-red-600/50 focus:border-red-500 text-red-500 shadow-[inset_0_0_20px_rgba(220,38,38,0.05)]' : 'border-white/10 focus:border-white/30 focus:bg-white/5'}`}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={status !== 'idle'}
                                autoFocus
                            />
                        </div>

                        {isAdminMode && (
                            <div className="relative animate-in slide-in-from-top-4 duration-500">
                                <input 
                                    type="password" 
                                    placeholder="CLAVE ALPHA MAESTRA" 
                                    className="w-full bg-red-950/20 border border-red-600/50 p-5 rounded-none font-black text-xs text-center uppercase tracking-[0.6em] outline-none focus:border-red-500 text-red-600 placeholder-red-900/40 shadow-[0_0_30px_rgba(220,38,38,0.1)]"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={status !== 'idle'}
                                />
                                <div className="absolute top-0 right-4 h-full flex items-center">
                                    <span className="text-[7px] font-black text-red-600 opacity-50 uppercase tracking-tighter">SECURED_L5</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="p-4 bg-red-950/40 border border-red-600/40 rounded-none animate-in zoom-in-95">
                            <p className="text-[10px] text-red-500 font-black uppercase text-center tracking-widest">{error}</p>
                        </div>
                    )}

                    <button 
                        disabled={status !== 'idle' || !email.trim() || (isAdminMode && !password.trim())}
                        className={`w-full py-6 rounded-none font-black uppercase text-[11px] tracking-[0.6em] transition-all relative overflow-hidden border shadow-2xl active:scale-[0.98] ${status === 'loading' ? 'bg-white/5 text-white/20 border-white/5' : isAdminMode ? 'bg-red-600 text-white border-red-500 hover:bg-red-700 shadow-[0_0_40px_rgba(220,38,38,0.4)]' : 'bg-white text-black border-white hover:bg-gray-100'} `}
                    >
                        <span className="relative z-10">
                            {status === 'loading' ? 'VERIFICANDO...' : status === 'sent' ? 'ACCESO OK' : isAdminMode ? 'DESBLOQUEAR TERMINAL' : 'ENTRAR AL SISTEMA'}
                        </span>
                        {status === 'loading' && <div className="absolute bottom-0 left-0 h-1 bg-red-500 animate-[loading_2s_ease-in-out_infinite]" />}
                    </button>
                </form>
            </div>

            {/* BOTTOM SECTION: SOCIAL HUB MILSPEC */}
            <div className="relative z-10 w-full max-w-lg pb-10 flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
                <div className="flex gap-8 md:gap-12 items-center">
                    {/* Facebook */}
                    <a href="https://facebook.com/kinetix.funcionalzone" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2">
                        <div className="w-12 h-12 border border-white/10 rounded-sm flex items-center justify-center bg-white/5 group-hover:bg-[#1877F2] group-hover:border-[#1877F2] transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.74h-2.94v-3.403h2.94v-2.511c0-2.91 1.777-4.496 4.375-4.496 1.243 0 2.312.093 2.623.134v3.042l-1.802.001c-1.411 0-1.685.671-1.685 1.655v2.17h3.368l-.438 3.403h-2.93v8.74h6.104c.732 0 1.325-.593 1.325-1.324v-21.351c0-.732-.593-1.325-1.325-1.325z"/></svg>
                        </div>
                    </a>
                    {/* Instagram */}
                    <a href="https://instagram.com/kinetix.funcionalzone" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2">
                        <div className="w-12 h-12 border border-white/10 rounded-sm flex items-center justify-center bg-white/5 group-hover:bg-[#E4405F] group-hover:border-[#E4405F] transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </div>
                    </a>
                    {/* WhatsApp */}
                    <a href="https://wa.me/525627303189" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2">
                        <div className="w-12 h-12 border border-white/10 rounded-sm flex items-center justify-center bg-white/5 group-hover:bg-[#25D366] group-hover:border-[#25D366] transition-all duration-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.893-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.335 11.892-11.893 11.892-1.99 0-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.887 9.884 0 2.221.596 3.776 1.598 5.391l-.999 3.647 3.888-.94zm10.387-5.673c-.282-.14-.343-.201-1.018-.537-.676-.337-.796-.337-.937-.537-.14-.201-.06-.537.141-.737l.301-.302c.201-.201.282-.321.121-.522-.162-.201-.683-1.644-.937-2.261-.254-.617-.506-.537-.696-.547-.183-.008-.393-.01-.603-.01s-.543.07-.824.381c-.282.311-1.076 1.052-1.076 2.562 0 1.51 1.1 2.968 1.25 3.17.151.201 2.162 3.301 5.239 4.634.731.317 1.302.507 1.746.648.734.233 1.404.2 1.933.121.59-.088 1.812-.741 2.067-1.458.254-.716.254-1.328.181-1.458-.072-.13-.262-.201-.543-.342z"/></svg>
                        </div>
                    </a>
                </div>

                <div className="flex flex-col items-center gap-4 pt-8 w-full border-t border-white/5">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                            <span className="text-[9px] font-black text-red-600/60 uppercase tracking-widest">Protocolo Alpha Activo</span>
                        </div>
                        <div className="h-3 w-[1px] bg-white/10" />
                        <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">v150.0_OBSIDIAN</span>
                    </div>
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
