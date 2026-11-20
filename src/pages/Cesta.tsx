import { AlertTriangle, Minus, Plus, ShoppingBasket, Store, Trash2, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CabecalhoInterno from '../components/CabecalhoInterno';
import ImagemProduto from '../components/ImagemProduto';
import { useLoja } from '../context/LojaContext';
import { formatarPreco } from '../services/catalogo';
import type { Pedido } from '../types';

const FRETE = 9.9;
const FRETE_GRATIS_A_PARTIR = 99;

export default function Cesta() {
  const { cesta, totalCesta, alterarQuantidade, finalizarPedido } = useLoja();
  const [entrega, setEntrega] = useState<Pedido['entrega']>('entrega');
  const navigate = useNavigate();

  if (cesta.length === 0) {
    return (
      <>
        <CabecalhoInterno titulo="Cesta" />
        <div className="estado-vazio">
          <ShoppingBasket size={48} />
          <p>Sua cesta está vazia.</p>
          <Link to="/ofertas" className="botao-primario">
            Ver ofertas
          </Link>
        </div>
      </>
    );
  }

  const exigeReceita = cesta.some((i) => i.produto.tarja === 'vermelha');
  const frete = entrega === 'retirada' || totalCesta >= FRETE_GRATIS_A_PARTIR ? 0 : FRETE;

  return (
    <>
      <CabecalhoInterno titulo="Cesta" />

      <ul className="itens-cesta">
        {cesta.map(({ produto, quantidade }) => (
          <li key={produto.id}>
            <Link to={`/produto/${produto.id}`} className="itens-cesta__imagem">
              <ImagemProduto produto={produto} />
            </Link>
            <div className="itens-cesta__info">
              <p>{produto.nome}</p>
              <strong>{formatarPreco(produto.preco * quantidade)}</strong>
              <div className="seletor-qtd seletor-qtd--pequeno">
                <button aria-label="Diminuir" onClick={() => alterarQuantidade(produto.id, quantidade - 1)}>
                  {quantidade === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                </button>
                <span>{quantidade}</span>
                <button aria-label="Aumentar" onClick={() => alterarQuantidade(produto.id, quantidade + 1)}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {exigeReceita && (
        <div className="aviso-tarja aviso-tarja--vermelha aviso-cesta">
          <AlertTriangle size={20} />
          <span>Sua cesta tem medicamentos que exigem receita. Tenha a receita em mãos na entrega ou retirada.</span>
        </div>
      )}

      <div className="opcoes-entrega">
        <button className={entrega === 'entrega' ? 'ativa' : ''} onClick={() => setEntrega('entrega')}>
          <Truck size={22} />
          <span>
            <strong>Receber em casa</strong>
            <small>{totalCesta >= FRETE_GRATIS_A_PARTIR ? 'Frete grátis' : `Frete ${formatarPreco(FRETE)}`}</small>
          </span>
        </button>
        <button className={entrega === 'retirada' ? 'ativa' : ''} onClick={() => setEntrega('retirada')}>
          <Store size={22} />
          <span>
            <strong>Retirar na loja</strong>
            <small>Grátis, em até 1 hora</small>
          </span>
        </button>
      </div>

      <div className="resumo">
        <p>
          <span>Subtotal</span> <span>{formatarPreco(totalCesta)}</span>
        </p>
        <p>
          <span>Frete</span> <span>{frete ? formatarPreco(frete) : 'Grátis'}</span>
        </p>
        <p className="resumo__total">
          <span>Total</span> <strong>{formatarPreco(totalCesta + frete)}</strong>
        </p>
        <p className="texto-suave">Você ganha {Math.floor(totalCesta)} pts no Venancio+</p>
      </div>

      <div className="comprar">
        <button
          className="botao-primario"
          onClick={() => {
            finalizarPedido(entrega);
            navigate('/pedidos', { replace: true });
          }}
        >
          Finalizar pedido
        </button>
      </div>
    </>
  );
}
