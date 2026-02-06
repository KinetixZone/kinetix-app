import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("FATAL: No se encontró el elemento #root en el DOM.");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Critical Render Error:", error);
  rootElement.innerHTML = `
    <div style="background: #050507; color: white; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;">
      <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px;">Kinetix OS: Error de Carga</h1>
      <p style="opacity: 0.6; font-size: 14px; max-width: 400px; margin-bottom: 24px;">
        No se pudo iniciar la interfaz. Esto puede deberse a una configuración de red o un error en el despliegue.
      </p>
      <button onclick="window.location.reload()" style="background: white; color: black; border: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; cursor: pointer;">
        Reintentar Conexión
      </button>
    </div>
  `;
}
