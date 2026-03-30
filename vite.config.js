import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], 
         
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        latihanp2: resolve(__dirname, 'latihanp2.html'),
      },
    },
  },
})
