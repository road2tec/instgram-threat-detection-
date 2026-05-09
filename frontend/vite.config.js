import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            if (req.headers.authorization) {
              console.log(`[PROXY] Forwarding Authorization Header for: ${req.url}`);
              proxyReq.setHeader('Authorization', req.headers.authorization);
            } else {
              console.warn(`[PROXY] WARNING: Missing Authorization Header for: ${req.url}`);
            }
          });
        }
      },
      '/feed': {
        target: 'http://localhost:5003',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/feed/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Silently handle proxy errors to prevent terminal spam when simulator is offline
            console.log('Forensic Node (Simulator) is currently offline. Start it to see live intelligence.');
          });
        }
      }
    }
  }
})
