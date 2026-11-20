import { buscarLocal, formatarPreco, produtosEmOferta } from './catalogo';
import { lojas } from '../data/lojas';
import type { Pedido, Produto } from '../types';

// Assistente virtual "Vini": respostas por palavra-chave, sem IA.
// Pode ser trocado por um modelo de linguagem quando houver backend.

export interface Resposta {
  texto: string;
  produtos?: Produto[];
  link?: { to: string; rotulo: string };
}

interface Contexto {
  pontos: number;
  pedidos: Pedido[];
}

const regras: { padrao: RegExp; responder: (ctx: Contexto, texto: string) => Resposta }[] = [
  {
    padrao: /\b(oi|ola|olá|bom dia|boa tarde|boa noite|e ai)\b/,
    responder: () => ({ texto: 'Oi! 😊 Posso ajudar com pedidos, ofertas, pontos Venancio+ ou encontrar um produto.' }),
  },
  {
    padrao: /pedido|entrega|rastre|acompanh|chega/,
    responder: ({ pedidos }) => {
      const [ultimo] = pedidos;
      if (!ultimo) {
        return {
          texto: 'Você ainda não fez nenhum pedido. Quando fizer, é só voltar aqui ou abrir "Pedidos" para acompanhar cada etapa.',
          link: { to: '/ofertas', rotulo: 'Ver ofertas' },
        };
      }
      return {
        texto: `Seu último pedido é o #${ultimo.id}, de ${formatarPreco(ultimo.total)}. Status: ${ultimo.status}.`,
        link: { to: '/pedidos', rotulo: 'Ver meus pedidos' },
      };
    },
  },
  {
    padrao: /ponto|venancio\+|venancio mais|resgat|extrato|beneficio|benefício/,
    responder: ({ pontos }) => ({
      texto: `Você tem ${pontos.toLocaleString('pt-BR')} pts no Venancio+. Cada R$ 1 em compras vale 1 ponto, e dá para trocar por produtos ou experiências, como a análise de pele Derm Scan.`,
      link: { to: '/venancio-mais', rotulo: 'Abrir Venancio+' },
    }),
  },
  {
    padrao: /loja|endere|perto|proxim|próxim|retir/,
    responder: () => ({
      texto: `Temos ${lojas.length} lojas no Rio, algumas abertas 24 horas. Você também pode comprar no app e retirar na loja.`,
      link: { to: '/lojas', rotulo: 'Encontrar loja' },
    }),
  },
  {
    padrao: /receita|tarja|antibi|controlad/,
    responder: () => ({
      texto:
        'Medicamentos de tarja vermelha precisam de receita, que deve ser apresentada na entrega ou na retirada. Antibióticos têm a receita retida. Medicamentos de tarja preta não são vendidos pelo app.',
    }),
  },
  {
    padrao: /oferta|promo|desconto|cupom|barato/,
    responder: () => ({
      texto: 'Separei algumas ofertas da semana para você:',
      produtos: produtosEmOferta().slice(0, 3),
      link: { to: '/ofertas', rotulo: 'Ver todas as ofertas' },
    }),
  },
  {
    padrao: /encontr.*produto|como (eu )?(busco|acho|procuro)/,
    responder: () => ({
      texto: 'Use a busca no topo da tela, pelo nome, marca ou código de barras. Ou me diga aqui o que procura, por exemplo "protetor solar".',
    }),
  },
];

export function responder(texto: string, ctx: Contexto): Resposta {
  const t = texto.toLowerCase();
  const regra = regras.find((r) => r.padrao.test(t));
  if (regra) return regra.responder(ctx, t);

  const encontrados = buscarLocal(texto);
  if (encontrados.length) {
    return {
      texto: `Encontrei ${encontrados.length} produto${encontrados.length > 1 ? 's' : ''} para "${texto}":`,
      produtos: encontrados.slice(0, 3),
      link: { to: `/busca?q=${encodeURIComponent(texto)}`, rotulo: 'Ver resultados' },
    };
  }
  return {
    texto: 'Não entendi muito bem 🐾. Posso ajudar com pedidos, ofertas, pontos, lojas ou buscar um produto pelo nome.',
    link: { to: `/busca?q=${encodeURIComponent(texto)}`, rotulo: `Buscar "${texto}"` },
  };
}
