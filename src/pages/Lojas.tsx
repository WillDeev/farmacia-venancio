import { Clock, Loader2, MapPin } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import Cabecalho from '../components/Cabecalho';
import { lojas } from '../data/lojas';
import { consultarCep, type Endereco } from '../services/catalogo';

export default function Lojas() {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function buscar(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const resultado = await consultarCep(cep);
      setEndereco(resultado ?? null);
      if (!resultado) setErro('CEP não encontrado.');
    } catch {
      setErro('Não foi possível consultar o CEP agora.');
    } finally {
      setCarregando(false);
    }
  }

  // Lojas do mesmo bairro do CEP aparecem primeiro.
  const ordenadas = endereco
    ? [...lojas].sort((a, b) => Number(b.bairro === endereco.bairro) - Number(a.bairro === endereco.bairro))
    : lojas;

  return (
    <>
      <Cabecalho />
      <section className="secao">
        <h1 className="titulo-pagina">Lojas</h1>
        <form className="form-cep" onSubmit={buscar}>
          <input
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            placeholder="Digite seu CEP"
            inputMode="numeric"
            maxLength={9}
            aria-label="CEP"
          />
          <button className="botao-primario" disabled={carregando}>
            {carregando ? <Loader2 size={18} className="girando" /> : 'Buscar'}
          </button>
        </form>
        {erro && <p className="texto-erro">{erro}</p>}
        {endereco && (
          <p className="texto-suave">
            <MapPin size={14} /> {endereco.logradouro}, {endereco.bairro} — {endereco.localidade}/{endereco.uf}
          </p>
        )}

        <ul className="lista-lojas">
          {ordenadas.map((l) => (
            <li key={l.id} className="cartao">
              <strong>{l.nome}</strong>
              {endereco?.bairro === l.bairro && <span className="tag-perto">Perto de você</span>}
              <p>
                {l.endereco} — {l.bairro}
              </p>
              <p className="texto-suave">
                <Clock size={14} /> {l.horario}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
