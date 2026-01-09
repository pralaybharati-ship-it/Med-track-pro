
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Fix: Removed loadEnv and its usage of process.cwd() to resolve the 'cwd' property error.
// Following GenAI guidelines, we assume process.env.API_KEY is pre-configured and 
// do not manually define it in the config or load it from .env files.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
