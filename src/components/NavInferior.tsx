import { Home, Menu, Store, Tag } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const itens = [
  { to: '/', rotulo: 'Início', Icone: Home },
  { to: '/ofertas', rotulo: 'Ofertas', Icone: Tag },
  { to: '/venancio-mais', rotulo: 'Venancio+', Icone: null },
  { to: '/lojas', rotulo: 'Lojas', Icone: Store },
  { to: '/mais', rotulo: 'Mais', Icone: Menu },
];

export default function NavInferior() {
  return (
    <nav className="nav-inferior" aria-label="Navegação principal">
      {itens.map(({ to, rotulo, Icone }) => (
        <NavLink key={to} to={to} end={to === '/'} className="nav-inferior__item">
          {Icone ? <Icone size={24} /> : <span className="selo-vmais">V+</span>}
          <span>{rotulo}</span>
        </NavLink>
      ))}
    </nav>
  );
}
