import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ItemCesta, Lembrete, MovimentoPontos, Pedido, Produto } from '../types';

// Estado do cliente salvo no navegador (localStorage). Quando houver backend,
// estas funções passam a chamar a API.

interface Estado {
  cesta: ItemCesta[];
  favoritos: Produto[];
  pedidos: Pedido[];
  extrato: MovimentoPontos[];
  lembretes: Lembrete[];
}

const CHAVE = 'venancio:estado';

const estadoInicial: Estado = {
  cesta: [],
  favoritos: [],
  pedidos: [],
  extrato: [
    { id: 'boas-vindas', data: '2026-09-02T10:00:00', descricao: 'Bônus de boas-vindas Venancio+', pontos: 500 },
    { id: 'compra-loja', data: '2026-10-14T18:30:00', descricao: 'Compra na loja Copacabana', pontos: 750 },
  ],
  lembretes: [],
};

function carregar(): Estado {
  try {
    const salvo = localStorage.getItem(CHAVE);
    return salvo ? { ...estadoInicial, ...JSON.parse(salvo) } : estadoInicial;
  } catch {
    return estadoInicial;
  }
}

const novoId = () => Math.random().toString(36).slice(2, 10);

function useLojaEstado() {
  const [estado, setEstado] = useState<Estado>(carregar);

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  }, [estado]);

  const pontos = estado.extrato.reduce((soma, m) => soma + m.pontos, 0);
  const totalCesta = estado.cesta.reduce((soma, i) => soma + i.produto.preco * i.quantidade, 0);
  const qtdCesta = estado.cesta.reduce((soma, i) => soma + i.quantidade, 0);

  function adicionarNaCesta(produto: Produto, quantidade = 1) {
    setEstado((e) => {
      const existe = e.cesta.find((i) => i.produto.id === produto.id);
      const cesta = existe
        ? e.cesta.map((i) => (i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i))
        : [...e.cesta, { produto, quantidade }];
      return { ...e, cesta };
    });
  }

  function alterarQuantidade(produtoId: string, quantidade: number) {
    setEstado((e) => ({
      ...e,
      cesta:
        quantidade <= 0
          ? e.cesta.filter((i) => i.produto.id !== produtoId)
          : e.cesta.map((i) => (i.produto.id === produtoId ? { ...i, quantidade } : i)),
    }));
  }

  function alternarFavorito(produto: Produto) {
    setEstado((e) => ({
      ...e,
      favoritos: e.favoritos.some((p) => p.id === produto.id)
        ? e.favoritos.filter((p) => p.id !== produto.id)
        : [...e.favoritos, produto],
    }));
  }

  const ehFavorito = (produtoId: string) => estado.favoritos.some((p) => p.id === produtoId);

  function finalizarPedido(entrega: Pedido['entrega']): Pedido {
    const pedido: Pedido = {
      id: String(Date.now()).slice(-6),
      data: new Date().toISOString(),
      itens: estado.cesta,
      total: totalCesta,
      entrega,
      status: 'Recebido',
      pontosGanhos: Math.floor(totalCesta),
    };
    setEstado((e) => ({
      ...e,
      cesta: [],
      pedidos: [pedido, ...e.pedidos],
      extrato: [
        { id: novoId(), data: pedido.data, descricao: `Pedido #${pedido.id}`, pontos: pedido.pontosGanhos },
        ...e.extrato,
      ],
    }));
    return pedido;
  }

  /** Retorna false se não houver pontos suficientes. */
  function resgatar(descricao: string, custo: number) {
    if (custo > pontos) return false;
    setEstado((e) => ({
      ...e,
      extrato: [{ id: novoId(), data: new Date().toISOString(), descricao: `Resgate: ${descricao}`, pontos: -custo }, ...e.extrato],
    }));
    return true;
  }

  function adicionarLembrete(medicamento: string, horario: string) {
    setEstado((e) => ({
      ...e,
      lembretes: [...e.lembretes, { id: novoId(), medicamento, horario }].sort((a, b) => a.horario.localeCompare(b.horario)),
    }));
  }

  function removerLembrete(id: string) {
    setEstado((e) => ({ ...e, lembretes: e.lembretes.filter((l) => l.id !== id) }));
  }

  return {
    ...estado,
    pontos,
    totalCesta,
    qtdCesta,
    adicionarNaCesta,
    alterarQuantidade,
    alternarFavorito,
    ehFavorito,
    finalizarPedido,
    resgatar,
    adicionarLembrete,
    removerLembrete,
  };
}

type Loja = ReturnType<typeof useLojaEstado>;

const LojaContext = createContext<Loja | null>(null);

export function LojaProvider({ children }: { children: ReactNode }) {
  const loja = useLojaEstado();
  return <LojaContext.Provider value={loja}>{children}</LojaContext.Provider>;
}

export function useLoja() {
  const loja = useContext(LojaContext);
  if (!loja) throw new Error('useLoja precisa estar dentro de <LojaProvider>');
  return loja;
}
