import { CalendarDays, ChevronRight, ClipboardList, Heart, MessageCircleQuestion, Newspaper, ShoppingBasket, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Cabecalho from '../components/Cabecalho';

const opcoes = [
  { to: '/pedidos', rotulo: 'Meus pedidos', Icone: ClipboardList },
  { to: '/cesta', rotulo: 'Cesta', Icone: ShoppingBasket },
  { to: '/favoritos', rotulo: 'Favoritos', Icone: Heart },
  { to: '/lembretes', rotulo: 'Lembretes de medicamentos', Icone: CalendarDays },
  { to: '/venancio-mais', rotulo: 'Venancio+', Icone: Star },
  { to: '/novidades', rotulo: 'Novidades do setor', Icone: Newspaper },
  { to: '/ajuda', rotulo: 'Ajuda com o Vini', Icone: MessageCircleQuestion },
];

export default function Mais() {
  return (
    <>
      <Cabecalho />
      <section className="secao">
        <h1 className="titulo-pagina">Minha conta</h1>
        <ul className="cartao menu-lista">
          {opcoes.map(({ to, rotulo, Icone }) => (
            <li key={to}>
              <Link to={to}>
                <Icone size={22} className="texto-vermelho" />
                <span>{rotulo}</span>
                <ChevronRight size={20} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
