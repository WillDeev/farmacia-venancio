import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  aberto: boolean;
  aoFechar: () => void;
  children: ReactNode;
}

export default function Modal({ titulo, aberto, aoFechar, children }: Props) {
  if (!aberto) return null;
  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="modal__topo">
          <h3>{titulo}</h3>
          <button className="icone-botao" aria-label="Fechar" onClick={aoFechar}>
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
