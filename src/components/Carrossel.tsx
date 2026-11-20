import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface Slide {
  imagem: string;
  alt: string;
  link: string;
}

export default function Carrossel({ slides, intervalo = 5000 }: { slides: Slide[]; intervalo?: number }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);

  const irPara = (i: number) => {
    const el = trilho.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    const id = setInterval(() => irPara((atual + 1) % slides.length), intervalo);
    return () => clearInterval(id);
  }, [atual, slides.length, intervalo]);

  return (
    <div className="carrossel">
      <div
        className="carrossel__trilho"
        ref={trilho}
        onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {slides.map((s) => (
          <Link key={s.imagem} to={s.link} className="carrossel__slide">
            <img src={s.imagem} alt={s.alt} />
          </Link>
        ))}
      </div>
      <div className="carrossel__pontos">
        {slides.map((s, i) => (
          <button
            key={s.imagem}
            className={i === atual ? 'ativo' : ''}
            aria-label={`Ir para o banner ${i + 1}`}
            onClick={() => irPara(i)}
          />
        ))}
      </div>
    </div>
  );
}
