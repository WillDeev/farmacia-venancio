import { AlertTriangle, ChevronDown, FileText, Heart, Loader2, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CabecalhoInterno from '../components/CabecalhoInterno';
import ImagemProduto from '../components/ImagemProduto';
import { useLoja } from '../context/LojaContext';
import { detalhes } from '../data/detalhes';
import { descontoPercentual, formatarPreco, nomeCategoria, obterProduto } from '../services/catalogo';
import type { Produto as TProduto } from '../types';

export default function Produto() {
  const { id = '' } = useParams();
  const { adicionarNaCesta, alternarFavorito, ehFavorito } = useLoja();
  const [produto, setProduto] = useState<TProduto | null | undefined>(undefined);
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  // A rota usa key={id}, então o estado recomeça a cada produto.
  useEffect(() => {
    obterProduto(id)
      .then((p) => setProduto(p ?? null))
      .catch(() => setProduto(null));
  }, [id]);

  if (produto === undefined) {
    return (
      <>
        <CabecalhoInterno titulo="Produto" />
        <p className="estado-vazio">
          <Loader2 className="girando" /> Carregando...
        </p>
      </>
    );
  }

  if (produto === null) {
    return (
      <>
        <CabecalhoInterno titulo="Produto" />
        <p className="estado-vazio">Produto não encontrado.</p>
      </>
    );
  }

  const desconto = descontoPercentual(produto);
  const bloqueado = produto.tarja === 'preta';
  const info = detalhes[produto.id];

  return (
    <>
      <CabecalhoInterno
        titulo={nomeCategoria(produto.categoria)}
        direita={
          <button
            className={ehFavorito(produto.id) ? 'icone-botao favorito ativo' : 'icone-botao favorito'}
            aria-label={ehFavorito(produto.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onClick={() => alternarFavorito(produto)}
          >
            <Heart size={24} fill={ehFavorito(produto.id) ? 'currentColor' : 'none'} />
          </button>
        }
      />

      <div className="produto">
        <div className="produto__imagem">
          {desconto > 0 && <span className="selo-desconto">-{desconto}%</span>}
          <ImagemProduto produto={produto} />
        </div>

        <p className="produto__marca">{produto.marca}</p>
        <h1 className="produto__nome">{produto.nome}</h1>

        <p className="produto__precos">
          <strong>{formatarPreco(produto.preco)}</strong>
          {produto.precoAntigo && <s>{formatarPreco(produto.precoAntigo)}</s>}
        </p>
        {produto.precoAntigo && <p className="texto-suave">Em até 3x sem juros</p>}

        {produto.tarja && produto.tarja !== 'sem tarja' && (
          <div className={`aviso-tarja aviso-tarja--${produto.tarja}`}>
            <AlertTriangle size={20} />
            <span>
              {bloqueado
                ? 'Medicamento de tarja preta: venda apenas na loja física, com receita.'
                : produto.retencaoReceita
                  ? 'Venda sob prescrição médica. A receita será retida na entrega ou retirada.'
                  : 'Venda sob prescrição médica. Apresente a receita na entrega ou retirada.'}
            </span>
          </div>
        )}

        {info?.intro.length ? (
          <div className="produto__descricao">
            {info.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ) : (
          produto.descricao && <p className="produto__descricao">{produto.descricao}</p>
        )}

        {info?.ficha.length ? (
          <dl className="ficha">
            {info.ficha.map(({ rotulo, valor }) => (
              <div key={rotulo}>
                <dt>{rotulo}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        ) : (
          produto.ean && <p className="texto-suave">Código de barras: {produto.ean}</p>
        )}

        {info?.secoes.map((s, i) => (
          <details key={s.titulo} className="detalhe" open={i === 0}>
            <summary>
              {s.titulo} <ChevronDown size={18} />
            </summary>
            {s.blocos.map((b, j) =>
              b.tipo === 'p' ? (
                <p key={j}>{b.texto}</p>
              ) : (
                <ul key={j}>
                  {b.itens.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ),
            )}
          </details>
        ))}

        {info?.advertencia && (
          <div className="advertencia-ms">
            <FileText size={20} />
            <p>
              {info.advertencia}
              {info.bula && (
                <a href={info.bula} target="_blank" rel="noreferrer">
                  Ler a bula (PDF)
                </a>
              )}
            </p>
          </div>
        )}

        {info?.faq.length ? (
          <section className="produto__faq">
            <h2>Perguntas frequentes</h2>
            {info.faq.map(({ pergunta, resposta }) => (
              <details key={pergunta} className="detalhe">
                <summary>
                  {pergunta} <ChevronDown size={18} />
                </summary>
                <p>{resposta}</p>
              </details>
            ))}
          </section>
        ) : null}

        {produto.precoSimulado && (
          <p className="fonte-dados">
            Dados e imagem: Open Beauty Facts (CC BY-SA). Preço de demonstração.
          </p>
        )}
      </div>

      {!bloqueado && (
        <div className="comprar">
          <div className="seletor-qtd">
            <button aria-label="Diminuir" onClick={() => setQuantidade((q) => Math.max(1, q - 1))}>
              <Minus size={18} />
            </button>
            <span>{quantidade}</span>
            <button aria-label="Aumentar" onClick={() => setQuantidade((q) => q + 1)}>
              <Plus size={18} />
            </button>
          </div>
          {adicionado ? (
            <Link to="/cesta" className="botao-primario">
              Ir para a cesta
            </Link>
          ) : (
            <button
              className="botao-primario"
              onClick={() => {
                adicionarNaCesta(produto, quantidade);
                setAdicionado(true);
              }}
            >
              Adicionar à cesta
            </button>
          )}
        </div>
      )}
    </>
  );
}
