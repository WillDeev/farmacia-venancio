import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BarraCesta from './BarraCesta';
import NavInferior from './NavInferior';

// Telas que ocupam a altura toda, sem a navegação inferior.
const telaCheia = ['/ajuda', '/cesta'];

export default function Layout() {
  const { pathname } = useLocation();
  const cheia = telaCheia.includes(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <main className={cheia ? 'conteudo conteudo--cheio' : 'conteudo'}>
        <Outlet />
      </main>
      {!cheia && (
        <>
          <BarraCesta />
          <NavInferior />
        </>
      )}
    </div>
  );
}
