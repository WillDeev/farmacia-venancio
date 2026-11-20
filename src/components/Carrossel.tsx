import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface Slide {
  imagem: string;
  alt: string;
  link: string;
}

// Arrastar a partir de 15% da largura já troca de banner.
const LIMIAR_TROCA = 0.15;

export default function Carrossel({ slides, intervalo = 5000 }: { slides: Slide[]; intervalo?: number }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  // O toque já rola nativamente; o arraste manual é só para o mouse.
  const arraste = useRef<{ x: number; scroll: number } | null>(null);
  const arrastou = useRef(false);

  const irPara = (i: number) => {
    const el = trilho.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    const id = setInterval(() => irPara((atual + 1) % slides.length), intervalo);
    return () => clearInterval(id);
  }, [atual, slides.length, intervalo]);

  // Cada banner tem uma proporção: o trilho assume a altura do banner ativo.
  const ajustarAltura = () => {
    const el = trilho.current;
    const slide = el?.children[atual] as HTMLElement | undefined;
    if (el && slide) el.style.height = `${slide.offsetHeight}px`;
  };

  useEffect(() => {
    ajustarAltura();
    window.addEventListener('resize', ajustarAltura);
    return () => window.removeEventListener('resize', ajustarAltura);
  });

  const iniciarArraste = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    arraste.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft };
    arrastou.current = false;
    e.currentTarget.classList.add('arrastando');
  };

  const moverArraste = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arraste.current) return;
    const dx = e.clientX - arraste.current.x;
    if (Math.abs(dx) > 5) arrastou.current = true;
    e.currentTarget.scrollLeft = arraste.current.scroll - dx;
  };

  const terminarArraste = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arraste.current) return;
    const el = e.currentTarget;
    const largura = el.clientWidth;
    const dx = e.clientX - arraste.current.x;
    const inicio = Math.round(arraste.current.scroll / largura);
    const passo = Math.abs(dx) > largura * LIMIAR_TROCA ? -Math.sign(dx) : 0;
    arraste.current = null;
    irPara(Math.min(Math.max(inicio + passo, 0), slides.length - 1));
    // Reativa o snap só depois da animação, senão ele puxa de volta no meio do caminho.
    setTimeout(() => el.classList.remove('arrastando'), 400);
  };

  return (
    <div className="carrossel">
      <div
        className="carrossel__trilho"
        ref={trilho}
        onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onPointerDown={iniciarArraste}
        onPointerMove={moverArraste}
        onPointerUp={terminarArraste}
        onPointerLeave={terminarArraste}
        onClickCapture={(e) => {
          // Soltar o mouse depois de arrastar não deve abrir o link do banner.
          if (arrastou.current) e.preventDefault();
          arrastou.current = false;
        }}
      >
        {slides.map((s) => (
          <Link key={s.imagem} to={s.link} className="carrossel__slide" draggable={false}>
            <img src={s.imagem} alt={s.alt} draggable={false} onLoad={ajustarAltura} />
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
