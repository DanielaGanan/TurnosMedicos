import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend now uses only VITE_API_URL (no proxy)
export default defineConfig({
  plugins: [react()],
});
