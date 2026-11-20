import { Pill } from 'lucide-react';
import { useState } from 'react';
import type { Produto } from '../types';

export default function ImagemProduto({ produto }: { produto: Produto }) {
  const [erro, setErro] = useState(false);
  if (!produto.imagem || erro) {
    return (
      <div className="imagem-produto imagem-produto--vazia" aria-hidden="true">
        <Pill size={36} />
        <span>{produto.marca}</span>
      </div>
    );
  }
  return (
    <img className="imagem-produto" src={produto.imagem} alt={produto.nome} loading="lazy" onError={() => setErro(true)} />
  );
}
