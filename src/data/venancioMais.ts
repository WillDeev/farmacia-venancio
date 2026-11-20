import type { Experiencia, Resgate } from '../types';

export const experiencias: Experiencia[] = [
  {
    id: 'consulta-dermatologica',
    nome: 'Consulta dermatológica',
    icone: 'estetoscopio',
    imagem: '/img/experiencias/consulta-dermatologica.jpg',
    pontos: 3000,
  },
  {
    id: 'derm-scan',
    nome: 'Análise de pele Derm Scan',
    icone: 'rosto',
    imagem: '/img/experiencias/derm-scan.jpg',
    pontos: 1500,
  },
  {
    id: 'dermoconsultoria',
    nome: 'Dermoconsultoria',
    icone: 'flor',
    imagem: '/img/experiencias/dermoconsultoria.jpg',
    pontos: 800,
  },
];

export const resgates: Resgate[] = [
  {
    id: 'resgate-la-roche',
    nome: 'Protetor Solar Facial La Roche-Posay FPS 50',
    detalhe: '40ml',
    imagem: '/img/resgate/protetor-la-roche.jpg',
    pontos: 2000,
  },
  {
    id: 'resgate-neutrogena',
    nome: 'Sérum Facial Hidratante Neutrogena Hydro Boost',
    detalhe: '30ml',
    imagem: '/img/resgate/serum-neutrogena.jpg',
    pontos: 1200,
  },
  {
    id: 'resgate-anua',
    nome: 'Kit Skincare Coreano Anua',
    detalhe: '4 produtos',
    imagem: '/img/resgate/kit-anua.jpg',
    pontos: 3500,
  },
  {
    id: 'resgate-nivea',
    nome: 'Hidratante Corporal Pós-Sol Nivea',
    detalhe: '200ml',
    imagem: '/img/resgate/pos-sol-nivea.jpg',
    pontos: 900,
  },
];

export const cupons = [
  { codigo: 'PRIMEIRA15', titulo: 'R$ 15 OFF na primeira compra', regra: 'Compras acima de R$ 150. Exceto medicamentos e fórmula infantil.' },
  { codigo: 'VERAO10', titulo: '10% OFF em protetor solar', regra: 'Válido para a categoria Protetor Solar.' },
  { codigo: 'FRETEGRATIS', titulo: 'Frete grátis', regra: 'Compras acima de R$ 99 com entrega.' },
];

export const beneficios = [
  { titulo: '1 ponto a cada R$ 1', texto: 'Ganhe pontos em todas as compras no app e nas lojas.' },
  { titulo: 'Preços exclusivos', texto: 'Descontos de membro em dermocosméticos toda semana.' },
  { titulo: 'Aniversário', texto: 'Mês do aniversário com pontos em dobro.' },
  { titulo: 'Experiências', texto: 'Troque pontos por consultas e análises de pele.' },
];
