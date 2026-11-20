import { Landmark } from 'lucide-react';
import { quandoFoi, temas } from '../services/novidades';
import type { Novidade } from '../types';

// Card de notícia; abre a matéria original em outra aba.
export default function CartaoNovidade({ novidade: n, compacto }: { novidade: Novidade; compacto?: boolean }) {
  return (
    <a href={n.link} target="_blank" rel="noreferrer" className={compacto ? 'noticia noticia--compacta' : 'noticia'}>
      {n.imagem ? (
        <img className="noticia__imagem" src={n.imagem} alt="" loading="lazy" />
      ) : (
        <span className="noticia__imagem noticia__imagem--vazia" aria-hidden="true">
          <Landmark size={28} />
        </span>
      )}
      <span className="noticia__corpo">
        <span className="noticia__meta">
          <span className={`noticia__tema noticia__tema--${n.tema}`}>{temas[n.tema]}</span>
          {n.fonte} · {quandoFoi(n.data)}
        </span>
        <strong className="noticia__titulo">{n.titulo}</strong>
        {!compacto && n.resumo && <span className="noticia__resumo">{n.resumo}</span>}
      </span>
    </a>
  );
}
