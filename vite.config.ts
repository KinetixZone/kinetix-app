import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env': JSON.stringify(env)
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ai: ['@google/generative-ai']
          }
        }
      }
    },
    server: {
      port: 3000,
      host: true,
      cors: true
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@google/generative-ai']
    }
  };
});