import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allow ngrok host
    host: true,
    hmr: {
      // Needed for HMR to work correctly with ngrok
      clientPort: 443
    },
    // Add your ngrok host and other allowed hosts
    allowedHosts: [
      'e076-2a00-1858-1026-8049-65ad-ce98-68d-e4a9.ngrok-free.app',
      // You can use a wildcard for all ngrok subdomains
      '.ngrok-free.app'
    ]
  }
})