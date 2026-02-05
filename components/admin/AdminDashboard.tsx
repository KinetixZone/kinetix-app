import React, { useState } from 'react';
export const AdminDashboard = ({ onNavigate }) => {
  return (<div className="pt-24 px-6 text-white min-h-screen bg-[#050507] font-sans"> <h1 className="text-4xl font-black italic text-blue-500 mb-10 tracking-tighter">DevOps Master</h1> <button onClick={() => onNavigate('home')} className="mt-10 opacity-30 uppercase font-black text-[10px] tracking-widest">Cerrar Panel</button> </div>);
};