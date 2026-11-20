import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Em dev, atende POST /api/vini com o mesmo código da função da Vercel.
// A chave fica em .env.local (GEMINI_API_KEY), que não vai para o git.
function viniDev(chave?: string, modelo?: string): Plugin {
  return {
    name: 'vini-dev',
    configureServer(server) {
      server.middlewares.use('/api/vini', async (req, res) => {
        const enviar = (status: number, corpo: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(corpo))
        }
        if (req.method !== 'POST') return enviar(405, { erro: 'Use POST' })
        if (!chave) return enviar(503, { erro: 'IA não configurada' })
        let corpo = ''
        for await (const parte of req) corpo += parte
        try {
          const { responderComIA } = await server.ssrLoadModule('/api/_lib/vini.ts')
          enviar(200, await responderComIA(JSON.parse(corpo), chave, modelo || undefined))
        } catch (e) {
          console.error(e)
          enviar(502, { erro: 'Falha na IA' })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), viniDev(env.GEMINI_API_KEY, env.GEMINI_MODEL)],
  }
})
