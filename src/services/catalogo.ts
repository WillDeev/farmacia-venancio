import { categorias, produtos } from '../data/catalogo';
import type { Produto } from '../types';

const OPEN_BEAUTY_FACTS = 'https://world.openbeautyfacts.org';

export const formatarPreco = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const descontoPercentual = (p: Produto) =>
  p.precoAntigo ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;

const ACENTOS = new RegExp('[\\u0300-\\u036f]', 'g');

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(ACENTOS, '').toLowerCase();

export function nomeCategoria(slug: string) {
  return categorias.find((c) => c.slug === slug)?.nome ?? 'Produtos';
}

export function produtosPorCategoria(slug: string) {
  return produtos.filter((p) => p.categoria === slug);
}

export function produtosEmOferta() {
  return produtos.filter((p) => p.precoAntigo);
}

export function buscarLocal(termo: string): Produto[] {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  if (!palavras.length) return [];
  return produtos.filter((p) => {
    const texto = normalizar(`${p.nome} ${p.marca} ${nomeCategoria(p.categoria)}`);
    return palavras.every((w) => texto.includes(w));
  });
}

// O Open Beauty Facts não tem preço. Até existir o backend com estoque e preço
// próprios, geramos um preço fixo a partir do código de barras.
function precoSimulado(ean: string) {
  let h = 0;
  for (const c of ean) h = (h * 31 + c.charCodeAt(0)) % 10007;
  return 19.9 + (h % 120);
}

interface ProdutoOBF {
  code: string;
  product_name?: string;
  product_name_pt?: string;
  brands?: string;
  image_front_url?: string;
  categories_tags?: string[];
  generic_name?: string;
}

function categoriaOBF(tags: string[] = []) {
  const t = tags.join(' ');
  if (/sun|solar|solaire/.test(t)) return 'protetor-solar';
  if (/hair|shampoo|cheveux|conditioner/.test(t)) return 'cabelos';
  if (/face|serum|visage|skin/.test(t)) return 'skincare';
  return 'cuidados-pessoais';
}

function deOpenBeautyFacts(p: ProdutoOBF): Produto | undefined {
  const nome = (p.product_name_pt || p.product_name || '').trim();
  if (!nome || !p.code) return undefined;
  return {
    id: `obf-${p.code}`,
    nome,
    marca: p.brands?.split(',')[0].trim() || 'Diversas',
    categoria: categoriaOBF(p.categories_tags),
    preco: precoSimulado(p.code),
    imagem: p.image_front_url,
    ean: p.code,
    descricao: p.generic_name || undefined,
    precoSimulado: true,
  };
}

const CAMPOS = 'code,product_name,product_name_pt,brands,image_front_url,categories_tags,generic_name';

export async function buscarOpenBeautyFacts(termo: string, signal?: AbortSignal): Promise<Produto[]> {
  const params = new URLSearchParams({
    search_terms: termo,
    search_simple: '1',
    json: '1',
    page_size: '20',
    fields: CAMPOS,
  });
  const resp = await fetch(`${OPEN_BEAUTY_FACTS}/cgi/search.pl?${params}`, { signal });
  if (!resp.ok) throw new Error(`Open Beauty Facts respondeu ${resp.status}`);
  const dados: { products: ProdutoOBF[] } = await resp.json();
  return dados.products.map(deOpenBeautyFacts).filter((p): p is Produto => !!p && !!p.imagem);
}

export async function obterProduto(id: string): Promise<Produto | undefined> {
  const local = produtos.find((p) => p.id === id);
  if (local || !id.startsWith('obf-')) return local;
  const resp = await fetch(`${OPEN_BEAUTY_FACTS}/api/v2/product/${id.slice(4)}.json?fields=${CAMPOS}`);
  if (!resp.ok) return undefined;
  const dados: { product?: ProdutoOBF } = await resp.json();
  return dados.product && deOpenBeautyFacts(dados.product);
}

export interface Endereco {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export async function consultarCep(cep: string): Promise<Endereco | undefined> {
  const digitos = cep.replace(/\D/g, '');
  if (digitos.length !== 8) return undefined;
  const resp = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
  if (!resp.ok) return undefined;
  const dados = await resp.json();
  return dados.erro ? undefined : dados;
}
