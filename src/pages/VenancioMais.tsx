import {
  ChevronRight,
  Copy,
  Flower2,
  Gift,
  ScanFace,
  ShoppingBag,
  Star,
  Stethoscope,
  Ticket,
} from 'lucide-react';
import { useState } from 'react';
import Cabecalho from '../components/Cabecalho';
import Modal from '../components/Modal';
import TituloSecao from '../components/TituloSecao';
import { useLoja } from '../context/LojaContext';
import { beneficios, cupons, experiencias, resgates } from '../data/venancioMais';
import type { Experiencia } from '../types';

const abas = [
  { id: 'experiencias', rotulo: 'Experiências', Icone: Star },
  { id: 'produtos', rotulo: 'Produtos', Icone: ShoppingBag },
  { id: 'cupons', rotulo: 'Cupons', Icone: Ticket },
  { id: 'beneficios', rotulo: 'Benefícios', Icone: Gift },
] as const;

type Aba = (typeof abas)[number]['id'];

const iconeExperiencia: Record<Experiencia['icone'], typeof Star> = {
  estetoscopio: Stethoscope,
  rosto: ScanFace,
  flor: Flower2,
};

const pts = (n: number) => n.toLocaleString('pt-BR');

interface ItemResgate {
  nome: string;
  pontos: number;
}

export default function VenancioMais() {
  const { pontos, extrato, resgatar } = useLoja();
  const [aba, setAba] = useState<Aba>('experiencias');
  const [verExtrato, setVerExtrato] = useState(false);
  const [confirmar, setConfirmar] = useState<ItemResgate | null>(null);
  const [aviso, setAviso] = useState('');

  function avisar(texto: string) {
    setAviso(texto);
    setTimeout(() => setAviso(''), 2500);
  }

  function confirmarResgate() {
    if (!confirmar) return;
    if (resgatar(confirmar.nome, confirmar.pontos)) avisar(`Resgate de "${confirmar.nome}" confirmado!`);
    else avisar(`Faltam ${pts(confirmar.pontos - pontos)} pts para este resgate.`);
    setConfirmar(null);
  }

  const listaResgates = (
    <div className={aba === 'produtos' ? 'grade-resgates' : 'lista-horizontal'}>
      {resgates.map((r) => (
        <button key={r.id} className="cartao-resgate" onClick={() => setConfirmar(r)}>
          <span className="cartao-resgate__foto">
            <img src={r.imagem} alt="" loading="lazy" />
            <span className="selo-pontos">{pts(r.pontos)} pts</span>
          </span>
          <span className="cartao-resgate__nome">{r.nome}</span>
          <small>{r.detalhe}</small>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <Cabecalho />

      <section className="vmais-topo">
        <span className="vmais-topo__selo">V+</span>
        <div className="vmais-topo__texto">
          <h1>Venancio+</h1>
          <p>Mais beleza, mais benefícios.</p>
        </div>
        <button className="vmais-pontos" onClick={() => setVerExtrato(true)}>
          <strong>
            {pts(pontos)} <small>pts</small>
          </strong>
          <span>
            Extrato <ChevronRight size={16} />
          </span>
        </button>
      </section>

      <nav className="abas" role="tablist">
        {abas.map(({ id, rotulo, Icone }) => (
          <button
            key={id}
            role="tab"
            aria-selected={aba === id}
            className={aba === id ? 'aba ativa' : 'aba'}
            onClick={() => setAba(id)}
          >
            <Icone size={20} />
            {rotulo}
          </button>
        ))}
      </nav>

      {aba === 'experiencias' && (
        <>
          <img className="banner-largo" src="/img/banners/venancio-mais.jpg" alt="Venancio+: seus pontos, novas formas de cuidar" />

          <section className="secao">
            <TituloSecao
              icone={
                <span className="icone-circulo">
                  <Star size={14} fill="currentColor" />
                </span>
              }
              titulo="Experiências"
              verTodos={{ to: '/venancio-mais', rotulo: 'Ver todas' }}
            />
            <div className="lista-horizontal">
              {experiencias.map((x) => {
                const Icone = iconeExperiencia[x.icone];
                return (
                  <button key={x.id} className="cartao-experiencia" onClick={() => setConfirmar(x)}>
                    <img src={x.imagem} alt="" loading="lazy" />
                    <span className="cartao-experiencia__corpo">
                      <span className="cartao-experiencia__nome">
                        <span className="icone-suave">
                          <Icone size={20} />
                        </span>
                        {x.nome}
                      </span>
                      <small>A partir de</small>
                      <span className="cartao-experiencia__pontos">
                        <strong>
                          {pts(x.pontos)} <small>pts</small>
                        </strong>
                        <ChevronRight size={20} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="secao">
            <TituloSecao
              icone={<ShoppingBag size={28} className="texto-vermelho" />}
              titulo="Resgate produtos"
              verTodos={{ to: '/venancio-mais' }}
            />
            {listaResgates}
          </section>
        </>
      )}

      {aba === 'produtos' && <section className="secao">{listaResgates}</section>}

      {aba === 'cupons' && (
        <section className="secao lista-cupons">
          {cupons.map((c) => (
            <div key={c.codigo} className="cupom">
              <div>
                <strong>{c.titulo}</strong>
                <p>{c.regra}</p>
              </div>
              <button
                className="cupom__codigo"
                onClick={() => {
                  navigator.clipboard?.writeText(c.codigo);
                  avisar(`Cupom ${c.codigo} copiado!`);
                }}
              >
                {c.codigo} <Copy size={14} />
              </button>
            </div>
          ))}
        </section>
      )}

      {aba === 'beneficios' && (
        <section className="secao lista-beneficios">
          {beneficios.map((b) => (
            <div key={b.titulo} className="beneficio">
              <Gift size={22} />
              <div>
                <strong>{b.titulo}</strong>
                <p>{b.texto}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <Modal titulo="Extrato de pontos" aberto={verExtrato} aoFechar={() => setVerExtrato(false)}>
        <ul className="extrato">
          {extrato.map((m) => (
            <li key={m.id}>
              <span>
                {m.descricao}
                <small>{new Date(m.data).toLocaleDateString('pt-BR')}</small>
              </span>
              <strong className={m.pontos < 0 ? 'negativo' : 'positivo'}>
                {m.pontos > 0 ? '+' : ''}
                {pts(m.pontos)} pts
              </strong>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal titulo="Confirmar resgate" aberto={!!confirmar} aoFechar={() => setConfirmar(null)}>
        {confirmar && (
          <div className="confirmar-resgate">
            <p>
              Trocar <strong>{pts(confirmar.pontos)} pts</strong> por <strong>{confirmar.nome}</strong>?
            </p>
            <p className="texto-suave">Seu saldo: {pts(pontos)} pts</p>
            <button className="botao-primario" onClick={confirmarResgate}>
              Resgatar
            </button>
          </div>
        )}
      </Modal>

      {aviso && <div className="toast">{aviso}</div>}
    </>
  );
}
