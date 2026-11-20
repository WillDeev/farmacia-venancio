// Hub de novidades do setor: junta feeds RSS de notícias farmacêuticas e de saúde.
// Roda no servidor (função da Vercel e Vite em dev): o navegador não consegue ler
// esses feeds direto por causa de CORS.

export type Tema = 'varejo' | 'saude' | 'anvisa';

export interface Novidade {
  titulo: string;
  link: string;
  data: string; // ISO
  fonte: string;
  tema: Tema;
  categoria?: string;
  imagem?: string;
  resumo?: string;
}

const FEEDS: { url: string; fonte?: string; tema: Tema }[] = [
  { url: 'https://panoramafarmaceutico.com.br/feed/', fonte: 'Panorama Farmacêutico', tema: 'varejo' },
  { url: 'https://medicinasa.com.br/feed/', fonte: 'Medicina S/A', tema: 'saude' },
  // Google Notícias não tem fonte fixa: cada item traz a sua (<source>).
  { url: 'https://news.google.com/rss/search?q=anvisa+when:14d&hl=pt-BR&gl=BR&ceid=BR:pt-419', tema: 'anvisa' },
];

const POR_FEED = 12;
const TEMPO_LIMITE = 8000;

const ENTIDADES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '...' };
const decodificar = (s: string) =>
  s.replace(/&(#x?[\da-f]+|\w+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENTIDADES[e] ?? m),
  );
const limpar = (s?: string) =>
  s === undefined ? undefined : decodificar(s.replace(/<!\[CDATA\[|\]\]>/g, '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const campo = (item: string, tag: string) => item.match(new RegExp(`<${tag}[^>]*>([^]*?)</${tag}>`))?.[1];

function lerFeed(xml: string, { fonte, tema }: (typeof FEEDS)[number]): Novidade[] {
  return [...xml.matchAll(/<item>([^]*?)<\/item>/g)].slice(0, POR_FEED).flatMap(([, item]) => {
    let titulo = limpar(campo(item, 'title'));
    const link = limpar(campo(item, 'link'));
    const data = new Date(limpar(campo(item, 'pubDate')) ?? '');
    if (!titulo || !link || isNaN(+data)) return [];

    const origem = fonte ?? limpar(campo(item, 'source')) ?? 'Notícias';
    // Google Notícias põe " - Fonte" no fim do título.
    if (!fonte) titulo = titulo.replace(new RegExp(`\\s+-\\s+${origem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');

    // Feeds do WordPress terminam o resumo com "O post X apareceu primeiro em Y".
    const resumo = fonte ? limpar(campo(item, 'description'))?.replace(/\s*O post .*$/, '') : undefined;
    const imagem = item.match(/<media:content[^>]*url="([^"]+)"|<enclosure[^>]*url="([^"]+)"/);

    return [
      {
        titulo,
        link,
        data: data.toISOString(),
        fonte: origem,
        tema,
        categoria: limpar(campo(item, 'category')),
        imagem: imagem?.[1] ?? imagem?.[2],
        resumo: resumo && resumo.length > 160 ? `${resumo.slice(0, 157).trimEnd()}...` : resumo,
      },
    ];
  });
}

export async function buscarNovidades(): Promise<Novidade[]> {
  const resultados = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const r = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Venancio app; hub de novidades)' },
        signal: AbortSignal.timeout(TEMPO_LIMITE),
      });
      if (!r.ok) throw new Error(`${feed.url} respondeu ${r.status}`);
      return lerFeed(await r.text(), feed);
    }),
  );
  // Se uma fonte cair, as outras continuam aparecendo.
  const novidades = resultados.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  if (!novidades.length) throw new Error('Nenhuma fonte respondeu.');
  return novidades.sort((a, b) => b.data.localeCompare(a.data));
}
