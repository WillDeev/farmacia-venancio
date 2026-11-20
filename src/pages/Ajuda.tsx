import { ChevronDown, ChevronRight, MapPin, MessageCircleQuestion, Package, PillBottle, SendHorizontal, Star, Tag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CabecalhoInterno from '../components/CabecalhoInterno';
import ImagemProduto from '../components/ImagemProduto';
import { MarcaV } from '../components/Logo';
import { useLoja } from '../context/LojaContext';
import { responder, type Resposta } from '../services/assistente';
import { formatarPreco } from '../services/catalogo';

interface Mensagem extends Partial<Resposta> {
  id: number;
  de: 'vini' | 'cliente';
  texto: string;
  hora: string;
}

const atalhos = [
  { Icone: Package, rotulo: 'Meus pedidos', pergunta: 'Como acompanho meu pedido?' },
  { Icone: Tag, rotulo: 'Ofertas', pergunta: 'Quais são as ofertas?' },
  { Icone: PillBottle, rotulo: 'Dúvidas sobre produtos', pergunta: 'Preciso de receita para comprar remédio?' },
  { Icone: MapPin, rotulo: 'Lojas próximas', pergunta: 'Onde tem uma loja perto de mim?' },
];

const perguntas = {
  'Perguntas frequentes': [
    'Como acompanho meu pedido?',
    'Como funciona o Venancio+?',
    'Como encontro um produto?',
    'Como uso meus pontos?',
  ],
  'Pedidos e entregas': [
    'Qual o status do meu pedido?',
    'Posso retirar na loja?',
    'Quais lojas ficam abertas 24 horas?',
  ],
  'Medicamentos': [
    'Preciso de receita para comprar remédio?',
    'Vocês vendem medicamento controlado?',
    'Tem desconto em genéricos?',
  ],
};

type Tema = keyof typeof perguntas;

const chips = [
  { Icone: Tag, rotulo: 'Ver ofertas' },
  { Icone: Star, rotulo: 'Consultar pontos' },
  { Icone: MapPin, rotulo: 'Encontrar loja' },
];

const agora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default function Ajuda() {
  const { pontos, pedidos } = useLoja();
  const [tema, setTema] = useState<Tema>('Perguntas frequentes');
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [inicio] = useState(agora);
  const fim = useRef<HTMLDivElement>(null);
  const faq = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mensagens.length) fim.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  function enviar(pergunta: string) {
    const limpa = pergunta.trim();
    if (!limpa) return;
    const hora = agora();
    const resposta = responder(limpa, { pontos, pedidos });
    setMensagens((m) => [
      ...m,
      { id: m.length, de: 'cliente', texto: limpa, hora },
      { id: m.length + 1, de: 'vini', hora, ...resposta },
    ]);
    setTexto('');
  }

  const temas = Object.keys(perguntas) as Tema[];

  return (
    <div className="chat">
      <CabecalhoInterno
        titulo={
          <span className="logo">
            <MarcaV tamanho={40} />
            <span className="logo__nome logo__nome--grande">VENANCIO</span>
          </span>
        }
        direita={
          <button className="ajuda-faq" onClick={() => faq.current?.scrollIntoView({ behavior: 'smooth' })}>
            Ajuda <MessageCircleQuestion size={26} />
          </button>
        }
      />

      <div className="chat__corpo">
        <div className="balao-vini">
          <img src="/img/vini/avatar.png" alt="Vini, assistente virtual" className="avatar-vini" />
          <div>
            <p className="balao">Oi! Sou o Vini, assistente virtual da Venancio. Como posso ajudar você hoje?</p>
            <small className="hora">{inicio}</small>
          </div>
        </div>

        <div className="atalhos">
          {atalhos.map(({ Icone, rotulo, pergunta }) => (
            <button key={rotulo} className="atalho" onClick={() => enviar(pergunta)}>
              <Icone size={34} strokeWidth={1.6} />
              <span>{rotulo}</span>
            </button>
          ))}
        </div>

        <div className="cartao faq" ref={faq}>
          <div className="faq__abas" role="tablist">
            {temas.slice(0, 2).map((t) => (
              <button key={t} role="tab" aria-selected={tema === t} className={tema === t ? 'ativa' : ''} onClick={() => setTema(t)}>
                {t}
              </button>
            ))}
            <button
              role="tab"
              aria-selected={tema === temas[2]}
              className={tema === temas[2] ? 'ativa' : ''}
              onClick={() => setTema(temas[2])}
            >
              Mais <ChevronDown size={18} />
            </button>
          </div>
          <ul>
            {perguntas[tema].map((p) => (
              <li key={p}>
                <button onClick={() => enviar(p)}>
                  {p} <ChevronRight size={20} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="vini-promo">
          <img src="/img/vini/acenando.png" alt="" />
          <div>
            <p className="vini-promo__titulo">
              <MarcaV tamanho={26} /> Venancio+
            </p>
            <p>Posso ajudar você a encontrar produtos, consultar benefícios e tirar dúvidas.</p>
          </div>
        </div>

        {mensagens.map((m) =>
          m.de === 'cliente' ? (
            <div key={m.id} className="msg-cliente">
              <p className="balao balao--cliente">{m.texto}</p>
              <small className="hora">{m.hora}</small>
            </div>
          ) : (
            <div key={m.id} className="balao-vini">
              <img src="/img/vini/avatar.png" alt="" className="avatar-vini avatar-vini--pequeno" />
              <div>
                <div className="balao">
                  <p>{m.texto}</p>
                  {m.produtos?.map((p) => (
                    <Link key={p.id} to={`/produto/${p.id}`} className="msg-produto">
                      <ImagemProduto produto={p} />
                      <span>
                        {p.nome}
                        <strong>{formatarPreco(p.preco)}</strong>
                      </span>
                    </Link>
                  ))}
                  {m.link && (
                    <Link to={m.link.to} className="msg-link">
                      {m.link.rotulo} <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
                <small className="hora">{m.hora}</small>
              </div>
            </div>
          ),
        )}
        <div ref={fim} />
      </div>

      <div className="chat__rodape">
        <div className="chips">
          {chips.map(({ Icone, rotulo }) => (
            <button key={rotulo} className="chip" onClick={() => enviar(rotulo)}>
              <Icone size={18} /> {rotulo}
            </button>
          ))}
        </div>
        <form
          className="chat__entrada"
          onSubmit={(e) => {
            e.preventDefault();
            enviar(texto);
          }}
        >
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Digite sua mensagem aqui..." aria-label="Mensagem" />
          <button type="submit" className="botao-enviar" aria-label="Enviar" disabled={!texto.trim()}>
            <SendHorizontal size={22} />
          </button>
        </form>
      </div>
    </div>
  );
}
