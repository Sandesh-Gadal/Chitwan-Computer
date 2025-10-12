import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
   server: {
    host: '0.0.0.0',
    allowedHosts: [
      '27a1-103-10-28-174.ngrok-free.app',
      'b3c7f6b8b6fc.ngrok-free.app'
    ]
  }
});
