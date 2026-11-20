import { Link } from 'react-router-dom';
import { descontoPercentual, formatarPreco } from '../services/catalogo';
import type { Produto } from '../types';
import ImagemProduto from './ImagemProduto';

export default function CartaoProduto({ produto }: { produto: Produto }) {
  const desconto = descontoPercentual(produto);
  return (
    <Link to={`/produto/${produto.id}`} className="cartao-produto">
      {desconto > 0 && <span className="selo-desconto">-{desconto}%</span>}
      <ImagemProduto produto={produto} />
      <p className="cartao-produto__nome">{produto.nome}</p>
      {produto.tarja === 'vermelha' && <span className="tag-receita">Exige receita</span>}
      <p className="cartao-produto__precos">
        <strong>{formatarPreco(produto.preco)}</strong>
        {produto.precoAntigo && <s>{formatarPreco(produto.precoAntigo)}</s>}
      </p>
    </Link>
  );
}
