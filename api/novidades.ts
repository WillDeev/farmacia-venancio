// Função da Vercel: GET /api/novidades. A CDN guarda a resposta por 30 min e,
// depois disso, entrega a versão antiga enquanto busca a nova em segundo plano.
import { buscarNovidades } from './_lib/novidades.js';

export async function GET() {
  try {
    return Response.json(await buscarNovidades(), {
      headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ erro: 'Não foi possível carregar as novidades' }, { status: 502 });
  }
}
