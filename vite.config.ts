import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid TypeScript error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Construct define object. Only define API_KEY if it exists in env.
  // This allows runtime fallbacks (like window.aistudio injection) to work if env var is missing.
  const defineConfig: Record<string, string> = {
    'process.env.TURSO_DB_URL': JSON.stringify(env.TURSO_DB_URL),
    'process.env.TURSO_AUTH_TOKEN': JSON.stringify(env.TURSO_AUTH_TOKEN),
  };

  if (env.API_KEY) {
    defineConfig['process.env.API_KEY'] = JSON.stringify(env.API_KEY);
  }

  return {
    plugins: [react()],
    define: defineConfig,
  };
});