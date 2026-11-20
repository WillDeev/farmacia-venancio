import type { Novidade } from '../types';

// Uma busca por sessão: a página inicial e o hub compartilham o mesmo resultado.
let pedido: Promise<Novidade[]> | undefined;

export function carregarNovidades(): Promise<Novidade[]> {
  pedido ??= fetch('/api/novidades').then(async (r) => {
    if (!r.ok) throw new Error(`Novidades indisponíveis (${r.status})`);
    return r.json();
  });
  // Se falhar, a próxima tentativa busca de novo.
  pedido.catch(() => (pedido = undefined));
  return pedido;
}

export const temas = {
  varejo: 'Varejo farmacêutico',
  saude: 'Saúde',
  anvisa: 'Anvisa',
} as const;

const MINUTO = 60_000;

export function quandoFoi(iso: string) {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / MINUTO);
  if (minutos < 60) return `há ${Math.max(minutos, 1)} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return 'ontem';
  if (dias < 7) return `há ${dias} dias`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
