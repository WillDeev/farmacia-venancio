import { Baby, Droplets, HandHeart, Leaf, Pill, Sparkles, Sun, Wind, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { Produto } from '../types';

// Enquanto não há foto, cada categoria tem seu ícone e cor.
const visualCategoria: Record<string, { Icone: LucideIcon; cor: string; fundo: string }> = {
  'protetor-solar': { Icone: Sun, cor: '#d97706', fundo: '#fff4e0' },
  skincare: { Icone: Sparkles, cor: '#c2447a', fundo: '#fdebf3' },
  dermocosmeticos: { Icone: Droplets, cor: '#2f6fd6', fundo: '#e6f0ff' },
  vitaminas: { Icone: Leaf, cor: '#2f9a5a', fundo: '#e5f6ec' },
  cabelos: { Icone: Wind, cor: '#8a5cd1', fundo: '#f1eafd' },
  'cuidados-pessoais': { Icone: HandHeart, cor: '#d14b4b', fundo: '#fdecec' },
  medicamentos: { Icone: Pill, cor: '#16245a', fundo: '#e4ecf8' },
  bebe: { Icone: Baby, cor: '#1f8fa8', fundo: '#e3f6fa' },
};

export default function ImagemProduto({ produto }: { produto: Produto }) {
  const [erro, setErro] = useState(false);
  if (!produto.imagem || erro) {
    const { Icone, cor, fundo } = visualCategoria[produto.categoria] ?? visualCategoria.medicamentos;
    return (
      <div
        className="imagem-produto imagem-produto--vazia"
        style={{ '--cat-cor': cor, '--cat-fundo': fundo } as React.CSSProperties}
        aria-hidden="true"
      >
        <span className="imagem-produto__icone">
          <Icone size={26} strokeWidth={1.8} />
        </span>
        <span>{produto.marca}</span>
      </div>
    );
  }
  return (
    <img className="imagem-produto" src={produto.imagem} alt={produto.nome} loading="lazy" onError={() => setErro(true)} />
  );
}
