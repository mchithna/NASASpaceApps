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
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-chat-dev-middleware',
        configureServer(server) {
          server.middlewares.use('/api/chat', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end(JSON.stringify({ error: 'Method not allowed' }))
              return
            }

            let raw = ''
            req.on('data', (chunk) => {
              raw += chunk
            })
            req.on('end', async () => {
              try {
                const url = `http://${req.headers.host || 'localhost'}/api/chat`
                const webReq = new Request(url, {
                  method: 'POST',
                  headers: req.headers as Record<string, string | string[] | undefined> as never,
                  body: raw,
                })
                const { default: handler } = await import('./api/chat.ts')
                const webRes = await handler(webReq)

                res.statusCode = webRes.status
                webRes.headers.forEach((val, key) => {
                  res.setHeader(key, val)
                })

                if (webRes.body) {
                  const reader = webRes.body.getReader()
                  while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    res.write(Buffer.from(value))
                  }
                }
                res.end()
              } catch (err: unknown) {
                res.statusCode = 500
                const message =
                  err instanceof Error ? err.message : 'Internal Server Error'
                res.end(JSON.stringify({ error: message, code: 'DEV_ERROR' }))
              }
            })
          })
        },
      },
    ],
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
