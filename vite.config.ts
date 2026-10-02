import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // Clio only accepts https or http://127.0.0.1 redirect URIs, so serve on
    // the IPv4 loopback rather than whatever `localhost` resolves to.
    host: '127.0.0.1',
    // The Express server in server/ holds the Clio and OpenAI secrets.
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
})
