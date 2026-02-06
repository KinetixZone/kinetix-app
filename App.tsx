import React, { useState, useEffect, useCallback } from 'react'; 
import { Workout, User, Goal, UserLevel, ProgressState } from './types/kinetix';
import { LiveTracker } from './components/workout/LiveTracker';
import { AthleteHome } from './components/player/AthleteHome';
import { CoachHome } from './components/coach/CoachHome'; 
import { AthleteCRM } from './components/coach/AthleteCRM'; 
import { ExerciseLibrary } from './components/admin/ExerciseLibrary';
import { WorkoutManager } from './components/coach/WorkoutManager';
import { AdminDashboard } from './components/admin/AdminDashboard'; 
import { calendarService } from './services/calendarService';
import { storageService } from './services/storageService';

const EMPTY_WORKOUT: Workout = {
  id: 'empty-state',
  name: 'Descanso Total',
  day: 0,
  exercises: [] 
};

const DEFAULT_WORKOUT: Workout = {
  id: 'workout-1',
  name: 'Kinetix Elite Demo',
  day: 1,
  exercises: [
    {
      exerciseId: 'hal-1',
      name: 'Clean & Jerk',
      targetSets: 3,
      targetReps: '3',
      method: 'ahap',
      targetRest: 90,
      videoUrl: 'https://www.youtube.com/embed/J2YH8S6-Pss'
    }
  ]
};

const SocialIcons = {
    WhatsApp: () => (
        <svg className="w-[60%] h-[60%]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03a11.811 11.811 0 001.592 5.96L0 24l6.117-1.605a11.794 11.794 0 005.925 1.585h.005c6.635 0 12.032-5.396 12.035-12.03a11.799 11.799 0 00-3.617-8.53z"/>
        </svg>
    ),
    Instagram: () => (
        <svg className="w-[55%] h-[55%]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
    ),
    Facebook: () => (
        <svg className="w-[55%] h-[55%]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.324v-21.35c0-.732-.593-1.325-1.323-1.325z"/>
        </svg>
    )
};

const RoleSelectionScreen: React.FC<{ onSelect: (role: 'coach' | 'client' | 'owner') => void }> = ({ onSelect }) => (
    <div className="min-h-screen bg-[#050507] flex flex-col relative overflow-hidden font-sans text-white">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] bg-red-600/10 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center space-y-10 md:space-y-14 max-w-5xl mx-auto w-full">
            
            <div className="space-y-4 md:space-y-6 animate-in fade-in zoom-in duration-1000">
                <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-900 rounded-full border border-white/20 shadow-[0_0_20px_rgba(220,38,38,0.4)] mb-2">
                    <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white">
                        Jorge González — Head Coach
                    </p>
                </div>
                
                <div className="relative">
                    <h1 className="text-4xl sm:text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-white leading-[0.8] flex flex-col items-center">
                        <span className="mb-2">Kinetix</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">Elite</span>
                    </h1>
                    <div className="h-1 w-20 md:w-32 bg-red-600 mx-auto mt-4 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                </div>
                <p className="text-[9px] md:text-[11px] font-bold text-white/30 uppercase tracking-[0.6em]">Functional Zone OS v6.8.5 — Mobile</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 w-full max-w-4xl animate-in slide-in-from-bottom-12 duration-1000 delay-200">
                <button 
                    onClick={() => onSelect('client')}
                    className="group relative bg-[#101012]/80 backdrop-blur-3xl border border-white/5 hover:border-red-600 p-8 md:p-12 rounded-[45px] transition-all hover:scale-[1.02] flex flex-col items-center gap-5 md:gap-8 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-600/5 group-hover:from-red-600/15 transition-all" />
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-[30px] flex items-center justify-center text-5xl md:text-6xl group-hover:bg-red-600/30 transition-all">🏋️</div>
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white group-hover:text-red-500 transition-colors tracking-tight leading-none">Atleta Elite</h3>
                        <p className="text-[8px] md:text-[10px] text-white/20 uppercase tracking-[0.4em] mt-2 md:mt-4">Operaciones</p>
                    </div>
                </button>

                <button 
                    onClick={() => onSelect('coach')}
                    className="group relative bg-[#101012]/80 backdrop-blur-3xl border border-white/5 hover:border-blue-500 p-8 md:p-12 rounded-[45px] transition-all hover:scale-[1.02] flex flex-col items-center gap-5 md:gap-8 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/5 group-hover:from-blue-600/15 transition-all" />
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/5 rounded-[30px] flex items-center justify-center text-5xl md:text-6xl group-hover:bg-blue-600/30 transition-all">🧢</div>
                    <div className="relative z-10">
                        <h3 className="text-2xl md:text-3xl font-black uppercase italic text-white group-hover:text-blue-400 transition-colors tracking-tight leading-none">Staff Coach</h3>
                        <p className="text-[8px] md:text-[10px] text-white/20 uppercase tracking-[0.4em] mt-2 md:mt-4">Comando</p>
                    </div>
                </button>
            </div>
            
            <button 
                onClick={() => onSelect('owner')}
                className="group flex items-center gap-4 px-10 py-4 bg-white/5 hover:bg-white text-white/30 hover:text-black rounded-full border border-white/10 transition-all animate-in fade-in delay-700 shadow-xl"
            >
                <span className="text-[9px] font-black uppercase tracking-[0.5em]">Terminal Overlord</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">🔐</span>
            </button>
        </div>

        <div className="relative z-10 p-8 md:p-10 border-t border-white/5 bg-black/50 backdrop-blur-3xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">© 2026 Kinetix Functional Zone</p>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                    <p className="text-[8px] font-bold text-red-700 uppercase tracking-widest">High Performance Unit — Sinaloa</p>
                </div>
            </div>
            
            <div className="flex gap-8 items-center">
                <a href="https://wa.me/525627303189" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3">
                    <div className="w-15 h-15 md:w-16 md:h-16 rounded-[22px] bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white group-hover:scale-110 transition-all relative overflow-hidden">
                        <SocialIcons.WhatsApp />
                    </div>
                    <span className="text-[8px] font-black text-white/20 group-hover:text-white uppercase tracking-widest transition-colors">Directo</span>
                </a>

                <a href="https://www.instagram.com/kinetix.zone/" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3">
                    <div className="w-15 h-15 md:w-16 md:h-16 rounded-[22px] bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-gradient-to-br group-hover:from-[#f9ce34] group-hover:via-[#ee2a7b] group-hover:to-[#6228d7] group-hover:text-white group-hover:scale-110 transition-all relative overflow-hidden">
                        <SocialIcons.Instagram />
                    </div>
                    <span className="text-[8px] font-black text-white/20 group-hover:text-white uppercase tracking-widest transition-colors">Social</span>
                </a>

                <a href="https://www.facebook.com/people/Kinetix-Functional-Zone/61577641223744/" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-3">
                    <div className="w-15 h-15 md:w-16 md:h-16 rounded-[22px] bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-[#1877F2] group-hover:text-white group-hover:scale-110 transition-all relative overflow-hidden">
                        <SocialIcons.Facebook />
                    </div>
                    <span className="text-[8px] font-black text-white/20 group-hover:text-white uppercase tracking-widest transition-colors">Facebook</span>
                </a>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'manager' | 'tracker' | 'analytics' | 'crm' | 'library' | 'athlete_home' | 'admin_dashboard'>('athlete_home');
  const [currentWorkout, setCurrentWorkout] = useState<Workout>(EMPTY_WORKOUT);
  const [availableTemplates, setAvailableTemplates] = useState<Workout[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = () => {
        storageService.init(DEFAULT_WORKOUT);
        const localUser = storageService.getUser();
        if (localUser) {
            setUser(localUser);
            if (localUser.role === 'client') setView('athlete_home');
            else if (localUser.role === 'owner') setView('admin_dashboard');
            else setView('home');
        }
        setAvailableTemplates(storageService.getTemplates());
        setIsLoading(false);
    };
    initApp();
  }, []);

  const refreshWorkoutContext = useCallback(() => {
    if (!user) return;
    setAvailableTemplates(storageService.getTemplates());
    const today = new Date();
    
    // DETECCIÓN ROBUSTA: Intentamos encontrar la sesión agendada hoy
    const scheduledWorkoutId = calendarService.getScheduledSession(today, user.id);
    
    if (scheduledWorkoutId) {
      const scheduledWorkout = storageService.getWorkoutById(scheduledWorkoutId);
      if (scheduledWorkout) {
        setCurrentWorkout(scheduledWorkout);
        return;
      }
    }
    // Si no hay nada, volvemos a estado vacío
    setCurrentWorkout(EMPTY_WORKOUT);
  }, [user]);

  useEffect(() => {
    if (user && view === 'athlete_home') {
        refreshWorkoutContext();
    }
  }, [user, view, refreshWorkoutContext]);

  const handleRoleSelect = (role: 'coach' | 'client' | 'owner') => {
      const newUser: User = {
          id: role === 'client' ? 'athlete-101' : (role === 'owner' ? 'owner-1' : 'coach-1'),
          name: role === 'client' ? 'Atleta Demo' : (role === 'owner' ? 'Jorge González' : 'Coach Staff'),
          email: `${role}@kinetix.com`,
          role: role,
          goal: Goal.PERFORMANCE,
          level: UserLevel.ADVANCED,
          daysPerWeek: 5,
          equipment: ['Full Gym'],
          streak: 12,
          createdAt: new Date().toISOString(),
          isActive: true
      };
      storageService.saveUser(newUser);
      setUser(newUser);
      
      if (role === 'owner') setView('admin_dashboard');
      else if (role === 'client') setView('athlete_home');
      else setView('home');
  };

  const handleLogout = () => {
      storageService.logout();
      setUser(null);
      setCurrentWorkout(EMPTY_WORKOUT);
      setView('athlete_home');
  };

  const handleStartSession = (workout: Workout) => {
      setCurrentWorkout(workout);
      setView('tracker');
  };

  const handleFinishWorkout = (progress: ProgressState) => {
    storageService.saveSessionLogs(progress.workoutLogs);
    storageService.markSessionComplete(currentWorkout.id);
    // IMPORTANTE: Refrescar el contexto después de completar para que el calendario se actualice
    refreshWorkoutContext();
    setView(user?.role === 'client' ? 'athlete_home' : 'home');
  };

  if (isLoading) return <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center text-red-600 font-black animate-pulse uppercase tracking-[0.5em]">
    <div className="text-6xl mb-4 text-red-600 shadow-[0_0_50px_rgba(220,38,38,0.4)]">⚡</div>
    Kinetix Elite OS
  </div>;

  if (!user) return <RoleSelectionScreen onSelect={handleRoleSelect} />;

  if (user.role === 'client') {
      return (
        <div className="min-h-screen bg-[#050507] text-white">
            {view === 'tracker' ? (
                <LiveTracker workout={currentWorkout} user={user} onFinish={handleFinishWorkout} />
            ) : (
                <AthleteHome 
                    user={user} 
                    currentWorkout={currentWorkout} 
                    availableWorkouts={availableTemplates}
                    onStartSession={handleStartSession}
                    onLogout={handleLogout}
                />
            )}
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white pb-32">
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F0F11]/95 backdrop-blur-3xl border border-white/10 px-6 md:px-10 py-5 rounded-[35px] flex gap-8 md:gap-14 z-[500] shadow-[0_30px_70px_rgba(0,0,0,0.8)]">
            <button onClick={() => setView('home')} className={`group flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-red-500 scale-110' : 'text-white/40 hover:text-white'}`}>
                <span className="text-xl">📊</span>
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Mando</span>
            </button>
            <button onClick={() => setView('crm')} className={`group flex flex-col items-center gap-1 transition-all ${view === 'crm' ? 'text-red-500 scale-110' : 'text-white/40 hover:text-white'}`}>
                <span className="text-xl">👥</span>
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Atletas</span>
            </button>
            <button onClick={() => setView('manager')} className={`group flex flex-col items-center gap-1 transition-all ${view === 'manager' ? 'text-red-500 scale-110' : 'text-white/40 hover:text-white'}`}>
                <span className="text-xl">📐</span>
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Protocolo</span>
            </button>
            
            {(user.role === 'admin' || user.role === 'owner') && (
                <button onClick={() => setView('admin_dashboard')} className={`group flex flex-col items-center gap-1 transition-all ${view === 'admin_dashboard' ? 'text-blue-500 scale-110' : 'text-white/40 hover:text-white'}`}>
                    <span className="text-xl">🔐</span>
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Búnker</span>
                </button>
            )}
            
            <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-900 border-l border-white/10 pl-6 md:pl-8 group">
                <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Off</span>
            </button>
        </nav>

        <main className="animate-in fade-in duration-500">
            {view === 'tracker' && <LiveTracker workout={currentWorkout} user={user} onFinish={handleFinishWorkout} />}
            {view === 'home' && <CoachHome onViewChange={setView} />}
            {view === 'crm' && <AthleteCRM onSwitchUser={refreshWorkoutContext} />}
            {view === 'library' && <ExerciseLibrary />}
            {view === 'manager' && <WorkoutManager />}
            {view === 'admin_dashboard' && <AdminDashboard currentUser={user} onNavigate={setView} />}
        </main>
    </div>
  );
};

export default App;
