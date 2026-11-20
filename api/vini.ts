// Função da Vercel: POST /api/vini. Precisa da variável de ambiente GEMINI_API_KEY
// (opcional: GEMINI_MODEL). Sem ela, responde 503 e o app usa as respostas fixas.
import { responderComIA, type PedidoVini } from './_lib/vini';

export async function POST(request: Request) {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) return Response.json({ erro: 'IA não configurada' }, { status: 503 });

  let pedido: PedidoVini;
  try {
    pedido = await request.json();
    if (!Array.isArray(pedido?.mensagens) || !pedido.mensagens.length) throw new Error();
  } catch {
    return Response.json({ erro: 'Pedido inválido' }, { status: 400 });
  }

  try {
    return Response.json(await responderComIA(pedido, chave, process.env.GEMINI_MODEL || undefined));
  } catch (e) {
    console.error(e);
    return Response.json({ erro: 'Falha na IA' }, { status: 502 });
  }
}
