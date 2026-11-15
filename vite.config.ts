import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import { assertPublicSupabaseKey } from './src/features/auth/publicKey.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  assertPublicSupabaseKey(env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '')
  assertPublicSupabaseKey(env.VITE_SUPABASE_ANON_KEY ?? '')
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      setupFiles: ['./src/tests/setup.ts'],
    },
  }
})
