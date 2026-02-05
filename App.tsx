import React, { useState } from 'react';
import { storageService } from './services/storageService';
import { CoachHome } from './components/coach/CoachHome';
import { AthleteHome } from './components/player/AthleteHome';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(storageService.getUser());
  const [view, setView] = useState('home');
  if (!user) return <div className="bg-black h-screen text-white flex items-center justify-center font-black">KINETIX ELITE</div>;
  return (<div className="min-h-screen bg-[#050507] text-white">
      {view === 'home' && (user.role === 'coach' || user.role === 'owner' ? <CoachHome onViewChange={setView} /> : <AthleteHome user={user} onLogout={() => setUser(null)} />)}
      {view === 'admin_dashboard' && <AdminDashboard currentUser={user} onNavigate={setView} />}
    </div>);
}