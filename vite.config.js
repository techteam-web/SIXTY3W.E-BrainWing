import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 5184, host: true },
  build: {
    // The app's own JS is ~470 kB. The one chunk above this limit is MapLibre, which is
    // dynamically imported by the Location screen and therefore never on the critical
    // path — warning about it every build would only train everyone to ignore the
    // warning that matters.
    chunkSizeWarningLimit: 1200,
  },
})
