import React, { useState } from 'react';
import { storageService } from './services/storageService';
export default function App() {
  const [user, setUser] = useState(storageService.getUser());
  return <div className="min-h-screen bg-[#050507] text-white p-10"><h1>Kinetix Elite Platform v10</h1><p>Sistema Operativo Desplegado</p></div>;
}