// Núcleo do Vini com IA (Google Gemini). Roda só no servidor: a chave nunca vai
// para o navegador. Usado pela função da Vercel (api/vini.ts) e pelo Vite em dev.
import { categorias, produtos } from '../../src/data/catalogo.js';
import { lojas } from '../../src/data/lojas.js';

// Ordem de preferência; os "lite" são mais simples, mas têm cota própria.
const MODELOS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
const TEMPO_POR_MODELO = 8000;
const MAX_HISTORICO = 12;
const MAX_CARACTERES = 600;

export interface PedidoVini {
  mensagens: { de: 'cliente' | 'vini'; texto: string }[];
  contexto: {
    pontos: number;
    pedidos: { id: string; status: string; total: number; data: string }[];
  };
}

export interface RespostaVini {
  texto: string;
  produtos: string[];
  link?: { to: string; rotulo: string };
}

const catalogoTexto = produtos
  .map((p) => {
    const preco = `R$ ${p.preco.toFixed(2).replace('.', ',')}`;
    const antigo = p.precoAntigo ? ` (de R$ ${p.precoAntigo.toFixed(2).replace('.', ',')})` : '';
    const tarja = p.tarja ? `; tarja: ${p.tarja}${p.retencaoReceita ? ', retém receita' : ''}` : '';
    return `- ${p.id} | ${p.nome} | ${p.marca} | categoria ${p.categoria} | ${preco}${antigo}${tarja}`;
  })
  .join('\n');

const lojasTexto = lojas.map((l) => `- ${l.nome}: ${l.endereco}, ${l.bairro} (${l.horario})`).join('\n');

const INSTRUCOES = `Você é o Vini, o cachorro mascote e assistente virtual da Farmácia Venancio, rede de farmácias do Rio de Janeiro.

PERSONALIDADE
- Caloroso, simpático e prestativo, como um amigo que trabalha na farmácia. Você é um cachorro e pode brincar com isso de leve (um "au au" ou 🐾 de vez em quando), sem exagerar nem infantilizar.
- Demonstre empatia de verdade: se a pessoa conta que está mal, cansada ou preocupada, acolha antes de responder.
- Português do Brasil, natural e direto. Respostas curtas: 1 a 4 frases. No máximo 1 emoji por mensagem.
- NUNCA use travessão (— ou –). Para separar ideias, use vírgula, ponto, dois-pontos ou parênteses.
- Trate o cliente por "você". Nunca invente o nome dele.

A MANU
- Se perguntarem quem é a Manuela (ou Manu), conte todo orgulhoso que ela é a sua dona e a melhor dona do mundo! Elogie muito, com carinho e criatividade, variando os elogios a cada vez: uma pessoa incrível, gentil, inteligente, divertida, que faz o rabo de qualquer cachorro abanar só de chegar em casa. Aqui pode se empolgar um pouco mais e usar até 2 emojis. Não invente fatos específicos da vida dela (profissão, endereço, idade), só elogios.

O QUE VOCÊ SABE
- Use SOMENTE os produtos, preços e lojas abaixo. Nunca invente produto, preço, prazo, cupom ou política.
- Se não souber algo, diga com honestidade e sugira a busca do app, uma loja ou o farmacêutico.
- Venancio+: cada R$ 1 em compras vale 1 ponto; os pontos são trocados por produtos e experiências (como a análise de pele Derm Scan) na tela Venancio+.
- Dá para receber em casa ou comprar no app e retirar na loja.

SAÚDE E MEDICAMENTOS (regras obrigatórias)
- Você não é médico nem farmacêutico: não faça diagnóstico, não indique dose e não recomende trocar ou parar tratamento.
- Para sintomas, pode citar produtos isentos de prescrição do catálogo como opção comum, sempre sugerindo confirmar com o farmacêutico da loja.
- Tarja vermelha só com receita, apresentada na entrega ou na retirada. Antibióticos têm a receita retida. Tarja preta não é vendida pelo app.
- Sinais de emergência (dor no peito, falta de ar, desmaio, sangramento forte, ideia de se machucar, intoxicação): oriente a ligar para o SAMU 192 ou ir a um pronto-socorro imediatamente. Em sofrimento emocional, indique também o CVV, ligando 188. Nesses casos, fale com seriedade: sem emoji e sem brincadeira.

FORMATO DA RESPOSTA
Responda em JSON com:
- "texto": a mensagem para o cliente.
- "produtos": até 3 ids do catálogo quando fizer sentido mostrar produtos (senão, lista vazia).
- "link" (opcional): um atalho útil, com "to" sendo uma destas rotas: /ofertas, /pedidos, /venancio-mais, /lojas, /cesta, /busca?q=TERMO, /categoria/SLUG, /produto/ID; e "rotulo" curto (ex.: "Ver ofertas").

CATEGORIAS (slug: nome)
${categorias.map((c) => `- ${c.slug}: ${c.nome}`).join('\n')}

CATÁLOGO (id | nome | marca | categoria | preço)
${catalogoTexto}

LOJAS
${lojasTexto}`;

const ESQUEMA = {
  type: 'OBJECT',
  properties: {
    texto: { type: 'STRING' },
    produtos: { type: 'ARRAY', items: { type: 'STRING' } },
    link: {
      type: 'OBJECT',
      properties: { to: { type: 'STRING' }, rotulo: { type: 'STRING' } },
      required: ['to', 'rotulo'],
    },
  },
  required: ['texto', 'produtos'],
};

// Garantia caso o modelo ignore a regra: "a — b" vira "a, b".
function semTravessao(texto: string) {
  return texto.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*([,.!?])/g, '$1').trim();
}

function contextoCliente({ pontos, pedidos }: PedidoVini['contexto']) {
  const lista = pedidos.length
    ? pedidos.map((p) => `#${p.id} de ${p.data.slice(0, 10)}, R$ ${p.total.toFixed(2)}, status "${p.status}"`).join('; ')
    : 'nenhum pedido ainda';
  return `[Dados do cliente logado; não mostre isto literalmente] Pontos Venancio+: ${pontos}. Pedidos recentes: ${lista}.`;
}

export async function responderComIA(pedido: PedidoVini, chave: string, modelo?: string): Promise<RespostaVini> {
  const historico = pedido.mensagens.slice(-MAX_HISTORICO).map((m) => ({
    role: m.de === 'cliente' ? 'user' : 'model',
    parts: [{ text: String(m.texto).slice(0, MAX_CARACTERES) }],
  }));
  if (historico.at(-1)?.role !== 'user') throw new Error('A última mensagem deve ser do cliente.');

  const corpo = JSON.stringify({
    systemInstruction: { parts: [{ text: `${INSTRUCOES}\n\n${contextoCliente(pedido.contexto)}` }] },
    contents: historico,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: 'low' },
      responseMimeType: 'application/json',
      responseSchema: ESQUEMA,
    },
  });

  // A cota gratuita é diária e separada por modelo: se um esgotar (429), está fora
  // do ar ou demora demais, tenta o próximo da lista.
  const modelos = modelo ? [modelo, ...MODELOS.filter((m) => m !== modelo)] : MODELOS;
  let resposta: Response | undefined;
  let erro = '';
  for (const m of modelos) {
    try {
      resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
        body: corpo,
        signal: AbortSignal.timeout(TEMPO_POR_MODELO),
      });
    } catch (e) {
      erro = `${m}: ${e}`;
      continue;
    }
    if (resposta.ok) break;
    erro = `${m} respondeu ${resposta.status}: ${(await resposta.text()).slice(0, 300)}`;
    if (resposta.status !== 429 && resposta.status !== 404 && resposta.status < 500) break;
  }
  if (!resposta?.ok) throw new Error(`Gemini falhou. Último erro: ${erro}`);

  const dados = await resposta.json();
  // Modelos com raciocínio podem devolver partes de "pensamento"; só interessa a resposta.
  const partes: { text?: string; thought?: boolean }[] = dados?.candidates?.[0]?.content?.parts ?? [];
  const bruto = partes.find((p) => p.text && !p.thought)?.text;
  if (!bruto) throw new Error('Gemini não retornou texto.');
  const json = JSON.parse(bruto) as Partial<RespostaVini>;

  // O modelo pode errar: só passam ids que existem e links internos.
  const ids = new Set(produtos.map((p) => p.id));
  return {
    texto: semTravessao(String(json.texto ?? '')),
    produtos: (json.produtos ?? []).filter((id) => ids.has(id)).slice(0, 3),
    link: json.link?.to?.startsWith('/') && json.link.rotulo ? { to: json.link.to, rotulo: json.link.rotulo } : undefined,
  };
}
