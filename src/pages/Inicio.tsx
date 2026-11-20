import { BadgePercent, Percent, Store, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cabecalho from '../components/Cabecalho';
import CartaoProduto from '../components/CartaoProduto';
import Carrossel from '../components/Carrossel';
import TituloSecao from '../components/TituloSecao';
import { banners, categorias, destaques, ofertasDaSemana, produtos } from '../data/catalogo';

const vantagens = [
  { Icone: Truck, titulo: 'Entrega rápida', texto: 'Receba em todo o Brasil', to: '/cesta' },
  { Icone: Store, titulo: 'Retire na loja', texto: 'Mais praticidade para você', to: '/lojas' },
  { Icone: BadgePercent, titulo: 'Descontos no app', texto: 'Ofertas exclusivas', to: '/ofertas' },
];

const porId = (id: string) => produtos.find((p) => p.id === id)!;

export default function Inicio() {
  return (
    <>
      <Cabecalho />

      <Carrossel slides={banners} />

      <section className="vantagens">
        {vantagens.map(({ Icone, titulo, texto, to }) => (
          <Link key={titulo} to={to} className="vantagem">
            <Icone size={26} />
            <span>
              <strong>{titulo}</strong>
              <small>{texto}</small>
            </span>
          </Link>
        ))}
      </section>

      <section className="categorias" aria-label="Categorias">
        {categorias.map((c) => (
          <Link key={c.slug} to={`/categoria/${c.slug}`} className="categoria">
            <img src={c.imagem} alt="" />
            <span>{c.nome}</span>
          </Link>
        ))}
      </section>

      <section className="secao">
        <TituloSecao
          icone={
            <span className="icone-circulo">
              <Percent size={14} strokeWidth={3} />
            </span>
          }
          titulo="Ofertas da semana"
          verTodos={{ to: '/ofertas' }}
        />
        <div className="lista-horizontal">
          {ofertasDaSemana.map((id) => (
            <CartaoProduto key={id} produto={porId(id)} />
          ))}
        </div>
      </section>

      <section className="destaques">
        {destaques.map((id) => {
          const p = porId(id);
          return (
            <Link key={id} to={`/produto/${id}`} className="destaque">
              <img src={p.imagem} alt={p.nome} loading="lazy" />
            </Link>
          );
        })}
      </section>
    </>
  );
}
