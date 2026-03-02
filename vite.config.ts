import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Remove unnecessary type casting - process.cwd() is available in Node.js environment
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Note: In Vite, environment variables are automatically available as import.meta.env
      // This define is kept for compatibility with legacy code that uses process.env
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
            vendor: ['react', 'react-dom']
            // AI chunk will be added after dependency is properly installed
          }
        }
      }
    },
    server: {
      port: 3000,
      host: true,
      // Add CORS headers for development
      cors: true
    },
    // Optimize dependencies - only include installed packages
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  };
});