import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import { LojaProvider, useLoja } from './context/LojaContext';
import Ajuda from './pages/Ajuda';
import Busca from './pages/Busca';
import Cesta from './pages/Cesta';
import Inicio from './pages/Inicio';
import Lembretes from './pages/Lembretes';
import ListaProdutos from './pages/ListaProdutos';
import Lojas from './pages/Lojas';
import Mais from './pages/Mais';
import Pedidos from './pages/Pedidos';
import Produto from './pages/Produto';
import VenancioMais from './pages/VenancioMais';
import { nomeCategoria, produtosEmOferta, produtosPorCategoria } from './services/catalogo';

function Categoria() {
  const { slug = '' } = useParams();
  return <ListaProdutos titulo={nomeCategoria(slug)} produtos={produtosPorCategoria(slug)} />;
}

function ProdutoPorId() {
  const { id } = useParams();
  return <Produto key={id} />;
}

function Favoritos() {
  const { favoritos } = useLoja();
  return <ListaProdutos titulo="Favoritos" produtos={favoritos} vazio="Toque no coração de um produto para salvá-lo aqui." />;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/ofertas', element: <ListaProdutos titulo="Ofertas" produtos={produtosEmOferta()} /> },
      { path: '/venancio-mais', element: <VenancioMais /> },
      { path: '/lojas', element: <Lojas /> },
      { path: '/mais', element: <Mais /> },
      { path: '/ajuda', element: <Ajuda /> },
      { path: '/busca', element: <Busca /> },
      { path: '/categoria/:slug', element: <Categoria /> },
      { path: '/produto/:id', element: <ProdutoPorId /> },
      { path: '/cesta', element: <Cesta /> },
      { path: '/pedidos', element: <Pedidos /> },
      { path: '/favoritos', element: <Favoritos /> },
      { path: '/lembretes', element: <Lembretes /> },
      { path: '*', element: <ListaProdutos titulo="Página não encontrada" produtos={[]} vazio="Esta página não existe." /> },
    ],
  },
]);

export default function App() {
  return (
    <LojaProvider>
      <RouterProvider router={router} />
    </LojaProvider>
  );
}
