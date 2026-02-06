import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // @ts-ignore
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env': JSON.stringify(env)
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      // AUDITORÍA: Usar es2020 asegura compatibilidad y reduce fallos en despliegues automatizados
      target: 'es2020',
      rollupOptions: {
        onwarn(warning, warn) {
          // SILENCIAR ADVERTENCIAS: Esto permite que el proceso de "Sync" continúe aunque haya detalles menores
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          if (warning.code === 'THIS_IS_UNDEFINED') return;
          warn(warning);
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', '@supabase/supabase-js', '@google/genai']
          }
        }
      }
    },
    server: {
      port: 3000,
      host: true, // Permitir acceso externo (necesario para IDX/Docker)
      allowedHosts: true // Evitar bloqueos de host en entornos de nube
    }
  };
});
