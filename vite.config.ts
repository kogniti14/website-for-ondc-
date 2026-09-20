import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'SUPABASE_']);
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    '';
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    '';

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'SUPABASE_'],
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
      'import.meta.env.VITE_EMAIL_FROM': JSON.stringify(process.env.VITE_EMAIL_FROM || env.VITE_EMAIL_FROM || 'Kogniti Minds Security <security@kognitiminds.com>'),
      'import.meta.env.VITE_RESEND_API_KEY': JSON.stringify(process.env.VITE_RESEND_API_KEY || env.VITE_RESEND_API_KEY || ''),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
