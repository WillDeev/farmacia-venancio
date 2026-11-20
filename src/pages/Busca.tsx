import { Loader2, ScanLine, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CabecalhoInterno from '../components/CabecalhoInterno';
import CartaoProduto from '../components/CartaoProduto';
import { produtos } from '../data/catalogo';
import { buscarLocal, buscarOpenBeautyFacts, obterProduto } from '../services/catalogo';
import type { Produto } from '../types';

const ehCodigoDeBarras = (t: string) => /^\d{8,14}$/.test(t);

export default function Busca() {
  const [params, setParams] = useSearchParams();
  const termo = params.get('q') ?? '';
  const modoScan = params.has('scan');
  const [texto, setTexto] = useState(termo);
  const [resultado, setResultado] = useState<{ termo: string; produtos: Produto[]; erro?: string } | null>(null);

  const locais = ehCodigoDeBarras(termo) ? produtos.filter((p) => p.ean === termo) : buscarLocal(termo);
  const atual = resultado?.termo === termo ? resultado : null;
  const carregando = termo.length >= 3 && !atual;
  const externos = atual?.produtos ?? [];
  const erro = atual?.erro;

  // Busca no Open Beauty Facts com atraso, para não chamar a API a cada tecla.
  useEffect(() => {
    if (termo.length < 3) return;
    const controle = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const encontrados = ehCodigoDeBarras(termo)
          ? [await obterProduto(`obf-${termo}`)].filter((p): p is Produto => !!p)
          : await buscarOpenBeautyFacts(termo, controle.signal);
        setResultado({ termo, produtos: encontrados });
      } catch {
        if (!controle.signal.aborted) {
          setResultado({ termo, produtos: [], erro: 'Não foi possível consultar o Open Beauty Facts agora.' });
        }
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controle.abort();
    };
  }, [termo]);

  function atualizar(valor: string) {
    setTexto(valor);
    const novos = new URLSearchParams(params);
    if (valor.trim()) novos.set('q', valor.trim());
    else novos.delete('q');
    setParams(novos, { replace: true });
  }

  return (
    <>
      <CabecalhoInterno
        titulo={
          <label className="busca busca--interna">
            {modoScan ? <ScanLine size={18} className="busca__lupa" /> : <Search size={18} className="busca__lupa" />}
            <input
              autoFocus
              type="search"
              inputMode={modoScan ? 'numeric' : 'search'}
              value={texto}
              onChange={(e) => atualizar(e.target.value)}
              placeholder={modoScan ? 'Digite o código de barras (EAN)' : 'O que você está buscando?'}
              aria-label="Buscar produtos"
            />
          </label>
        }
      />

      {!termo && (
        <p className="estado-vazio">
          {modoScan
            ? 'Digite os números do código de barras da embalagem para encontrar o produto.'
            : 'Busque por nome, marca, categoria ou código de barras.'}
        </p>
      )}

      {termo && locais.length > 0 && (
        <section className="secao">
          <h2 className="subtitulo">Na Venancio</h2>
          <div className="grade-produtos">
            {locais.map((p) => (
              <CartaoProduto key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}

      {termo.length >= 3 && (
        <section className="secao">
          <h2 className="subtitulo">
            Mais produtos de beleza e higiene
            {carregando && <Loader2 size={18} className="girando" />}
          </h2>
          {erro && <p className="estado-vazio">{erro}</p>}
          {!carregando && !erro && externos.length === 0 && locais.length === 0 && (
            <p className="estado-vazio">Nenhum produto encontrado para "{termo}".</p>
          )}
          <div className="grade-produtos">
            {externos.map((p) => (
              <CartaoProduto key={p.id} produto={p} />
            ))}
          </div>
          {externos.length > 0 && <p className="fonte-dados">Dados e imagens: Open Beauty Facts (CC BY-SA)</p>}
        </section>
      )}
    </>
  );
}
