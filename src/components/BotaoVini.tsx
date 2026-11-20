import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLoja } from '../context/LojaContext';

const frases = ['Dúvidas?', 'Oi! Eu sou o Vini 🐾', 'Au au! 🐶', 'Posso ajudar?', 'Au au! Me chama!'];

// Atalho fixo para o chat do Vini, no canto inferior direito.
export default function BotaoVini() {
  const { qtdCesta } = useLoja();
  const [frase, setFrase] = useState(0);
  return (
    <Link
      to="/ajuda"
      className={qtdCesta > 0 ? 'botao-vini botao-vini--com-cesta' : 'botao-vini'}
      aria-label="Tirar dúvidas com o Vini"
    >
      <img src="/img/vini/avatar.png" alt="" />
      {/* Cada volta da animação começa com o balão escondido: é a hora de trocar a frase. */}
      <span className="botao-vini__balao" onAnimationIteration={() => setFrase((f) => (f + 1) % frases.length)}>
        {frases[frase]}
      </span>
    </Link>
  );
}
