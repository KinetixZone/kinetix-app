import React, { useState } from 'react';
export const AdminDashboard = ({ onNavigate }) => {
  return (<div className="p-10 text-white"><h1>DevOps Panel</h1><button onClick={() => onNavigate('home')}>Cerrar</button></div>);
};