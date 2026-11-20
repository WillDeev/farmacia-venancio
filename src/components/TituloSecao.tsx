import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  icone: ReactNode;
  titulo: string;
  verTodos?: { to: string; rotulo?: string };
}

export default function TituloSecao({ icone, titulo, verTodos }: Props) {
  return (
    <div className="titulo-secao">
      <h2>
        {icone}
        {titulo}
      </h2>
      {verTodos && (
        <Link to={verTodos.to} className="link-ver-todos">
          {verTodos.rotulo ?? 'Ver todos'} <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
