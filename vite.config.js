import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  appType: 'spa', // ensure HTML5 history fallback for routes like /admin
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/api/nonogram': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nonogram/, '/nonogram'),
      },
      '/api/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/auth'),
      },
    },
  },
})
