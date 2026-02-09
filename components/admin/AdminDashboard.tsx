import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types/kinetix';
import { storageService } from '../../services/storageService';

interface Props {
  currentUser: User;
  onNavigate: (view: any) => void;
}

export const AdminDashboard: React.FC<Props> = ({ currentUser, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'staff' | 'security' | 'devops'>('staff');
  const [staffList, setStaffList] = useState<User[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('coach');

  useEffect(() => {
    setStaffList(storageService.getStaff());
  }, []);

  const handleAddStaff = () => {
    if (!newStaffEmail.includes('@') || !newStaffName.trim()) return alert("Datos inválidos.");
    const newUser: User = {
        id: `staff-${Date.now()}`,
        name: newStaffName,
        email: newStaffEmail.toLowerCase(),
        role: newStaffRole,
        goal: 'Rendimiento' as any,
        level: 'Avanzado' as any,
        daysPerWeek: 7,
        equipment: [],
        streak: 0,
        createdAt: new Date().toISOString(),
        isActive: true
    };
    const updated = [...staffList, newUser];
    setStaffList(updated);
    storageService.saveStaff(updated);
    setNewStaffEmail('');
    setNewStaffName('');
  };

  const removeStaff = (id: string) => {
    if (window.confirm("¿Revocar acceso?")) {
        const updated = staffList.filter(s => s.id !== id);
        setStaffList(updated);
        storageService.saveStaff(updated);
    }
  };

  const SECURITY_MATRIX = [
      { area: 'Privacidad', threat: 'LocalStorage Plural', impact: 'Media', risk: 'Fuga de biometría', patch: 'AES-256 Prep' },
      { area: 'Seguridad Roles', threat: 'DevTools Bypass', impact: 'Crítica', risk: 'Escalamiento Admin', patch: 'JWT Claims' },
      { area: 'Escalabilidad', threat: 'Client Filtering', impact: 'Alta', risk: 'Lag con 10k users', patch: 'Supabase Querying' },
  ];

  return (
    <div className="pt-24 pb-32 px-6 max-w-7xl mx-auto min-h-screen text-white bg-[#050507]">
      <div className="flex justify-between items-end mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-3xl flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(220,38,38,0.4)]">🔐</div>
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter text-red-500">BÚNKER <span className="text-white">OS</span></h1>
            <p className="text-[10px] font-black uppercase text-white/30 tracking-[0.5em]">Risk Control Matrix v7.0</p>
          </div>
        </div>
        <button onClick={() => onNavigate('home')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Cerrar</button>
      </div>

      <div className="flex gap-8 mb-10 border-b border-white/5 overflow-x-auto no-scrollbar pb-4">
        {['Staff', 'Matriz de Seguridad', 'Logs'].map((label, idx) => {
          const id = ['staff', 'security', 'devops'][idx];
          return (
            <button key={id} onClick={() => setActiveTab(id as any)} className={`relative text-[10px] font-black uppercase tracking-[0.4em] transition-all ${activeTab === id ? 'text-red-500' : 'text-white/20 hover:text-white/40'}`}>
              {label}
              {activeTab === id && <div className="absolute -bottom-[18px] left-0 w-full h-[2px] bg-red-500" />}
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in duration-500">
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#0F0F11] border border-white/5 rounded-[40px] p-8 space-y-6">
                <h3 className="text-xl font-black uppercase italic text-white">Alta de Staff</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Nombre" className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} />
                    <input type="email" placeholder="Email" className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-bold text-white outline-none" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} />
                    <button onClick={handleAddStaff} className="w-full py-4 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">CONCEDER ACCESO</button>
                </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffList.map(s => (
                    <div key={s.id} className="p-8 bg-white/5 border border-white/10 rounded-[35px] flex justify-between items-center group">
                        <div>
                            <p className="text-lg font-black uppercase italic">{s.name}</p>
                            <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{s.role} // {s.email}</p>
                        </div>
                        <button onClick={() => removeStaff(s.id)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-600 text-white/10">✕</button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
            <div className="bg-[#0F0F11] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 bg-white/2 overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="text-[9px] font-black text-white/30 uppercase">
                                <th className="pb-4 px-4">Área</th>
                                <th className="pb-4 px-4">Amenaza</th>
                                <th className="pb-4 px-4">Impacto</th>
                                <th className="pb-4 px-4">Patch</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-bold uppercase">
                            {SECURITY_MATRIX.map((r, i) => (
                                <tr key={i} className="border-t border-white/5">
                                    <td className="py-5 px-4 text-white">{r.area}</td>
                                    <td className="py-5 px-4 text-white/60">{r.threat}</td>
                                    <td className={`py-5 px-4 ${r.impact === 'Crítica' ? 'text-red-500' : 'text-orange-500'}`}>{r.impact}</td>
                                    <td className="py-5 px-4 text-green-500">{r.patch}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
