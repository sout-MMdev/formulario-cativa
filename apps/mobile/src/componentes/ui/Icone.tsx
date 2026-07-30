// ================================================================
// ÍCONE (mobile)
// Mesmos traçados do desktop — vêm de @cativa/tema/icones.
// O padrão de tamanho aqui é maior: 20px contra 18px do desktop.
// ================================================================

import { trilhasIcone, type NomeIcone } from "@cativa/tema/icones";

interface PropsIcone {
  nome: NomeIcone;
  tamanho?: number;
  traco?: number;
  className?: string;
}

export function Icone({
  nome,
  tamanho = 20,
  traco = 1.8,
  className = "",
}: PropsIcone) {
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden="true"
      focusable="false"
    >
      <path d={trilhasIcone[nome]} />
    </svg>
  );
}

export type { NomeIcone };
