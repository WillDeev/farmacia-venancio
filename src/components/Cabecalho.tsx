import { CalendarDays, Heart, ScanLine, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoja } from '../context/LojaContext';
import Logo from './Logo';

export default function Cabecalho({ termo = '' }: { termo?: string }) {
  const navigate = useNavigate();
  const { lembretes } = useLoja();

  return (
    <header className="cabecalho">
      <Link to="/" className="cabecalho__logo">
        <Logo />
      </Link>
      <form
        className="busca"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get('q')?.toString().trim();
          if (q) navigate(`/busca?q=${encodeURIComponent(q)}`);
        }}
      >
        <Search size={18} className="busca__lupa" />
        <input
          key={termo}
          name="q"
          type="search"
          placeholder="O que você está buscando?"
          defaultValue={termo}
          aria-label="Buscar produtos"
        />
        <Link to="/busca?scan=1" className="busca__scan" aria-label="Buscar por código de barras">
          <ScanLine size={20} />
        </Link>
      </form>
      <Link to="/favoritos" className="icone-botao" aria-label="Favoritos">
        <Heart size={24} />
      </Link>
      <Link to="/lembretes" className="icone-botao" aria-label="Lembretes de medicamentos">
        <CalendarDays size={24} />
        {lembretes.length > 0 && <span className="ponto-notificacao" />}
      </Link>
    </header>
  );
}
