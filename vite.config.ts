import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Em dev, atende /api/vini e /api/novidades com o mesmo código das funções da Vercel.
// A chave da IA fica em .env.local (GEMINI_API_KEY), que não vai para o git.
function apiDev(chave?: string, modelo?: string): Plugin {
  return {
    name: 'api-dev',
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
          enviar(502, { erro: 'Falha na IA', detalhe: String(e) })
        }
      })
      server.middlewares.use('/api/novidades', async (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        try {
          const { buscarNovidades } = await server.ssrLoadModule('/api/_lib/novidades.ts')
          res.end(JSON.stringify(await buscarNovidades()))
        } catch (e) {
          console.error(e)
          res.statusCode = 502
          res.end(JSON.stringify({ erro: 'Não foi possível carregar as novidades', detalhe: String(e) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), apiDev(env.GEMINI_API_KEY, env.GEMINI_MODEL)],
  }
})
