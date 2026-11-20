export function MarcaV({ tamanho = 34 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={(tamanho * 40) / 48} viewBox="0 0 48 40" aria-hidden="true">
      <path fill="var(--vermelho)" d="M2 3h18l4 7 4-7h18L24 38z" />
      <path fill="#fff" d="M12.3 5.5h3.4v3.6h3.6v3.4h-3.6v3.6h-3.4v-3.6H8.7V9.1h3.6z" />
    </svg>
  );
}

export default function Logo({ slogan = true }: { slogan?: boolean }) {
  return (
    <span className="logo" aria-label="Venancio — saúde é tudo">
      <MarcaV />
      <span className="logo__texto">
        <span className="logo__nome">VENANCIO</span>
        {slogan && <span className="logo__slogan">saúde é tudo</span>}
      </span>
    </span>
  );
}
