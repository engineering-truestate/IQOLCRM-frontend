import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        // strictPort: true, // Ensures the server uses port 3000 and fails if it's not available
        proxy: {},
        host: true,
    },
})
