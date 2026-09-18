import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/resend': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        rewrite: (path) => {
          const sub = path.replace(/^\/api\/resend/, '');
          return sub === '' || sub === '/' ? '/emails' : sub;
        },
        secure: true,
      },
    },
  },
})
