// Importa os detalhes dos produtos (descrição, seções, perguntas frequentes, ficha
// técnica e bula) do catálogo público da Drogaria Venancio (VTEX) e gera
// src/data/detalhes.ts. Uso: node scripts/importar-detalhes.mjs
import { writeFileSync } from 'node:fs';

const API = 'https://www.drogariavenancio.com.br/api/catalog_system/pub/products/search';

// id no nosso catálogo -> termo de busca e nome exato do produto na Venancio.
const produtos = {
  'vichy-liftactiv': ['creme vichy liftactiv', 'Creme Vichy Liftactiv Colágeno Specialist 16 - 50ml'],
  'anthelios-fps50': ['protetor solar facial la roche posay anthelios', 'Protetor Solar Facial La Roche-Posay Anthelios + Airlicium FPS50 Cor 2.0'],
  'centrum-mulher': ['centrum mulher', 'Suplemento Alimentar Centrum Mulher 60 Comprimidos'],
  'dorflex-36': ['dorflex 36', 'Analgésico Dorflex 36 Comprimidos'],
  'dipirona-500': ['dipirona 500mg 10 comprimidos', 'Dipirona 500mg Ems Genérico 10 Comprimidos'],
  'losartana-50': ['losartana 50mg 30', 'Losartana Potássica 50mg Medley 30 Comprimidos Revestidos'],
  'amoxicilina-500': ['amoxicilina 500mg 21', 'Amoxicilina 500mg Ems 21 Cápsulas'],
  'vitamina-d3': ['vitamina d sundown', 'Suplemento Alimentar Sundown Vitamina D 2000UI 200 Cápsulas'],
  'fralda-pampers-m': ['pampers confort sec m', 'Fralda Pampers Confort Sec M 44 unidades'],
  'shampoo-elseve': ['elseve liso dos sonhos shampoo', "Shampoo L'Oréal Paris Elseve Liso dos Sonhos 400ml"],
  'sundown-corporal-fps50': ['sundown fps 50 200ml', 'Protetor Solar Corpo e Rosto Sundown Praia e Piscina FPS50 200ml'],
  'bioderma-sensibio': ['agua micelar bioderma sensibio', 'Água Micelar Bioderma Sensibio H2o Dermatológica Calmante Para Peles Normais A Sensíveis 250ml'],
  'lrp-vitamina-c10': ['la roche posay vitamin c', 'Sérum Antirrugas para Peles Oleosas La Roche-Posay Vitamin C12 Oil Control 30ml'],
  'neutrogena-hydro-boost': ['hydro boost water gel', 'Hidratante Facial Neutrogena Hydro Boost Water Gel 50g'],
  'omega-3': ['omega 3 sundown', 'Suplemento Alimentar Sundown Ômega 3 1.000mg 120 Cápsulas'],
  'condicionador-pantene': ['pantene condicionador', 'Condicionador Pantene Colágeno Hidrata & Resgata 250ml'],
  'lenco-huggies': ['lenco umedecido huggies', 'Lenços Umedecidos Huggies Higiene Superior Limpa 2x Mais- 96 Unidades'],
  'bepantol-baby': ['bepantol baby pomada', 'Creme Preventivo De Assaduras Bepantol Baby 60g'],
  'rexona-clinical': ['rexona clinical aerosol', 'Antitranspirante Aerosol Rexona Clinical Sem Perfume 150ml'],
  'colgate-total': ['colgate total 12 90g', 'Creme Dental Colgate Total Antitártaro 90g'],
  'neosaldina-30': ['neosaldina 30', 'Analgésico Neosaldina Dipirona + Cafeina 30 drágeas'],
  'anthelios-uvmune': ['anthelios uvmune', 'Protetor Solar La Roche Posay Anthelios UVMUNE 400 Airlicium FPS60 40ml'],
};

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ordm: 'º', ordf: 'ª', deg: '°', reg: '®', trade: '™', ndash: '-', mdash: '-', hellip: '...', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', bull: '•', middot: '·', sup1: '¹', sup2: '²', sup3: '³' };
// Letras acentuadas: &eacute; &Atilde; &ccedil; ...
const ACENTOS = { acute: '́', grave: '̀', tilde: '̃', circ: '̂', uml: '̈', cedil: '̧' };
const entidade = (m, e) => {
  if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1));
  if (ENTIDADES[e]) return ENTIDADES[e];
  const acento = e.match(/^([a-zA-Z])(acute|grave|tilde|circ|uml|cedil)$/);
  return acento ? (acento[1] + ACENTOS[acento[2]]).normalize('NFC') : m;
};
const texto = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[\da-f]+|\w+);/gi, entidade)
    .replace(/\s+/g, ' ')
    .trim();

const blocos = (html) =>
  [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>|<ul[^>]*>([\s\S]*?)<\/ul>/g)]
    .map(([, p, ul]) =>
      p !== undefined
        ? { tipo: 'p', texto: texto(p) }
        : { tipo: 'lista', itens: [...ul.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(([, li]) => texto(li)) },
    )
    .filter((b) => (b.tipo === 'p' ? b.texto : b.itens.length));

// '- REMOVE ATÉ SUJEIRAS' -> 'Remove até sujeiras'
const titulo = (t) => {
  const limpo = texto(t).replace(/^[-–•\s]+/, '').replace(/:$/, '');
  return limpo === limpo.toUpperCase() ? limpo[0] + limpo.slice(1).toLowerCase() : limpo;
};

const meta = (html, prop) => html.match(new RegExp(`itemprop="${prop}" content="([^"]*)"`))?.[1];

// Descrições antigas: texto corrido ou <p> soltos. Linhas como "Benefícios:" ou
// "Modo de uso" viram título de seção; as linhas seguintes, itens ou parágrafos.
const TITULO = /^(benef[ií]cios|modo de uso|como usar|indica[cç][aã]o|indicado para|composi[cç][aã]o|ingredientes|conte[uú]do( do kit)?|advert[eê]ncias?|precau[cç][oõ]es|recomenda[cç][oõ]es|caracter[ií]sticas|informa[cç][oõ]es nutricionais|diferenciais|resultados?)\s*:?$/i;
function extrairAntigo(html) {
  const linhas = html
    .split(/<\/p>|<br\s*\/?>|<\/li>|<\/h\d>|\n/i)
    .map(texto)
    .filter(Boolean)
    // Junta linhas quebradas no meio da frase (comum em textos copiados da bula).
    .reduce((acc, linha) => {
      const anterior = acc.at(-1);
      if (anterior && !/[.!?:;]$/.test(anterior) && /^[a-zà-ú(0-9]/.test(linha)) acc[acc.length - 1] = `${anterior} ${linha}`;
      else acc.push(linha);
      return acc;
    }, []);
  const ehTitulo = (l) =>
    TITULO.test(l) ||
    (l.endsWith(':') && l.length < 50) ||
    (l.endsWith('?') && l.length < 70) ||
    (l.length < 80 && /[A-ZÀ-Ú]{3}/.test(l) && l === l.toUpperCase());
  const intro = [];
  const secoes = [];
  for (const bruta of linhas) {
    const linha = bruta.replace(/^[-–•]\s*/, '');
    if (ehTitulo(linha)) {
      secoes.push({ titulo: titulo(linha), blocos: [] });
    } else if (!secoes.length) {
      intro.push(linha);
    } else {
      const atual = secoes.at(-1);
      const ultimo = atual.blocos.at(-1);
      if (linha.length < 140) {
        if (ultimo?.tipo === 'lista') ultimo.itens.push(linha);
        else atual.blocos.push({ tipo: 'lista', itens: [linha] });
      } else atual.blocos.push({ tipo: 'p', texto: linha });
    }
  }
  return {
    // Sem repetidos, sem notas de rodapé ("*Efeito...", "¹Testes...") e sem aspas em volta.
    intro: intro
      .filter((l, i) => intro.findIndex((x) => x.toLowerCase() === l.toLowerCase()) === i)
      .filter((l) => !/^[*¹²³]/.test(l))
      .map((l) => l.replace(/^"|"$/g, ''))
      .slice(0, 6),
    secoes: secoes.filter((s) => s.blocos.length),
  };
}

function extrair(p) {
  const html = (p.description ?? '').replace(/<style>[\s\S]*?<\/style>/g, '');
  const novo = html.includes('vnc-descricao');

  const intro = html.match(/<section class="vnc-intro"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? '';
  const adv = html.match(/<div class="vnc-advertencia">([\s\S]*?)<\/div>/)?.[1];

  // Cada <h2> abre uma seção até o próximo <h2> (com ou sem <section> em volta).
  const corpo = html
    .replace(/<section class="vnc-intro"[\s\S]*?<\/section>/, '')
    .replace(/<section class="vnc-faq"[\s\S]*$/, '')
    .replace(/<div class="vnc-advertencia">[\s\S]*?<\/div>/, '');
  const secoes = corpo
    .split(/<h2[^>]*>/)
    .slice(1)
    .map((trecho) => {
      const [nome, resto = ''] = trecho.split(/<\/h2>/);
      return { titulo: titulo(nome), blocos: blocos(resto) };
    })
    .filter((s) => s.blocos.length);

  const faq = [...html.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>/g)].map(([, q, r]) => ({
    pergunta: texto(q),
    resposta: texto(r),
  }));
  const antigo = novo ? undefined : extrairAntigo(html);

  const espec = (k) => p[k]?.[0];
  const tipo = { REFERENCIA: 'Referência', GENERICO: 'Genérico', SIMILAR: 'Similar' }[espec('Tipo Medicamento')];
  const ficha = [
    ['Princípio ativo', espec('Principio Ativo')],
    ['Tipo de medicamento', tipo],
    ['Fabricante', html.match(/itemtype="https:\/\/schema.org\/Organization"[\s\S]*?itemprop="name" content="([^"]*)"/)?.[1]],
    ['Forma', meta(html, 'dosageForm')],
    ['Registro Anvisa', espec('Registro Anvisa')],
    ['Código de barras', p.items?.[0]?.ean],
  ]
    .filter(([, v]) => v && v !== '0')
    .map(([rotulo, valor]) => ({ rotulo, valor: rotulo === 'Princípio ativo' || rotulo === 'Forma' ? valor.toLowerCase() : valor }));

  return {
    intro: antigo ? antigo.intro : blocos(intro).filter((b) => b.tipo === 'p').map((b) => b.texto),
    secoes: antigo ? antigo.secoes : secoes,
    faq,
    ficha,
    advertencia: adv ? texto(adv.replace(/<a[\s\S]*?<\/a>/, '')) : undefined,
    bula: adv?.match(/href="([^"]+\.pdf)"/)?.[1],
  };
}

async function buscar(termo, nome) {
  const r = await fetch(`${API}?ft=${encodeURIComponent(termo)}&_from=0&_to=20`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const lista = await r.json();
  await new Promise((ok) => setTimeout(ok, 300));
  const p = lista.find((x) => x.productName.trim() === nome);
  if (!p) throw new Error(`"${nome}" não encontrado`);
  return p;
}

// Mesmo medicamento sem descrição na Venancio: usa o texto de outra marca do
// mesmo genérico, mantendo a ficha técnica do produto certo.
const textoDe = {
  'losartana-50': ['losartana 50mg', 'Losartana Potássica 50mg Ems 30 Comprimidos Revestidos'],
};

// Kits montados por nós: cada item vem do catálogo da Venancio.
const kits = {
  'kit-verao': {
    intro: [
      'O Kit Verão Pele Protegida e Hidratada reúne três cuidados essenciais para os dias de sol: hidratação leve para o rosto, água termal para refrescar e acalmar a pele e protetor solar facial de alta proteção.',
    ],
    itens: [
      ['hydro boost water gel', 'Hidratante Facial Neutrogena Hydro Boost Water Gel 50g'],
      ['avene agua termal', 'Água Termal Avène 150ml'],
      ['vichy capital soleil', 'Protetor Solar Facial Vichy Capital Soleil Hydra-Matte Sem Cor  FPS50 30g'],
    ],
    comoUsar: [
      'De manhã, aplique o hidratante no rosto limpo e, em seguida, o protetor solar.',
      'Reaplique o protetor a cada 2 horas de exposição ao sol e depois de mergulhar ou suar.',
      'Borrife a água termal sempre que quiser refrescar a pele, inclusive por cima da maquiagem.',
    ],
  },
};

// Produtos que a Venancio não vende: texto nosso, sem informação técnica inventada.
const manuais = {
  'nivea-pos-sol': {
    intro: [
      'A Loção Hidratante Pós-Sol NIVEA Sun After Sun ajuda a hidratar e refrescar a pele depois da exposição ao sol, com sensação de alívio imediato.',
      'Tem textura leve e de rápida absorção, ideal para usar no corpo depois da praia, da piscina ou de um dia ao ar livre.',
    ],
    secoes: [
      {
        titulo: 'Como usar',
        blocos: [
          { tipo: 'lista', itens: ['Aplique sobre a pele limpa e seca depois da exposição ao sol.', 'Espalhe com movimentos suaves até a completa absorção.', 'Pode ser usada todos os dias durante o verão.'] },
        ],
      },
      {
        titulo: 'Importante',
        blocos: [{ tipo: 'p', texto: 'Produto pós-sol não substitui o protetor solar. Em caso de queimadura forte, bolhas ou febre, procure um médico.' }],
      },
    ],
  },
  'kit-coreano': {
    intro: [
      'O Kit Skincare Coreano reúne os três passos básicos de uma rotina inspirada no skincare coreano: tônico, ampola e protetor solar.',
      'Uma rotina simples e completa para quem quer começar a cuidar da pele com produtos que se complementam.',
    ],
    secoes: [
      {
        titulo: 'O que vem no kit',
        blocos: [{ tipo: 'lista', itens: ['Tônico Heartleaf 77%', 'Ampola de centella', 'Protetor solar facial'] }],
      },
      {
        titulo: 'Como usar',
        blocos: [
          {
            tipo: 'lista',
            itens: [
              '1. Com a pele limpa, aplique o tônico com as mãos ou com um algodão.',
              '2. Em seguida, aplique algumas gotas da ampola e espalhe até absorver.',
              '3. De manhã, finalize com o protetor solar e reaplique ao longo do dia.',
            ],
          },
        ],
      },
    ],
  },
};

const vazio = { intro: [], secoes: [], faq: [], ficha: [] };
const resumo = (d) => `${d.intro.length} intro, ${d.secoes.length} seções, ${d.faq.length} perguntas, ${d.ficha.length} ficha${d.bula ? ', bula' : ''}`;
const detalhes = {};

for (const [id, [termo, nome]] of Object.entries(produtos)) {
  try {
    const d = extrair(await buscar(termo, nome));
    if (textoDe[id]) {
      const t = extrair(await buscar(...textoDe[id]));
      Object.assign(d, { intro: t.intro, secoes: t.secoes, faq: t.faq });
    }
    detalhes[id] = d;
    console.log(`${id}: ${resumo(d)}`);
  } catch (e) {
    console.warn(`! ${id}: ${e.message}`);
  }
}

for (const [id, kit] of Object.entries(kits)) {
  const secoes = [{ titulo: 'O que vem no kit', blocos: [{ tipo: 'lista', itens: kit.itens.map(([, nome]) => nome.replace(/\s+/g, ' ')) }] }];
  for (const [termo, nome] of kit.itens) {
    const item = extrair(await buscar(termo, nome));
    if (item.intro.length) secoes.push({ titulo: nome.replace(/\s+/g, ' '), blocos: item.intro.map((t) => ({ tipo: 'p', texto: t })) });
  }
  secoes.push({ titulo: 'Como usar', blocos: [{ tipo: 'lista', itens: kit.comoUsar }] });
  detalhes[id] = { ...vazio, intro: kit.intro, secoes };
  console.log(`${id} (kit): ${resumo(detalhes[id])}`);
}

for (const [id, d] of Object.entries(manuais)) {
  detalhes[id] = { ...vazio, ...d };
  console.log(`${id} (manual): ${resumo(detalhes[id])}`);
}

writeFileSync(
  new URL('../src/data/detalhes.ts', import.meta.url),
  `// Gerado por scripts/importar-detalhes.mjs a partir do catálogo da Drogaria Venancio.
// Não edite à mão: rode o script de novo para atualizar.
import type { DetalhesProduto } from '../types';

export const detalhes: Record<string, DetalhesProduto> = ${JSON.stringify(detalhes, null, 2)};
`,
);
