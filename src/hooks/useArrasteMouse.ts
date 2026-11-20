import { useRef } from 'react';

// Deixa uma faixa com rolagem horizontal ser arrastada com o mouse (o toque já rola
// nativamente). Ao soltar, alinha suavemente no item mais próximo.
export function useArrasteMouse<T extends HTMLElement>() {
  const arraste = useRef<{ x: number; scroll: number } | null>(null);
  const arrastou = useRef(false);

  const terminar = (e: React.PointerEvent<T>) => {
    if (!arraste.current) return;
    arraste.current = null;
    const el = e.currentTarget;
    const itens = [...el.children] as HTMLElement[];
    const base = itens[0]?.offsetLeft ?? 0;
    const alvo = itens.reduce(
      (melhor, item) => {
        const pos = item.offsetLeft - base;
        return Math.abs(pos - el.scrollLeft) < Math.abs(melhor - el.scrollLeft) ? pos : melhor;
      },
      0,
    );
    el.scrollTo({ left: alvo, behavior: 'smooth' });
    // Reativa o snap só depois da animação, senão ele puxa de volta no meio do caminho.
    setTimeout(() => el.classList.remove('arrastando'), 400);
  };

  return {
    onPointerDown: (e: React.PointerEvent<T>) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      arraste.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft };
      arrastou.current = false;
      e.currentTarget.classList.add('arrastando');
    },
    onPointerMove: (e: React.PointerEvent<T>) => {
      if (!arraste.current) return;
      const dx = e.clientX - arraste.current.x;
      if (Math.abs(dx) > 5) arrastou.current = true;
      e.currentTarget.scrollLeft = arraste.current.scroll - dx;
    },
    onPointerUp: terminar,
    onPointerLeave: terminar,
    // Soltar o mouse depois de arrastar não deve abrir o link do item.
    onClickCapture: (e: React.MouseEvent<T>) => {
      if (arrastou.current) e.preventDefault();
      arrastou.current = false;
    },
  };
}
