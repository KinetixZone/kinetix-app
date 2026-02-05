import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { CoachHome } from './components/coach/CoachHome';
import { AthleteCRM } from './components/coach/AthleteCRM';
import { WorkoutManager } from './components/coach/WorkoutManager';
import { AthleteHome } from './components/player/AthleteHome';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(storageService.getUser());
  const [view, setView] = useState('home');
  if (!user) return <div className="h-screen bg-[#050507] text-white flex items-center justify-center font-black italic text-6xl">KINETIX ELITE</div>;
  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {view === 'home' && (user.role === 'coach' || user.role === 'owner' ? <CoachHome onViewChange={setView} /> : <AthleteHome />)}
      {view === 'admin_dashboard' && <AdminDashboard currentUser={user} onNavigate={setView} />}
      {view === 'crm' && <AthleteCRM />}
      {view === 'manager' && <WorkoutManager />}
    </div>
  );
}