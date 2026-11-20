export type Tarja = 'sem tarja' | 'vermelha' | 'preta';

export interface Produto {
  id: string;
  nome: string;
  marca: string;
  categoria: string; // slug de Categoria
  preco: number;
  precoAntigo?: number;
  imagem?: string;
  ean?: string;
  descricao?: string;
  /** Só para medicamentos. Tarja vermelha exige receita; tarja preta não é vendida online. */
  tarja?: Tarja;
  /** Medicamento cuja receita fica retida na farmácia (ex.: antibióticos). */
  retencaoReceita?: boolean;
  /** Produto vindo de API externa, sem preço real cadastrado. */
  precoSimulado?: boolean;
}

export interface Categoria {
  slug: string;
  nome: string;
  imagem: string;
}

export interface ItemCesta {
  produto: Produto;
  quantidade: number;
}

export interface Pedido {
  id: string;
  data: string; // ISO
  itens: ItemCesta[];
  total: number;
  entrega: 'entrega' | 'retirada';
  status: 'Recebido' | 'Em separação' | 'Saiu para entrega' | 'Pronto para retirada' | 'Entregue';
  pontosGanhos: number;
}

export interface Experiencia {
  id: string;
  nome: string;
  icone: 'estetoscopio' | 'rosto' | 'flor';
  imagem: string;
  pontos: number;
}

export interface Resgate {
  id: string;
  nome: string;
  detalhe: string;
  imagem: string;
  pontos: number;
}

export interface MovimentoPontos {
  id: string;
  data: string; // ISO
  descricao: string;
  pontos: number; // positivo = ganho, negativo = resgate
}

export interface Lembrete {
  id: string;
  medicamento: string;
  horario: string; // HH:mm
}
