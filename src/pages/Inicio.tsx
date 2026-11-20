import { BadgePercent, Newspaper, Percent, Store, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Cabecalho from '../components/Cabecalho';
import CartaoNovidade from '../components/CartaoNovidade';
import CartaoProduto from '../components/CartaoProduto';
import Carrossel from '../components/Carrossel';
import TituloSecao from '../components/TituloSecao';
import { banners, categorias, destaques, ofertasDaSemana, produtos } from '../data/catalogo';
import { useArrasteMouse } from '../hooks/useArrasteMouse';
import { carregarNovidades } from '../services/novidades';
import type { Novidade } from '../types';

const vantagens = [
  { Icone: Truck, titulo: 'Entrega rápida', texto: 'Receba em todo o Brasil', to: '/cesta' },
  { Icone: Store, titulo: 'Retire na loja', texto: 'Mais praticidade para você', to: '/lojas' },
  { Icone: BadgePercent, titulo: 'Descontos no app', texto: 'Ofertas exclusivas', to: '/ofertas' },
];

const porId = (id: string) => produtos.find((p) => p.id === id)!;

export default function Inicio() {
  const arrasteCategorias = useArrasteMouse<HTMLElement>();
  const [novidades, setNovidades] = useState<Novidade[]>();

  useEffect(() => {
    carregarNovidades()
      .then(setNovidades)
      .catch(() => setNovidades([]));
  }, []);

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

      <section className="categorias" aria-label="Categorias" {...arrasteCategorias}>
        {categorias.map((c) => (
          <Link key={c.slug} to={`/categoria/${c.slug}`} className="categoria" draggable={false}>
            <img src={c.imagem} alt="" draggable={false} />
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
        {destaques.map(({ id, selo }) => {
          const p = porId(id);
          return (
            <Link key={id} to={`/produto/${id}`} className="destaque">
              <img src={p.imagem} alt={p.nome} loading="lazy" />
              <span className="destaque__selo">{selo}</span>
            </Link>
          );
        })}
      </section>

      {/* Some quietamente se as fontes estiverem fora do ar. */}
      {novidades?.length ? (
        <section className="secao">
          <TituloSecao
            icone={<Newspaper size={26} className="texto-vermelho" />}
            titulo="Novidades do setor"
            verTodos={{ to: '/novidades', rotulo: 'Ver todas' }}
          />
          <div className="lista-horizontal">
            {novidades.slice(0, 5).map((n) => (
              <CartaoNovidade key={n.link} novidade={n} compacto />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
