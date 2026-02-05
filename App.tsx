import React, { useState } from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col p-6 font-sans">
      <header className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Kinetix <span className="text-red-600">Elite</span></h1>
        <div className="bg-red-600/10 px-4 py-1.5 rounded-full border border-red-600/20">
           <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Plataforma Online</span>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
         <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-black rounded-[30px] flex items-center justify-center text-4xl shadow-2xl animate-bounce">⚡</div>
         <div className="space-y-2">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">SISTEMA <span className="text-red-600">ACTIVO</span></h2>
            <p className="text-white/40 uppercase tracking-[0.4em] text-[10px]">Overlord Terminal Conectada</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-10">
            <div className="bg-[#0F0F11] p-8 rounded-[40px] border border-white/5">
               <span className="text-3xl block mb-4">🏋️</span>
               <h3 className="font-black uppercase italic text-lg">Modo Atleta</h3>
               <p className="text-[10px] text-white/30 uppercase mt-2">Seguimiento de Operaciones</p>
            </div>
            <div className="bg-[#0F0F11] p-8 rounded-[40px] border border-white/5">
               <span className="text-3xl block mb-4">🧢</span>
               <h3 className="font-black uppercase italic text-lg">Modo Coach</h3>
               <p className="text-[10px] text-white/30 uppercase mt-2">Centro de Comando</p>
            </div>
         </div>
      </main>
      
      <footer className="mt-20 py-10 border-t border-white/5 text-center">
         <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Kinetix Functional Zone © 2026</p>
      </footer>
    </div>
  );
}