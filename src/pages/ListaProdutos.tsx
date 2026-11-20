import type { ReactNode } from 'react';
import CabecalhoInterno from '../components/CabecalhoInterno';
import CartaoProduto from '../components/CartaoProduto';
import type { Produto } from '../types';

export default function ListaProdutos({ titulo, produtos, vazio }: { titulo: string; produtos: Produto[]; vazio?: ReactNode }) {
  return (
    <>
      <CabecalhoInterno titulo={titulo} />
      {produtos.length === 0 ? (
        <div className="estado-vazio">{vazio ?? 'Nenhum produto nesta categoria por enquanto.'}</div>
      ) : (
        <section className="secao">
          <div className="grade-produtos">
            {produtos.map((p) => (
              <CartaoProduto key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
