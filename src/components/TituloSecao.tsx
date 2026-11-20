import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  icone: ReactNode;
  titulo: string;
  /** Com `to` vira link; com `onClick`, botão (ex.: trocar de aba na mesma página). */
  verTodos?: { to?: string; onClick?: () => void; rotulo?: string };
}

export default function TituloSecao({ icone, titulo, verTodos }: Props) {
  const conteudo = verTodos && (
    <>
      {verTodos.rotulo ?? 'Ver todos'} <ChevronRight size={16} />
    </>
  );
  return (
    <div className="titulo-secao">
      <h2>
        {icone}
        {titulo}
      </h2>
      {verTodos?.to && (
        <Link to={verTodos.to} className="link-ver-todos">
          {conteudo}
        </Link>
      )}
      {verTodos?.onClick && (
        <button type="button" onClick={verTodos.onClick} className="link-ver-todos">
          {conteudo}
        </button>
      )}
    </div>
  );
}
