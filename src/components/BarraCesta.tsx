import { ShoppingBasket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLoja } from '../context/LojaContext';
import { formatarPreco } from '../services/catalogo';

export default function BarraCesta() {
  const { qtdCesta, totalCesta } = useLoja();
  if (qtdCesta === 0) return null;
  return (
    <Link to="/cesta" className="barra-cesta">
      <span className="barra-cesta__icone">
        <ShoppingBasket size={20} />
        <span className="barra-cesta__qtd">{qtdCesta}</span>
      </span>
      <span>Ver cesta</span>
      <strong>{formatarPreco(totalCesta)}</strong>
    </Link>
  );
}
