import { Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import CabecalhoInterno from '../components/CabecalhoInterno';
import CartaoNovidade from '../components/CartaoNovidade';
import { carregarNovidades, temas } from '../services/novidades';
import type { Novidade } from '../types';

type Filtro = 'todas' | Novidade['tema'];

export default function Novidades() {
  const [novidades, setNovidades] = useState<Novidade[] | null>(null);
  const [erro, setErro] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('todas');

  function carregar() {
    carregarNovidades()
      .then(setNovidades)
      .catch(() => setErro(true));
  }

  useEffect(carregar, []);

  function tentarDeNovo() {
    setErro(false);
    carregar();
  }

  const lista = novidades?.filter((n) => filtro === 'todas' || n.tema === filtro) ?? [];
  const filtros: [Filtro, string][] = [['todas', 'Todas'], ...(Object.entries(temas) as [Filtro, string][])];

  return (
    <>
      <CabecalhoInterno titulo="Novidades do setor" />
      <section className="secao">
        <p className="texto-suave novidades__intro">
          Lançamentos, mercado farmacêutico, saúde e decisões da Anvisa, atualizados ao longo do dia.
        </p>

        <div className="chips novidades__filtros" role="tablist">
          {filtros.map(([id, rotulo]) => (
            <button
              key={id}
              role="tab"
              aria-selected={filtro === id}
              className={filtro === id ? 'chip chip--ativo' : 'chip'}
              onClick={() => setFiltro(id)}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {erro ? (
          <div className="estado-vazio">
            <p>Não foi possível carregar as novidades agora.</p>
            <button className="botao-secundario" onClick={tentarDeNovo}>
              <RefreshCw size={16} /> Tentar de novo
            </button>
          </div>
        ) : !novidades ? (
          <p className="estado-vazio">
            <Loader2 className="girando" /> Carregando novidades...
          </p>
        ) : (
          <div className="lista-noticias">
            {lista.map((n) => (
              <CartaoNovidade key={n.link} novidade={n} />
            ))}
          </div>
        )}

        <p className="fonte-dados">
          Fontes: Panorama Farmacêutico, Medicina S/A e Google Notícias. As matérias abrem no site de cada veículo.
        </p>
      </section>
    </>
  );
}
