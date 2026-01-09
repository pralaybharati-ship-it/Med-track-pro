import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Fix: Explicitly import process from node:process to resolve the TypeScript error "Property 'cwd' does not exist on type 'Process'".
  // Load env file based on `mode` in the current working directory.
  // We set the third parameter to '' to load all env variables regardless of prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This allows the app to access process.env.API_KEY in the browser context.
      // The Google GenAI SDK expects this to be available for initialization.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    server: {
      port: 3000,
      open: true
    }
  };
});