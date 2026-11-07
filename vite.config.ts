import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * A Vite fejlesztői szerverének és buildjének konfigurációja.
 * A React plugin JSX-feldolgozást és fejlesztéskor gyors komponensfrissítést biztosít.
 */
export default defineConfig({
  plugins: [react()],
})
