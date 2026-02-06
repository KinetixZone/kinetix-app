
import React, { useState, useMemo, useEffect } from 'react';
import { User, Workout, Goal, UserLevel, CalendarEvent } from '../../types/kinetix';
import { storageService } from '../../services/storageService';
import { calendarService } from '../../services/calendarService';
import { ExerciseBlockEditor } from './ExerciseBlockEditor';

// --- SUB-COMPONENT: ATHLETE FORM MODAL (ALTA/EDICIÓN) ---
const AthleteFormModal: React.FC<{ 
    athlete?: User | null; // Null = Crear Nuevo
    onClose: () => void; 
    onSave: (user: User) => void 
}> = ({ athlete, onClose, onSave }) => {
    
    // Estado inicial seguro con valores por defecto para evitar errores
    const [formData, setFormData] = useState<User>(athlete || {
        id: `ath-${Date.now()}`,
        name: '',
        email: '',
        role: 'client',
        goal: Goal.PERFORMANCE,
        level: UserLevel.BEGINNER,
        daysPerWeek: 4,
        equipment: ['Full Gym'],
        streak: 0,
        createdAt: new Date().toISOString(),
        isActive: true, // Por defecto activo para evitar bloqueo inmediato
        cycleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 días default
        age: 0,
        weight: 0,
        injuries: '',
        medicalConditions: ''
    });

    const handleSubmit = () => {
        // VALIDACIÓN BÁSICA: Evitar usuarios sin identificadores
        if (!formData.name.trim()) return alert("El Nombre es obligatorio.");
        if (!formData.email.trim()) return alert("El Email es obligatorio para el acceso.");
        
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95">
            <div className="bg-[#0F0F11] w-full max-w-2xl rounded-[40px] border border-white/10 p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                            {athlete ? 'Editar Perfil' : 'Nuevo Atleta'}
                        </h2>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            {athlete ? `ID: ${athlete.id}` : 'Alta de usuario en Kinetix'}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center text-white transition-colors">✕</button>
                </div>

                <div className="space-y-6">
                    {/* BÁSICOS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Nombre Completo *</label>
                            <input type="text" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-red-600 transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Ana García" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Email (Login) *</label>
                            <input type="email" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-red-600 transition-colors" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ana@mail.com" />
                        </div>
                    </div>

                    {/* DATOS MÉDICOS / BIO */}
                    <div className="bg-white/5 p-4 rounded-2xl space-y-4 border border-white/5">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Ficha Bio-Médica</p>
                            <span className="text-[9px] text-white/20">Opcional</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Edad</label>
                                <input type="number" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={formData.age || ''} onChange={e => setFormData({...formData, age: parseInt(e.target.value)})} placeholder="Años" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Peso (KG)</label>
                                <input type="number" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: parseInt(e.target.value)})} placeholder="KG" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Padecimientos</label>
                            <input type="text" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={formData.medicalConditions || ''} onChange={e => setFormData({...formData, medicalConditions: e.target.value})} placeholder="Ej: Asma, Hipertensión..." />
                        </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Lesiones Activas</label>
                            <input type="text" className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={formData.injuries || ''} onChange={e => setFormData({...formData, injuries: e.target.value})} placeholder="Ej: Menisco rodilla derecha..." />
                        </div>
                    </div>

                    {/* PERFIL ENTRENAMIENTO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Objetivo</label>
                            <select className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value as Goal})}>
                                {Object.values(Goal).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Nivel</label>
                            <select className="w-full bg-black border border-white/10 rounded-xl p-3 text-white font-bold" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as UserLevel})}>
                                {Object.values(UserLevel).map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* CONTROL ACCESO */}
                    <div className="bg-yellow-900/10 p-4 rounded-2xl border border-yellow-500/20 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Fin de Ciclo / Pago</p>
                            <p className="text-xs text-white/50">Fecha límite de acceso antes de alerta.</p>
                         </div>
                         <input 
                            type="date" 
                            className="bg-black border border-white/10 rounded-xl p-3 text-white font-bold focus:border-yellow-500 outline-none"
                            value={formData.cycleEndDate || ''}
                            onChange={e => setFormData({...formData, cycleEndDate: e.target.value})}
                         />
                    </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                    <button onClick={onClose} className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95">
                        {athlete ? 'Guardar Cambios' : 'Confirmar Alta'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: VENUE BATCH SCHEDULER MODAL (EXISTENTE) ---
const VenueSchedulerModal: React.FC<{ 
    athlete: User; 
    onClose: () => void; 
    onApply: () => void 
}> = ({ athlete, onClose, onApply }) => {
    const [config, setConfig] = useState({
        startDate: new Date().toISOString().split('T')[0],
        weeks: 4,
        days: [] as number[], // 0=Dom, 1=Lun...
        mode: 'set_venue' as 'set_venue' | 'set_remote'
    });

    const toggleDay = (d: number) => {
        setConfig(prev => ({
            ...prev,
            days: prev.days.includes(d) ? prev.days.filter(x => x !== d) : [...prev.days, d]
        }));
    };

    const handleExecute = () => {
        if (config.days.length === 0) return alert("Selecciona al menos un día.");
        
        const updatedCount = calendarService.batchScheduleVenue(
            athlete.id,
            config.startDate,
            config.weeks,
            config.days,
            config.mode === 'set_venue'
        );

        if (updatedCount > 0) {
            alert(`✅ Calendario Actualizado: ${updatedCount} días procesados.`);
        } else {
            alert("⚠ No se realizaron cambios.");
        }
        
        onApply();
    };

    const weekDays = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

    return (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
            <div className="bg-[#0F0F11] w-full max-w-md rounded-[40px] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-1 relative z-10">Agenda de Clases</h2>
                <div className="space-y-6 relative z-10 mt-6">
                    <div className="flex bg-white/5 p-1 rounded-xl">
                        <button 
                            onClick={() => setConfig({...config, mode: 'set_venue'})}
                            className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${config.mode === 'set_venue' ? 'bg-red-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                        >
                            Agendar Clase
                        </button>
                        <button 
                             onClick={() => setConfig({...config, mode: 'set_remote'})}
                             className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${config.mode === 'set_remote' ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
                        >
                            Hacer Remoto
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-white/30 uppercase tracking-widest">Desde</label>
                            <input type="date" className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-red-600" value={config.startDate} onChange={e => setConfig({...config, startDate: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-white/30 uppercase tracking-widest">Duración</label>
                            <select className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none" value={config.weeks} onChange={e => setConfig({...config, weeks: parseInt(e.target.value)})}>
                                {[1, 2, 4, 8, 12, 16].map(w => <option key={w} value={w}>{w} Semanas</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[8px] font-black text-white/30 uppercase tracking-widest">Días de Clase</label>
                        <div className="flex justify-between gap-2">
                            {weekDays.map((d, i) => (
                                <button key={i} onClick={() => toggleDay(i)} className={`w-10 h-10 rounded-full text-xs font-black transition-all ${config.days.includes(i) ? 'bg-red-600 text-white scale-110 shadow-lg' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}>
                                {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
                    <button onClick={onClose} className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest">Cancelar</button>
                    <button onClick={handleExecute} className="flex-1 py-4 rounded-xl bg-white text-black hover:bg-gray-200 text-[9px] font-black uppercase tracking-widest shadow-lg">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE CALENDARIO VISUAL ---
const AthleteCalendar: React.FC<{ 
  athleteId: string; 
  onDayClick: (dateStr: string, event?: CalendarEvent) => void;
  eventsTrigger: number; 
  onOpenScheduler: () => void; 
}> = ({ athleteId, onDayClick, eventsTrigger, onOpenScheduler }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const events = useMemo(() => {
    return calendarService.getEvents().filter(e => e.athleteIds.includes(athleteId));
  }, [athleteId, eventsTrigger, currentDate]); 

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); 

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null); 
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDayEvents = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayStr}`;
    return events.filter(e => e.start.startsWith(dateKey));
  };

  return (
    <div className="bg-black/20 rounded-3xl p-6 border border-white/5 select-none relative">
       <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
             <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="text-white/40 hover:text-white px-2">←</button>
             <h3 className="text-lg font-black uppercase italic tracking-widest">{currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
             <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="text-white/40 hover:text-white px-2">→</button>
          </div>
          <button onClick={onOpenScheduler} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
             <span>📍</span> Agenda Sede
          </button>
       </div>

       <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {['D','L','M','M','J','V','S'].map(d => <span key={d} className="text-[10px] font-black text-white/20">{d}</span>)}
       </div>
       <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
             if (!day) return <div key={idx} className="aspect-square" />;
             const dayEvents = getDayEvents(day);
             const hasWorkout = dayEvents.some(e => e.type === 'workout');
             const isVenue = hasWorkout && dayEvents[0]?.location === 'Kinetix Functional Zone';
             const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getTime() < new Date().setHours(0,0,0,0);

             return (
               <div 
                 key={idx} 
                 onClick={() => onDayClick(`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`, dayEvents[0])}
                 className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                    hasWorkout 
                        ? isVenue 
                            ? 'bg-gradient-to-br from-red-900 to-black border-red-500 shadow-[0_0_10px_rgba(255,0,0,0.4)]' 
                            : 'bg-white/5 border-white/20 hover:bg-white/10' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                 } ${isPast ? 'opacity-50' : ''}`}
               >
                  <span className={`text-xs font-bold ${isVenue ? 'text-white drop-shadow-md' : ''}`}>{day}</span>
                  {hasWorkout && !isVenue && <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-1" />}
                  {isVenue && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
               </div>
             );
          })}
       </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
interface Props {
  onSwitchUser?: () => void;
}

export const AthleteCRM: React.FC<Props> = ({ onSwitchUser }) => {
  const [athletes, setAthletes] = useState<User[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'suspended'>('all');
  const [tab, setTab] = useState<'profile' | 'calendar'>('profile'); 
  
  const [editingInstance, setEditingInstance] = useState<Workout | null>(null);
  const [calendarTrigger, setCalendarTrigger] = useState(0); 
  const [showScheduler, setShowScheduler] = useState(false);
  const [templates, setTemplates] = useState<Workout[]>([]);

  // NEW: State for Modal (Control de Visibilidad)
  const [showFormModal, setShowFormModal] = useState(false);
  const [athleteToEdit, setAthleteToEdit] = useState<User | null>(null);

  // INIT DATA
  useEffect(() => {
    setAthletes(storageService.getAthletes());
    setTemplates(storageService.getTemplates());
  }, []);

  useEffect(() => {
    setCalendarTrigger(prev => prev + 1);
  }, [selectedAthlete]);

  // HELPER: Calculate Cycle Status (SEMÁFORO)
  const getCycleStatus = (athlete: User): 'active' | 'expiring' | 'suspended' => {
      if (athlete.isActive === false) return 'suspended';
      if (!athlete.cycleEndDate) return 'active'; 
      
      const end = new Date(athlete.cycleEndDate);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) return 'expiring'; // Amarillo si faltan 7 días o menos
      return 'active';
  };

  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => {
      const status = getCycleStatus(a);
      if (filter === 'all') return true;
      return status === filter;
    });
  }, [athletes, filter]);

  // GROUPED TEMPLATES FOR SOS SELECTION
  const groupedTemplates = useMemo(() => {
      const travel = templates.filter(t => t.category === 'travel');
      const general = templates.filter(t => t.category !== 'travel');
      return { travel, general };
  }, [templates]);

  const handleImpersonate = () => {
    if(!selectedAthlete) return;
    if(selectedAthlete.isActive === false) {
        alert("⛔ No puedes simular a un usuario SUSPENDIDO. Activa su acceso primero.");
        return;
    }
    storageService.saveUser(selectedAthlete);
    alert(`🔐 Modo Demo: Has iniciado sesión como ${selectedAthlete.name}`);
    if(onSwitchUser) onSwitchUser();
  };
  
  const handleUpdateUser = (updates: Partial<User>) => {
      if(!selectedAthlete) return;
      const updatedUser = { ...selectedAthlete, ...updates };
      setSelectedAthlete(updatedUser);
      
      // Persistir en "DB"
      const newAthletes = athletes.map(a => a.id === updatedUser.id ? updatedUser : a);
      setAthletes(newAthletes);
      storageService.saveAthletes(newAthletes);
  };

  // --- CRUD ATLETAS ---
  const openNewAthleteModal = () => {
      setAthleteToEdit(null); // Null = Crear Nuevo
      setShowFormModal(true);
  };

  const openEditAthleteModal = () => {
      if(!selectedAthlete) return;
      setAthleteToEdit(selectedAthlete); // Pasa el usuario actual para editar
      setShowFormModal(true);
  };

  const handleSaveAthlete = (user: User) => {
      let newAthletes = [...athletes];
      
      if (athleteToEdit) {
          // Edición
          newAthletes = newAthletes.map(a => a.id === user.id ? user : a);
          setSelectedAthlete(user); // Actualizar vista actual si es el mismo
      } else {
          // Creación
          newAthletes.push(user);
      }

      setAthletes(newAthletes);
      storageService.saveAthletes(newAthletes);
      setShowFormModal(false);
  };

  // --- LOGICA CRÍTICA: EDICIÓN DE INSTANCIA (Igual que antes) ---
  const handleDayClick = (dateStr: string, event?: CalendarEvent) => {
    if (!selectedAthlete) return;
    if (event && event.workoutTemplateId) {
        let workout = storageService.getWorkoutById(event.workoutTemplateId);
        if (workout) {
            const newInstanceId = workout.isTemplate 
                ? `inst-${workout.id}-${selectedAthlete.id}-${dateStr}` 
                : workout.id;
            
            setEditingInstance({
                ...workout,
                id: newInstanceId,
                isTemplate: false,
                name: workout.isTemplate ? `${workout.name} (Editado)` : workout.name,
                scheduledDate: dateStr,
                assignedTo: selectedAthlete.id,
                location: event.location 
            });
        }
    }
  };

  const saveInstanceChanges = () => {
    if (!editingInstance || !selectedAthlete) return;
    
    // 1. Guardar la instancia personalizada en Storage
    storageService.saveUserSpecificWorkout(editingInstance);
    
    // 2. Limpiar CUALQUIER sesión previa en ese día para este atleta (Evitar conflictos)
    calendarService.clearDaySessions(selectedAthlete.id, editingInstance.scheduledDate!);

    // 3. Crear el nuevo evento apuntando a la instancia editada
    const newEvent: CalendarEvent = {
        id: `evt-${editingInstance.id}`,
        type: 'workout',
        title: editingInstance.name,
        start: new Date(`${editingInstance.scheduledDate}T12:00:00`).toISOString(),
        end: new Date(`${editingInstance.scheduledDate}T13:00:00`).toISOString(),
        allDay: true,
        coachId: 'coach-me',
        athleteIds: [selectedAthlete.id],
        workoutTemplateId: editingInstance.id,
        location: editingInstance.location 
    };
    calendarService.saveEvent(newEvent);

    // 4. Refrescar UI
    setCalendarTrigger(prev => prev + 1);
    setEditingInstance(null);
  };

  const handleUpdateInstanceExercise = (idx: number, updated: any) => {
    if (!editingInstance) return;
    const newExs = [...editingInstance.exercises];
    newExs[idx] = updated;
    setEditingInstance({ ...editingInstance, exercises: newExs });
  };

  return (
    <div className="h-full pt-20 pb-24 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      
      {/* LEFT COLUMN: LISTA & FILTROS */}
      <div className={`flex-1 flex flex-col gap-6 transition-all ${selectedAthlete ? 'hidden md:flex md:w-1/3' : 'w-full'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Athletes</h1>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{filteredAthletes.length} Registros</p>
          </div>
          <button 
            onClick={openNewAthleteModal}
            className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg flex items-center justify-center text-2xl font-black transition-all active:scale-95"
          >
            +
          </button>
        </div>

        <div className="flex bg-white/5 rounded-full p-1 gap-1 overflow-x-auto custom-scrollbar">
             <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${filter === 'all' ? 'bg-white text-black' : 'text-white/40'}`}>All</button>
             <button onClick={() => setFilter('active')} className={`px-3 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${filter === 'active' ? 'bg-green-600 text-white' : 'text-white/40'}`}>Activos</button>
             <button onClick={() => setFilter('expiring')} className={`px-3 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${filter === 'expiring' ? 'bg-yellow-500 text-black' : 'text-white/40'}`}>Vencen</button>
             <button onClick={() => setFilter('suspended')} className={`px-3 py-2 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${filter === 'suspended' ? 'bg-red-600 text-white' : 'text-white/40'}`}>Off</button>
        </div>

        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 h-[calc(100vh-200px)]">
          {filteredAthletes.map(athlete => {
             const status = getCycleStatus(athlete);
             const statusColors = {
                 active: 'border-white/5 hover:border-white/20',
                 expiring: 'border-yellow-500/50 hover:border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)] bg-yellow-900/10',
                 suspended: 'border-red-600/50 opacity-60 hover:opacity-100 bg-red-900/10'
             };

             return (
                <div 
                  key={athlete.id} 
                  onClick={() => setSelectedAthlete(athlete)}
                  className={`relative p-5 rounded-[24px] border cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group ${selectedAthlete?.id === athlete.id ? 'bg-white text-black border-white' : `bg-[#0F0F11] ${statusColors[status]}`}`}
                >
                   {/* ALERTA DE LESIÓN VISIBLE */}
                   {athlete.injuries && (
                      <span className="absolute top-4 right-4 text-sm animate-pulse" title={`Lesión: ${athlete.injuries}`}>🚑</span>
                   )}

                   <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                         <div className={`w-3 h-3 rounded-full animate-pulse ${status === 'active' ? 'bg-green-500' : status === 'expiring' ? 'bg-yellow-500' : 'bg-red-600'}`} />
                         <h3 className="text-xl font-black uppercase italic tracking-tight">{athlete.name}</h3>
                      </div>
                      <span className={`text-[9px] font-black uppercase border px-2 py-1 rounded-md ${selectedAthlete?.id === athlete.id ? 'border-black/20 text-black/50' : 'border-white/10 text-white/30'}`}>{athlete.goal}</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${selectedAthlete?.id === athlete.id ? 'text-black/40' : 'text-white/20'}`}>Ciclo Fin</p>
                        <div className="flex items-end gap-1">
                           <span className="text-sm font-bold">{athlete.cycleEndDate || 'No def.'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-[8px] font-black uppercase tracking-widest ${selectedAthlete?.id === athlete.id ? 'text-black/40' : 'text-white/20'}`}>Estado</p>
                        <span className={`text-xs font-black uppercase ${status === 'suspended' ? 'text-red-500' : status === 'expiring' ? 'text-yellow-600' : 'text-green-500'}`}>
                           {status === 'suspended' ? 'BLOQUEADO' : status === 'expiring' ? 'RENOVAR' : 'OK'}
                        </span>
                      </div>
                   </div>
                </div>
             );
          })}
          {filteredAthletes.length === 0 && (
             <div className="text-center py-10 opacity-30">
                <p className="text-xs font-black uppercase italic">No hay atletas en esta lista</p>
             </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: COCKPIT */}
      {selectedAthlete && (
        <div className="flex-[2] bg-[#0F0F11] border border-white/5 rounded-[40px] p-6 md:p-10 flex flex-col h-[calc(100vh-140px)] overflow-hidden animate-in slide-in-from-right-10 duration-500 shadow-2xl relative">
           
           <button onClick={() => setSelectedAthlete(null)} className="md:hidden absolute top-6 right-6 text-white/40">✕ Cerrar</button>

           {/* HEADER DEL ATLETA */}
           <div className="flex gap-6 items-center mb-8 pb-8 border-b border-white/5 shrink-0 justify-between">
              <div className="flex gap-6 items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border border-white/10 ${selectedAthlete.isActive === false ? 'bg-red-900 text-red-500' : 'bg-gradient-to-br from-red-600 to-black'}`}>
                   {selectedAthlete.isActive === false ? '🔒' : selectedAthlete.name.charAt(0)}
                </div>
                <div>
                   <h2 className="text-4xl font-black uppercase italic tracking-tighter">{selectedAthlete.name}</h2>
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">{selectedAthlete.email} • {selectedAthlete.level}</p>
                </div>
              </div>
              <div className="flex gap-2">
                  <button onClick={openEditAthleteModal} className="hidden md:flex bg-white/5 hover:bg-white/20 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors border border-white/10">
                    ✎ Editar
                  </button>
                  <button onClick={handleImpersonate} className="hidden md:flex bg-white/10 hover:bg-white text-white hover:text-black px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors border border-white/10">
                    👁 Simular
                  </button>
              </div>
           </div>
           
           {/* TABS DE NAVEGACIÓN */}
           <div className="flex gap-4 mb-6 shrink-0">
              <button onClick={() => setTab('profile')} className={`pb-2 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${tab === 'profile' ? 'border-red-600 text-white' : 'border-transparent text-white/30 hover:text-white'}`}>Ficha & Control</button>
              <button onClick={() => setTab('calendar')} className={`pb-2 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${tab === 'calendar' ? 'border-red-600 text-white' : 'border-transparent text-white/30 hover:text-white'}`}>Calendario / Edición</button>
           </div>

           {/* CONTENIDO */}
           <div className="flex-1 overflow-y-auto custom-scrollbar">
              {tab === 'profile' && (
                 <div className="space-y-6 animate-in fade-in">
                    
                    {/* 1. GATEKEEPER SWITCH (MASTER CONTROL) */}
                    <div className="bg-[#1A1A1D] rounded-3xl p-6 border border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black uppercase italic tracking-tighter">Acceso a Plataforma</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Interruptor Maestro de Servicio</p>
                        </div>
                        <div 
                           onClick={() => handleUpdateUser({ isActive: !selectedAthlete.isActive })}
                           className={`w-16 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${selectedAthlete.isActive ? 'bg-green-600' : 'bg-red-600'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${selectedAthlete.isActive ? 'translate-x-8' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    {/* 2. CICLO Y RENOVACIÓN */}
                    <div className="bg-black/20 rounded-3xl p-6 border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-black uppercase text-yellow-500">Gestión de Ciclo</h3>
                            {getCycleStatus(selectedAthlete) === 'expiring' && <span className="text-[9px] bg-yellow-500 text-black px-2 py-1 rounded font-bold uppercase">Pago Pendiente</span>}
                        </div>
                        <div className="space-y-2">
                             <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Fecha Fin de Mensualidad</label>
                             <input 
                                type="date" 
                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-yellow-500"
                                value={selectedAthlete.cycleEndDate || ''}
                                onChange={e => handleUpdateUser({ cycleEndDate: e.target.value })}
                             />
                        </div>
                    </div>

                    {/* 3. FICHA MÉDICA & DATOS BIO */}
                    <div className="bg-black/20 rounded-3xl p-6 border border-white/5">
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="text-sm font-black uppercase text-blue-400">Ficha del Atleta</h3>
                           <button onClick={openEditAthleteModal} className="text-[9px] font-black uppercase text-white/30 hover:text-white">Editar Datos</button>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 mb-4">
                           <div className="p-3 bg-white/5 rounded-xl">
                               <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Edad</label>
                               <span className="text-lg font-bold">{selectedAthlete.age || '-'} Años</span>
                           </div>
                           <div className="p-3 bg-white/5 rounded-xl">
                               <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Peso</label>
                               <span className="text-lg font-bold">{selectedAthlete.weight || '-'} KG</span>
                           </div>
                       </div>
                       
                       <div className="space-y-4">
                            <div className="p-3 bg-white/5 rounded-xl">
                                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Lesiones Activas</label>
                                <p className="text-xs font-medium text-white/80">{selectedAthlete.injuries || "Sin registro"}</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl">
                                <label className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Padecimientos</label>
                                <p className="text-xs font-medium text-white/80">{selectedAthlete.medicalConditions || "Ninguno"}</p>
                            </div>
                       </div>
                    </div>

                    {/* 4. PLAN B (EMERGENCIA) - UPDATED WITH CATEGORIES */}
                    <div className="bg-[#1A1A1D] rounded-3xl p-6 border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-black uppercase text-white/50">Plan B (Viaje/Casa)</h3>
                            <span className="text-xl">✈️</span>
                        </div>
                        <select 
                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none"
                            value={selectedAthlete.emergencyWorkoutId || ''}
                            onChange={e => handleUpdateUser({ emergencyWorkoutId: e.target.value })}
                        >
                            <option value="">-- Sin Plan (No mostrar) --</option>
                            
                            {/* GROUP 1: TRAVEL WORKOUTS (PRIORITY) */}
                            {groupedTemplates.travel.length > 0 && (
                                <optgroup label="✈️ RUTINAS DE VIAJE / CASA">
                                    {groupedTemplates.travel.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </optgroup>
                            )}

                            {/* GROUP 2: GENERAL WORKOUTS */}
                            <optgroup label="🏋️ GIMNASIO (GENERAL)">
                                {groupedTemplates.general.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </optgroup>
                        </select>
                        {groupedTemplates.travel.length === 0 && (
                             <p className="text-[8px] text-white/30 mt-2 text-center">Tip: Crea rutinas con categoría 'Viaje' en el Manager para verlas aquí primero.</p>
                        )}
                    </div>
                 </div>
              )}

              {tab === 'calendar' && (
                  <div className="animate-in fade-in">
                      {selectedAthlete.isActive === false && (
                          <div className="mb-4 bg-red-900/20 border border-red-500/50 p-4 rounded-xl text-center">
                              <p className="text-[10px] font-black uppercase text-red-500">Atleta Suspendido</p>
                              <p className="text-xs text-white/60">No podrá ver las sesiones agendadas hasta reactivar el acceso.</p>
                          </div>
                      )}
                      <AthleteCalendar 
                          athleteId={selectedAthlete.id} 
                          onDayClick={handleDayClick} 
                          eventsTrigger={calendarTrigger}
                          onOpenScheduler={() => setShowScheduler(true)}
                      />
                  </div>
              )}
           </div>
        </div>
      )}

      {/* --- MODALS OVERLAY (GLOBAL) --- */}
      {/* Se mueven fuera del conditional rendering para asegurar visibilidad */}
      
      {editingInstance && (
          <div className="fixed inset-0 z-[2000] bg-[#0F0F11] flex flex-col p-6 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center mb-6 shrink-0">
                  <div>
                      <h3 className="text-2xl font-black uppercase italic text-red-600">{editingInstance.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Editando sesión del {editingInstance.scheduledDate}</p>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setEditingInstance(null)} className="px-4 py-2 bg-white/5 rounded-lg text-[10px] uppercase font-bold">Cancelar</button>
                      <button onClick={saveInstanceChanges} className="px-4 py-2 bg-green-600 rounded-lg text-[10px] uppercase font-bold shadow-lg">Guardar Cambios</button>
                  </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 pb-20">
                  <div 
                      onClick={() => setEditingInstance(prev => prev ? ({ ...prev, location: prev.location ? undefined : 'Kinetix Functional Zone' }) : null)}
                      className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${editingInstance.location ? 'bg-red-900/20 border-red-600 text-red-500' : 'bg-white/5 border-white/5 text-white/30'}`}
                  >
                      <div className="flex items-center gap-3">
                          <span className="text-2xl">📍</span>
                          <div>
                              <p className="text-xs font-black uppercase tracking-widest">{editingInstance.location ? 'Kinetix Venue' : 'Remote Session'}</p>
                              <p className="text-[9px] font-bold opacity-60">{editingInstance.location ? 'Entrenamiento en Sede' : 'Entrenamiento en Casa/Gym'}</p>
                          </div>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${editingInstance.location ? 'bg-red-600' : 'bg-white/10'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${editingInstance.location ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                  </div>

                  {editingInstance.exercises.map((ex, idx) => (
                      <ExerciseBlockEditor 
                          key={idx} 
                          exercise={ex} 
                          onUpdate={(u) => handleUpdateInstanceExercise(idx, u)} 
                      />
                  ))}
              </div>
          </div>
      )}

      {showScheduler && selectedAthlete && (
          <VenueSchedulerModal 
            athlete={selectedAthlete} 
            onClose={() => setShowScheduler(false)}
            onApply={() => {
                setShowScheduler(false);
                setCalendarTrigger(prev => prev + 1);
            }}
          />
      )}

      {showFormModal && (
          <AthleteFormModal 
              athlete={athleteToEdit}
              onClose={() => setShowFormModal(false)}
              onSave={handleSaveAthlete}
          />
      )}

    </div>
  );
};
