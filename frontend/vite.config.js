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
          proxy.removeAllListeners('error');
          proxy.on('error', (err, req, res) => {
            console.log(`[PROXY] Backend API Server is currently offline or unreachable for: ${req.url}`);
            if (res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend server is offline.' }));
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
          proxy.removeAllListeners('error');
          proxy.on('error', (err, _req, res) => {
            // Silently handle proxy errors to prevent terminal spam when simulator is offline
            console.log('Forensic Node (Simulator) is currently offline. Start it to see live intelligence.');
            if (res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Forensic Node (Simulator) is offline.' }));
            }
          });
        }
      }
    }
  }
})
