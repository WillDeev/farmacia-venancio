import { BellRing, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CabecalhoInterno from '../components/CabecalhoInterno';
import { useLoja } from '../context/LojaContext';

export default function Lembretes() {
  const { lembretes, adicionarLembrete, removerLembrete } = useLoja();
  const [medicamento, setMedicamento] = useState('');
  const [horario, setHorario] = useState('08:00');

  return (
    <>
      <CabecalhoInterno titulo="Lembretes" />
      <section className="secao">
        <p className="texto-suave">Cadastre os horários dos seus medicamentos para não esquecer nenhuma dose.</p>
        <form
          className="form-lembrete"
          onSubmit={(e) => {
            e.preventDefault();
            if (!medicamento.trim()) return;
            adicionarLembrete(medicamento.trim(), horario);
            setMedicamento('');
          }}
        >
          <input value={medicamento} onChange={(e) => setMedicamento(e.target.value)} placeholder="Medicamento" aria-label="Medicamento" />
          <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} aria-label="Horário" />
          <button className="botao-primario">Adicionar</button>
        </form>

        {lembretes.length === 0 ? (
          <div className="estado-vazio">
            <BellRing size={40} />
            <p>Nenhum lembrete cadastrado.</p>
          </div>
        ) : (
          <ul className="cartao menu-lista">
            {lembretes.map((l) => (
              <li key={l.id}>
                <div className="lembrete">
                  <strong>{l.horario}</strong>
                  <span>{l.medicamento}</span>
                  <button className="icone-botao" aria-label={`Remover ${l.medicamento}`} onClick={() => removerLembrete(l.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
