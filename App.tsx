import React, { useState } from 'react';
import { storageService } from './services/storageService';
export default function App() {
  const [user, setUser] = useState(storageService.getUser());
  return <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center p-10"><div><h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Kinetix <span className="text-red-600">Elite</span></h1><p className="text-white/40 uppercase tracking-widest text-xs">Mirroring de ADN v11.0.0 Activo</p></div></div>;
}