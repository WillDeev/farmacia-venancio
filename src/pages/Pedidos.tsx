import { ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import CabecalhoInterno from '../components/CabecalhoInterno';
import { useLoja } from '../context/LojaContext';
import { formatarPreco } from '../services/catalogo';

export default function Pedidos() {
  const { pedidos } = useLoja();

  return (
    <>
      <CabecalhoInterno titulo="Meus pedidos" />
      {pedidos.length === 0 ? (
        <div className="estado-vazio">
          <ClipboardList size={48} />
          <p>Você ainda não fez nenhum pedido.</p>
          <Link to="/ofertas" className="botao-primario">
            Ver ofertas
          </Link>
        </div>
      ) : (
        <ul className="lista-pedidos">
          {pedidos.map((p) => (
            <li key={p.id} className="cartao">
              <div className="lista-pedidos__topo">
                <strong>Pedido #{p.id}</strong>
                <span className="status">{p.status}</span>
              </div>
              <p className="texto-suave">
                {new Date(p.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} ·{' '}
                {p.entrega === 'entrega' ? 'Entrega em casa' : 'Retirada na loja'}
              </p>
              <p>{p.itens.map((i) => `${i.quantidade}x ${i.produto.nome}`).join(', ')}</p>
              <div className="lista-pedidos__topo">
                <strong>{formatarPreco(p.total)}</strong>
                <span className="texto-vermelho">+{p.pontosGanhos} pts</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
