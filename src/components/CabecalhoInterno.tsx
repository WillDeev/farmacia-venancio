import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CabecalhoInterno({ titulo, direita }: { titulo: ReactNode; direita?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="cabecalho-interno">
      <button className="icone-botao" aria-label="Voltar" onClick={() => navigate(-1)}>
        <ChevronLeft size={28} />
      </button>
      <div className="cabecalho-interno__titulo">{titulo}</div>
      <div className="cabecalho-interno__direita">{direita}</div>
    </header>
  );
}
